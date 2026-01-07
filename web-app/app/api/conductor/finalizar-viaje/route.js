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
        const { id_viaje } = body;

        if (!id_viaje) {
            return NextResponse.json({ error: 'ID de viaje requerido' }, { status: 400 });
        }

        // Verify trip belongs to conductor and is in transit
        const [viajes] = await connection.query(`
            SELECT id_conductor, estado, id_ruta FROM viajes WHERE id_viaje = ?
        `, [id_viaje]);

        if (viajes.length === 0 || viajes[0].id_conductor !== user.userId) {
            await connection.rollback();
            return NextResponse.json({ error: 'Viaje no encontrado o no autorizado' }, { status: 404 });
        }

        if (viajes[0].estado !== 'en_transito') {
            await connection.rollback();
            return NextResponse.json({ error: 'El viaje no está en tránsito' }, { status: 400 });
        }

        // Get destination agency
        const [rutas] = await connection.query(`
            SELECT id_agencia_destino FROM rutas WHERE id_ruta = ?
        `, [viajes[0].id_ruta]);

        const id_agencia_destino = rutas[0].id_agencia_destino;

        // Get all shipments in this trip
        const [envios] = await connection.query(`
            SELECT id_envio FROM envio_viaje WHERE id_viaje = ?
        `, [id_viaje]);

        const id_envios = envios.map(e => e.id_envio);

        if (id_envios.length === 0) {
            await connection.rollback();
            return NextResponse.json({
                error: 'No hay envíos asignados a este viaje. El viaje no puede finalizarse sin carga.'
            }, { status: 400 });
        }

        // 1. Update shipments to EN DESTINO (4)
        const placeholders = id_envios.map(() => '?').join(',');
        await connection.query(`
            UPDATE envios
            SET estado_actual = 4
            WHERE id_envio IN (${placeholders})
        `, id_envios);

        // 2. Complete trip
        await connection.query(`
            UPDATE viajes
            SET estado = 'completado',
                fecha_llegada_real = NOW()
            WHERE id_viaje = ?
        `, [id_viaje]);

        // 3. Add tracking events for all shipments
        for (const id_envio of id_envios) {
            await connection.query(`
                INSERT INTO seguimiento_envio (
                    id_envio, id_estado, descripcion_evento,
                    id_agencia, id_responsable, creado_por
                ) VALUES (?, 4, 'Llegó a agencia destino', ?, ?, ?)
            `, [id_envio, id_agencia_destino, user.userId, user.userId]);
        }

        await connection.commit();

        return NextResponse.json({
            success: true,
            message: 'Viaje finalizado exitosamente',
            id_viaje,
            envios_descargados: id_envios.length
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error completing trip:', error);
        return NextResponse.json({ error: 'Error al finalizar viaje' }, { status: 500 });
    } finally {
        connection.release();
    }
}
