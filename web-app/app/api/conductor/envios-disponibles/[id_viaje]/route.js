import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(request, { params }) {
    const user = await getAuthUser();

    if (!user || user.role !== 'Conductor') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        const { id_viaje } = params;

        // First, verify this trip belongs to the conductor
        const [viajes] = await pool.query(`
            SELECT id_conductor, id_ruta FROM viajes WHERE id_viaje = ?
        `, [id_viaje]);

        if (viajes.length === 0 || viajes[0].id_conductor !== user.userId) {
            return NextResponse.json({ error: 'Viaje no encontrado o no autorizado' }, { status: 404 });
        }

        const id_ruta = viajes[0].id_ruta;

        // Get destination agency from route
        const [rutas] = await pool.query(`
            SELECT id_agencia_origen, id_agencia_destino 
            FROM rutas 
            WHERE id_ruta = ?
        `, [id_ruta]);

        if (rutas.length === 0) {
            return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404 });
        }

        const { id_agencia_origen, id_agencia_destino } = rutas[0];

        // Get available shipments for this route
        // Shipments that are:
        // - In origin agency (EN ALMACÉN ORIGEN, estado 2)
        // - Going to the destination agency
        // - Not already assigned to any trip
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
            LEFT JOIN direccion_destino_envio dd ON e.id_envio = dd.id_envio
            WHERE e.id_agencia_origen = ?
            AND e.id_agencia_destino = ?
            AND e.estado_actual = 2
            AND e.id_envio NOT IN (SELECT id_envio FROM envio_viaje)
            ORDER BY e.fecha_registro ASC
        `, [id_agencia_origen, id_agencia_destino]);

        return NextResponse.json({ envios });

    } catch (error) {
        console.error('Error fetching available shipments:', error);
        return NextResponse.json({ error: 'Error al obtener envíos disponibles' }, { status: 500 });
    }
}
