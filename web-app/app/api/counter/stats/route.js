import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getAuthUser();

        if (!user || user.role !== 'Empleado') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        if (!user.agencyId) {
            return NextResponse.json({ error: 'Usuario sin agencia asignada' }, { status: 400 });
        }

        // Recibidos hoy
        const [receivedToday] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM envios 
            WHERE id_agencia_origen = ? 
            AND DATE(fecha_registro) = CURDATE()
        `, [user.agencyId]);

        // Entregados hoy
        const [deliveredToday] = await pool.query(`
            SELECT COUNT(DISTINCT se.id_envio) as count
            FROM seguimiento_envio se
            WHERE se.id_agencia = ?
            AND se.id_estado = (SELECT id_estado FROM estados_envio WHERE nombre = 'Entregado')
            AND DATE(se.fecha_hora) = CURDATE()
        `, [user.agencyId]);

        // Pendientes de recojo (en almacén destino de esta agencia)
        const [pendingPickup] = await pool.query(`
            SELECT COUNT(*) as count
            FROM envios e
            WHERE e.id_agencia_destino = ?
            AND e.estado_actual = (SELECT id_estado FROM estados_envio WHERE nombre = 'En Almacén Destino')
        `, [user.agencyId]);

        // En tránsito (desde esta agencia)
        const [inTransit] = await pool.query(`
            SELECT COUNT(*) as count
            FROM envios e
            WHERE e.id_agencia_origen = ?
            AND e.estado_actual IN (
                SELECT id_estado FROM estados_envio 
                WHERE nombre IN ('En Ruta', 'En Reparto')
            )
        `, [user.agencyId]);

        return NextResponse.json({
            receivedToday: receivedToday[0].count,
            deliveredToday: deliveredToday[0].count,
            pendingPickup: pendingPickup[0].count,
            inTransit: inTransit[0].count
        });

    } catch (error) {
        console.error('Error fetching counter stats:', error);
        return NextResponse.json({
            error: 'Error al obtener estadísticas',
            details: error.message
        }, { status: 500 });
    }
}
