import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(request, { params }) {
    const user = await getAuthUser();

    if (!user || user.role !== 'Empleado') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        const { codigo } = params;

        // Get shipment details
        const [envios] = await pool.query(`
            SELECT 
                e.id_envio,
                e.codigo_seguimiento,
                e.estado_actual,
                est.nombre as estado_nombre,
                e.fecha_registro,
                e.costo_envio_total,
                CONCAT(ur.nombres, ' ', ur.apellidos) as remitente,
                dd.nombre_destinatario as destinatario,
                dd.telefono as destinatario_telefono,
                dd.direccion as destinatario_direccion,
                ao.nombre as agencia_origen,
                ad.nombre as agencia_destino
            FROM envios e
            LEFT JOIN estados_envio est ON e.estado_actual = est.id_estado
            LEFT JOIN usuarios ur ON e.id_usuario_remitente = ur.id_usuario
            LEFT JOIN direccion_destino_envio dd ON e.id_envio = dd.id_envio
            LEFT JOIN agencias ao ON e.id_agencia_origen = ao.id_agencia
            LEFT JOIN agencias ad ON e.id_agencia_destino = ad.id_agencia
            WHERE e.codigo_seguimiento = ?
        `, [codigo]);

        if (envios.length === 0) {
            return NextResponse.json({ error: 'Envío no encontrado' }, { status: 404 });
        }

        const envio = envios[0];

        // Get packages
        const [paquetes] = await pool.query(`
            SELECT 
                id_paquete,
                tipo_paquete,
                peso_kg,
                descripcion_contenido,
                fragil,
                valor_declarado,
                largo_cm,
                ancho_cm,
                alto_cm
            FROM paquetes
            WHERE id_envio = ?
            ORDER BY id_paquete
        `, [envio.id_envio]);

        return NextResponse.json({
            envio,
            paquetes
        });

    } catch (error) {
        console.error('Error fetching shipment:', error);
        return NextResponse.json({ error: 'Error al consultar envío' }, { status: 500 });
    }
}
