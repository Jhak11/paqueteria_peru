import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
    const user = await getAuthUser();

    if (!user || user.role !== 'Conductor') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        // Get the conductor's assigned trip that is 'programado'
        const [viajes] = await pool.query(`
            SELECT 
                v.id_viaje,
                v.id_ruta,
                v.id_vehiculo,
                v.fecha_salida,
                v.fecha_llegada_estimada,
                v.estado,
                CONCAT(ao.nombre, ' → ', ad.nombre) as ruta,
                ao.nombre as origen,
                ad.nombre as destino,
                veh.placa as vehiculo_placa,
                veh.marca as vehiculo_marca,
                veh.modelo as vehiculo_modelo
            FROM viajes v
            JOIN rutas r ON v.id_ruta = r.id_ruta
            JOIN agencias ao ON r.id_agencia_origen = ao.id_agencia
            JOIN agencias ad ON r.id_agencia_destino = ad.id_agencia
            JOIN vehiculos veh ON v.id_vehiculo = veh.id_vehiculo
            WHERE v.id_conductor = ?
            AND v.estado = 'programado'
            ORDER BY v.fecha_salida ASC
            LIMIT 1
        `, [user.userId]);

        if (viajes.length === 0) {
            return NextResponse.json({ viaje: null });
        }

        return NextResponse.json({ viaje: viajes[0] });

    } catch (error) {
        console.error('Error fetching assigned trip:', error);
        return NextResponse.json({ error: 'Error al obtener viaje asignado' }, { status: 500 });
    }
}
