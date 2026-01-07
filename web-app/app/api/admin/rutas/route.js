import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [rutas] = await pool.query(`
            SELECT 
                r.id_ruta,
                r.id_agencia_origen,
                r.id_agencia_destino,
                r.distancia_km,
                r.tiempo_estimado_min,
                r.tipo,
                ao.nombre AS agencia_origen,
                ad.nombre AS agencia_destino,
                uo.departamento AS depto_origen,
                ud.departamento AS depto_destino
            FROM rutas r
            LEFT JOIN agencias ao ON r.id_agencia_origen = ao.id_agencia
            LEFT JOIN agencias ad ON r.id_agencia_destino = ad.id_agencia
            LEFT JOIN ubigeo uo ON ao.id_ubigeo = uo.id_ubigeo
            LEFT JOIN ubigeo ud ON ad.id_ubigeo = ud.id_ubigeo
            ORDER BY r.tipo DESC, ao.nombre, ad.nombre
        `);

        return NextResponse.json(rutas);
    } catch (error) {
        console.error('Error fetching rutas:', error);
        return NextResponse.json(
            { error: 'Error al obtener las rutas' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo } = body;

        // Validaciones
        if (!id_agencia_origen || !id_agencia_destino || !distancia_km || !tiempo_estimado_min) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos' },
                { status: 400 }
            );
        }

        // Validar que origen y destino sean diferentes
        if (id_agencia_origen === id_agencia_destino) {
            return NextResponse.json(
                { error: 'La agencia de origen y destino deben ser diferentes' },
                { status: 400 }
            );
        }

        // Validar que distancia y tiempo sean positivos
        if (distancia_km <= 0 || tiempo_estimado_min <= 0) {
            return NextResponse.json(
                { error: 'La distancia y el tiempo deben ser mayores a 0' },
                { status: 400 }
            );
        }

        // Validar que no exista una ruta duplicada
        const [existing] = await pool.query(
            'SELECT id_ruta FROM rutas WHERE id_agencia_origen = ? AND id_agencia_destino = ?',
            [id_agencia_origen, id_agencia_destino]
        );

        if (existing.length > 0) {
            return NextResponse.json(
                { error: 'Ya existe una ruta entre estas agencias' },
                { status: 409 }
            );
        }

        const [result] = await pool.query(
            `INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo)
             VALUES (?, ?, ?, ?, ?)`,
            [id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo || 'principal']
        );

        return NextResponse.json(
            { success: true, id_ruta: result.insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating ruta:', error);
        return NextResponse.json(
            { error: 'Error al crear la ruta' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id_ruta, distancia_km, tiempo_estimado_min, tipo } = body;

        if (!id_ruta) {
            return NextResponse.json(
                { error: 'ID de ruta requerido' },
                { status: 400 }
            );
        }

        // Validar que distancia y tiempo sean positivos si se proporcionan
        if ((distancia_km && distancia_km <= 0) || (tiempo_estimado_min && tiempo_estimado_min <= 0)) {
            return NextResponse.json(
                { error: 'La distancia y el tiempo deben ser mayores a 0' },
                { status: 400 }
            );
        }

        const updates = [];
        const values = [];

        if (distancia_km) {
            updates.push('distancia_km = ?');
            values.push(distancia_km);
        }
        if (tiempo_estimado_min) {
            updates.push('tiempo_estimado_min = ?');
            values.push(tiempo_estimado_min);
        }
        if (tipo) {
            updates.push('tipo = ?');
            values.push(tipo);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: 'No hay campos para actualizar' },
                { status: 400 }
            );
        }

        values.push(id_ruta);

        await pool.query(
            `UPDATE rutas SET ${updates.join(', ')} WHERE id_ruta = ?`,
            values
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating ruta:', error);
        return NextResponse.json(
            { error: 'Error al actualizar la ruta' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id_ruta = searchParams.get('id');

        if (!id_ruta) {
            return NextResponse.json(
                { error: 'ID de ruta requerido' },
                { status: 400 }
            );
        }

        // Obtener información de la ruta para eliminar tarifas
        const [ruta] = await pool.query(`
            SELECT r.*, ao.id_ubigeo as ubigeo_origen, ad.id_ubigeo as ubigeo_destino
            FROM rutas r
            LEFT JOIN agencias ao ON r.id_agencia_origen = ao.id_agencia
            LEFT JOIN agencias ad ON r.id_agencia_destino = ad.id_agencia
            WHERE r.id_ruta = ?
        `, [id_ruta]);

        if (ruta.length === 0) {
            return NextResponse.json(
                { error: 'Ruta no encontrada' },
                { status: 404 }
            );
        }

        // Obtener departamentos
        const [ubigeoOrigen] = await pool.query('SELECT departamento FROM ubigeo WHERE id_ubigeo = ?', [ruta[0].ubigeo_origen]);
        const [ubigeoDestino] = await pool.query('SELECT departamento FROM ubigeo WHERE id_ubigeo = ?', [ruta[0].ubigeo_destino]);

        // Iniciar transacción
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Eliminar tarifas asociadas a esta ruta
            if (ubigeoOrigen.length > 0 && ubigeoDestino.length > 0) {
                await connection.query(
                    'DELETE FROM tarifas WHERE departamento_origen = ? AND departamento_destino = ?',
                    [ubigeoOrigen[0].departamento, ubigeoDestino[0].departamento]
                );
            }

            // Verificar si hay viajes activos con esta ruta
            const [viajesActivos] = await connection.query(
                "SELECT COUNT(*) as total FROM viajes WHERE id_ruta = ? AND estado IN ('programado', 'en_transito')",
                [id_ruta]
            );

            if (viajesActivos[0].total > 0) {
                await connection.rollback();
                connection.release();
                return NextResponse.json(
                    { error: `No se puede eliminar: hay ${viajesActivos[0].total} viaje(s) activo(s) usando esta ruta` },
                    { status: 409 }
                );
            }

            // Eliminar la ruta
            await connection.query('DELETE FROM rutas WHERE id_ruta = ?', [id_ruta]);

            await connection.commit();
            connection.release();

            return NextResponse.json({
                success: true,
                message: 'Ruta y tarifas asociadas eliminadas correctamente'
            });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Error deleting ruta:', error);
        return NextResponse.json(
            { error: 'Error al eliminar la ruta' },
            { status: 500 }
        );
    }
}
