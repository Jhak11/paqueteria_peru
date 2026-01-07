import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Listar viajes
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const estado = searchParams.get('estado');

        let query = `
            SELECT 
                v.id_viaje,
                v.id_ruta,
                v.id_vehiculo,
                v.id_conductor,
                v.fecha_salida,
                v.fecha_llegada_estimada,
                v.fecha_llegada_real,
                v.estado,
                veh.placa AS placa_vehiculo,
                CONCAT(u.nombres, ' ', u.apellidos) AS nombre_conductor,
                ao.nombre AS agencia_origen,
                ad.nombre AS agencia_destino,
                r.distancia_km
            FROM viajes v
            LEFT JOIN vehiculos veh ON v.id_vehiculo = veh.id_vehiculo
            LEFT JOIN usuarios u ON v.id_conductor = u.id_usuario
            LEFT JOIN rutas r ON v.id_ruta = r.id_ruta
            LEFT JOIN agencias ao ON r.id_agencia_origen = ao.id_agencia
            LEFT JOIN agencias ad ON r.id_agencia_destino = ad.id_agencia
        `;

        const params = [];
        if (estado && estado !== 'all') {
            query += ' WHERE v.estado = ?';
            params.push(estado);
        }

        query += ' ORDER BY v.fecha_salida DESC';

        const [viajes] = await pool.query(query, params);

        return NextResponse.json(viajes);
    } catch (error) {
        console.error('Error fetching viajes:', error);
        return NextResponse.json(
            { error: 'Error al obtener los viajes' },
            { status: 500 }
        );
    }
}

// POST - Crear nuevo viaje
export async function POST(request) {
    try {
        const body = await request.json();
        const { id_ruta, id_vehiculo, id_conductor, fecha_salida, fecha_llegada_estimada } = body;

        if (!id_ruta || !id_vehiculo || !id_conductor || !fecha_salida || !fecha_llegada_estimada) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos' },
                { status: 400 }
            );
        }

        // Validar que fecha_salida < fecha_llegada_estimada
        if (new Date(fecha_salida) >= new Date(fecha_llegada_estimada)) {
            return NextResponse.json(
                { error: 'La fecha de salida debe ser anterior a la fecha de llegada estimada' },
                { status: 400 }
            );
        }

        // Verificar que el vehículo no esté en otro viaje activo
        const [viajesActivos] = await pool.query(
            `SELECT COUNT(*) as total FROM viajes 
             WHERE id_vehiculo = ? 
             AND estado IN ('programado', 'en_transito')
             AND (
                 (fecha_salida BETWEEN ? AND ?) OR
                 (fecha_llegada_estimada BETWEEN ? AND ?) OR
                 (? BETWEEN fecha_salida AND fecha_llegada_estimada)
             )`,
            [id_vehiculo, fecha_salida, fecha_llegada_estimada, fecha_salida, fecha_llegada_estimada, fecha_salida]
        );

        if (viajesActivos[0].total > 0) {
            return NextResponse.json(
                { error: 'El vehículo ya está asignado a otro viaje en ese rango de fechas' },
                { status: 409 }
            );
        }

        const [result] = await pool.query(
            `INSERT INTO viajes (id_ruta, id_vehiculo, id_conductor, fecha_salida, fecha_llegada_estimada, estado)
             VALUES (?, ?, ?, ?, ?, 'programado')`,
            [id_ruta, id_vehiculo, id_conductor, fecha_salida, fecha_llegada_estimada]
        );

        return NextResponse.json(
            { success: true, id_viaje: result.insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating viaje:', error);
        return NextResponse.json(
            { error: 'Error al crear el viaje' },
            { status: 500 }
        );
    }
}

// PATCH - Actualizar estado del viaje
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id_viaje, estado, fecha_llegada_real } = body;

        if (!id_viaje || !estado) {
            return NextResponse.json(
                { error: 'ID de viaje y estado requeridos' },
                { status: 400 }
            );
        }

        // Validar estado
        const estadosValidos = ['programado', 'en_transito', 'completado', 'cancelado'];
        if (!estadosValidos.includes(estado)) {
            return NextResponse.json(
                { error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}` },
                { status: 400 }
            );
        }

        let query = 'UPDATE viajes SET estado = ?';
        const params = [estado];

        // Si el estado es completado, requerir fecha de llegada real
        if (estado === 'completado') {
            if (!fecha_llegada_real) {
                return NextResponse.json(
                    { error: 'Se requiere fecha de llegada real para marcar como completado' },
                    { status: 400 }
                );
            }
            query += ', fecha_llegada_real = ?';
            params.push(fecha_llegada_real);
        }

        query += ' WHERE id_viaje = ?';
        params.push(id_viaje);

        await pool.query(query, params);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating viaje:', error);
        return NextResponse.json(
            { error: 'Error al actualizar el viaje' },
            { status: 500 }
        );
    }
}
