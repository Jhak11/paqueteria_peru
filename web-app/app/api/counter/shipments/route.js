import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'Empleado') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
        }

        const [shipments] = await pool.query(`
            SELECT 
                e.id_envio,
                e.codigo_seguimiento,
                e.estado_actual,
                es.nombre as estado_nombre,
                e.id_agencia_destino,
                a.nombre as agencia_destino,
                e.costo_envio_total,
                -- Remitente
                CONCAT(ur.nombres, ' ', ur.apellidos) as remitente_nombre,
                ur.telefono as remitente_telefono,
                -- Destinatario
                dd.nombre_destinatario,
                dd.telefono as destinatario_telefono,
                dd.direccion as destinatario_direccion,
                -- Paquetes
                (SELECT COUNT(*) FROM paquetes WHERE id_envio = e.id_envio) as paquetes_cantidad,
                (SELECT GROUP_CONCAT(CONCAT(tipo_paquete, ' (', peso_kg, 'kg)')) FROM paquetes WHERE id_envio = e.id_envio) as paquetes_descripcion
            FROM envios e
            JOIN usuarios ur ON e.id_usuario_remitente = ur.id_usuario
            JOIN estados_envio es ON e.estado_actual = es.id_estado
            JOIN agencias a ON e.id_agencia_destino = a.id_agencia
            LEFT JOIN direccion_destino_envio dd ON e.id_envio = dd.id_envio
            WHERE e.codigo_seguimiento = ?
        `, [code]);

        if (shipments.length === 0) {
            return NextResponse.json({ error: 'Envío no encontrado' }, { status: 404 });
        }

        const shipment = shipments[0];

        // Validar si pertenece a la agencia del usuario (opcional, pero útil para advertencias)
        const isDestinationAgency = shipment.id_agencia_destino === user.agencyId;

        return NextResponse.json({
            shipment: {
                ...shipment,
                is_at_correct_agency: isDestinationAgency
            }
        });

    } catch (error) {
        console.error('Error searching shipment:', error);
        return NextResponse.json({ error: 'Error al buscar envío' }, { status: 500 });
    }
}
