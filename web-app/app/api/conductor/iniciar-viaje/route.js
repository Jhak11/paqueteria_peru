import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(request) {
    const user = await getAuthUser();

    if (!user || user.role !== 'Conductor') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const body = await request.json();
        const { id_viaje, id_envios } = body;

        if (!id_viaje || !id_envios || id_envios.length === 0) {
            return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        // Verify trip belongs to conductor
        const [viajes] = await connection.query(`
            SELECT id_conductor, estado FROM viajes WHERE id_viaje = ?
        `, [id_viaje]);

        if (viajes.length === 0 || viajes[0].id_conductor !== user.userId) {
            await connection.rollback();
            return NextResponse.json({ error: 'Viaje no encontrado o no autorizado' }, { status: 404 });
        }

        if (viajes[0].estado !== 'programado') {
            await connection.rollback();
            return NextResponse.json({ error: 'El viaje ya ha sido iniciado' }, { status: 400 });
        }

        // 1. Assign shipments to trip
        for (const id_envio of id_envios) {
            await connection.query(`
                INSERT INTO envio_viaje (id_envio, id_viaje)
                VALUES (?, ?)
            `, [id_envio, id_viaje]);
        }

        // 2. Update shipment status to EN RUTA (3)
        const placeholders = id_envios.map(() => '?').join(',');
        await connection.query(`
            UPDATE envios 
            SET estado_actual = 3
            WHERE id_envio IN (${placeholders})
        `, id_envios);

        // 3. Start trip (set to 'en_transito')
        await connection.query(`
            UPDATE viajes
            SET estado = 'en_transito',
                fecha_salida = NOW()
            WHERE id_viaje = ?
        `, [id_viaje]);

        // 4. Add tracking events for each shipment
        for (const id_envio of id_envios) {
            await connection.query(`
                INSERT INTO seguimiento_envio (
                    id_envio, id_estado, descripcion_evento, 
                    id_responsable, creado_por
                ) VALUES (?, 3, 'En ruta hacia agencia destino', ?, ?)
            `, [id_envio, user.userId, user.userId]);
        }

        await connection.commit();

        return NextResponse.json({
            success: true,
            message: 'Viaje iniciado exitosamente',
            id_viaje,
            envios_cargados: id_envios.length
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error starting trip:', error);
        return NextResponse.json({ error: 'Error al iniciar viaje' }, { status: 500 });
    } finally {
        connection.release();
    }
}
