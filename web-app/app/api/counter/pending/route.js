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

        // Paquetes pendientes de recojo en esta agencia
        const [packages] = await pool.query(`
            SELECT 
                e.codigo_seguimiento,
                e.id_envio,
                dd.nombre_destinatario,
                dd.telefono,
                e.fecha_registro,
                (SELECT MAX(fecha_hora) FROM seguimiento_envio WHERE id_envio = e.id_envio) as fecha_llegada,
                (SELECT COUNT(*) FROM paquetes WHERE id_envio = e.id_envio) as paquetes_count
            FROM envios e
            LEFT JOIN direccion_destino_envio dd ON e.id_envio = dd.id_envio
            WHERE e.id_agencia_destino = ?
            AND e.estado_actual = (SELECT id_estado FROM estados_envio WHERE nombre = 'En Almacén Destino')
            ORDER BY fecha_llegada DESC
            LIMIT 20
        `, [user.agencyId]);

        return NextResponse.json({
            packages: packages.map(p => ({
                codigo_seguimiento: p.codigo_seguimiento,
                destinatario: p.nombre_destinatario || 'Sin nombre',
                telefono: p.telefono || 'Sin teléfono',
                fecha_llegada: p.fecha_llegada,
                paquetes_count: p.paquetes_count
            }))
        });

    } catch (error) {
        console.error('Error fetching pending packages:', error);
        return NextResponse.json({
            error: 'Error al obtener paquetes pendientes',
            details: error.message
        }, { status: 500 });
    }
}
