import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
    const user = await getAuthUser();

    if (!user || user.role !== 'Conductor') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        // Get conductor's current trip in transit
        const [viajes] = await pool.query(`
            SELECT 
                v.id_viaje,
                v.fecha_salida,
                v.fecha_llegada_estimada,
                v.estado,
                CONCAT(ao.nombre, ' → ', ad.nombre) as ruta,
                ao.nombre as origen,
                ad.nombre as destino,
                ad.id_agencia as id_agencia_destino,
                veh.placa as vehiculo_placa,
                veh.marca as vehiculo_marca,
                veh.modelo as vehiculo_modelo
            FROM viajes v
            JOIN rutas r ON v.id_ruta = r.id_ruta
            JOIN agencias ao ON r.id_agencia_origen = ao.id_agencia
            JOIN agencias ad ON r.id_agencia_destino = ad.id_agencia
            JOIN vehiculos veh ON v.id_vehiculo = veh.id_vehiculo
            WHERE v.id_conductor = ?
            AND v.estado = 'en_transito'
            LIMIT 1
        `, [user.userId]);

        if (viajes.length === 0) {
            return NextResponse.json({ viaje: null });
        }

        const viaje = viajes[0];

        // Get loaded shipments
        const [envios] = await pool.query(`
            SELECT 
                e.id_envio,
                e.codigo_seguimiento,
                dd.nombre_destinatario as destinatario,
                dd.direccion as destino_direccion,
                dd.telefono as destino_telefono,
                (SELECT SUM(peso_kg) FROM paquetes WHERE id_envio = e.id_envio) as peso_total,
                (SELECT COUNT(*) FROM paquetes WHERE id_envio = e.id_envio) as num_paquetes
            FROM envios e
            JOIN envio_viaje ev ON e.id_envio = ev.id_envio
            LEFT JOIN direccion_destino_envio dd ON e.id_envio = dd.id_envio
            WHERE ev.id_viaje = ?
            ORDER BY e.codigo_seguimiento
        `, [viaje.id_viaje]);

        return NextResponse.json({
            viaje,
            envios
        });

    } catch (error) {
        console.error('Error fetching current trip:', error);
        return NextResponse.json({ error: 'Error al obtener viaje actual' }, { status: 500 });
    }
}
