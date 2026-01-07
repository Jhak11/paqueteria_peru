import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// POST - Get detailed tracking for authenticated client
export async function POST(request) {
    try {
        const user = await getAuthUser();

        if (!user || user.role !== 'Cliente') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { codigo } = body;

        if (!codigo) {
            return NextResponse.json({ error: 'Código de seguimiento requerido' }, { status: 400 });
        }

        // Get shipment data - verify ownership
        const [envios] = await pool.query(`
            SELECT 
                e.codigo_seguimiento,
                e.fecha_registro,
                e.fecha_estimada_entrega,
                e.fecha_entrega,
                e.costo_envio_total,
                e.valor_declarado_total,
                es.nombre AS estado_actual,
                a_orig.nombre AS agencia_origen,
                a_dest.nombre AS agencia_destino,
                dd.nombre_destinatario,
                dd.direccion AS direccion_destino,
                dd.telefono AS telefono_destino,
                CONCAT(ub_dest.distrito, ', ', ub_dest.provincia, ', ', ub_dest.departamento) AS ubigeo_destino,
                e.id_envio
            FROM envios e
            JOIN estados_envio es ON e.estado_actual = es.id_estado
            JOIN agencias a_orig ON e.id_agencia_origen = a_orig.id_agencia
            JOIN agencias a_dest ON e.id_agencia_destino = a_dest.id_agencia
            LEFT JOIN direccion_destino_envio dd ON e.id_envio = dd.id_envio
            LEFT JOIN ubigeo ub_dest ON dd.id_ubigeo = ub_dest.id_ubigeo
            WHERE e.codigo_seguimiento = ?
            AND (e.id_usuario_remitente = ? OR e.id_usuario_destinatario = ?)
        `, [codigo, user.userId, user.userId]);

        if (envios.length === 0) {
            return NextResponse.json({
                error: 'No tienes autorización para ver este envío o no existe'
            }, { status: 403 });
        }

        const envio = envios[0];
        const idEnvio = envio.id_envio;

        // Get tracking history
        const [historial] = await pool.query(`
            SELECT 
                h.fecha_hora,
                e.nombre AS estado,
                h.descripcion_evento,
                CASE 
                    WHEN h.id_agencia IS NOT NULL THEN (
                        SELECT nombre FROM agencias WHERE id_agencia = h.id_agencia
                    )
                    WHEN h.id_ubigeo IS NOT NULL THEN (
                        SELECT CONCAT(distrito, ', ', provincia, ', ', departamento) 
                        FROM ubigeo WHERE id_ubigeo = h.id_ubigeo
                    )
                    ELSE 'En tránsito'
                END AS ubicacion
            FROM seguimiento_envio h
            JOIN estados_envio e ON h.id_estado = e.id_estado
            WHERE h.id_envio = ?
            ORDER BY h.fecha_hora DESC
        `, [idEnvio]);

        // Get packages
        const [paquetes] = await pool.query(`
            SELECT 
                tipo_paquete,
                descripcion_contenido,
                peso_kg,
                CONCAT(largo_cm, ' x ', ancho_cm, ' x ', alto_cm, ' cm') AS dimensiones,
                fragil,
                valor_declarado
            FROM paquetes
            WHERE id_envio = ?
        `, [idEnvio]);

        // Remove id_envio from response
        delete envio.id_envio;

        const response = {
            envio,
            historial,
            paquetes
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error in tracking API:', error);
        return NextResponse.json({
            error: 'Error del servidor',
            details: error.message
        }, { status: 500 });
    }
}
