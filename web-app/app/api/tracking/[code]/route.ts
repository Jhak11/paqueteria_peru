
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(
    request: Request,
    { params }: { params: { code: string } }
) {
    const code = params.code;

    try {
        const [envios] = await pool.query<RowDataPacket[]>(`
            SELECT 
                e.*, 
                ao.nombre as origen,
                ad.nombre as destino,
                u_rem.nombres as remitente_nombres,
                u_rem.apellidos as remitente_apellidos,
                u_dest.nombres as destinatario_nombres,
                u_dest.apellidos as destinatario_apellidos
            FROM envios e
            JOIN agencias ao ON e.id_agencia_origen = ao.id_agencia
            JOIN agencias ad ON e.id_agencia_destino = ad.id_agencia
            JOIN usuarios u_rem ON e.id_usuario_remitente = u_rem.id_usuario
            LEFT JOIN usuarios u_dest ON e.id_usuario_destinatario = u_dest.id_usuario
            WHERE e.codigo_seguimiento = ?
        `, [code]);

        if (envios.length === 0) {
            return NextResponse.json({ error: 'Envío no encontrado' }, { status: 404 });
        }

        const envio = envios[0];

        // Mapeo de estado (si no tenemos la tabla estados_envio cargada en memoria, usamos DB o array fijo)
        // Por seguridad, hagamos un LEFT JOIN con estados_envio en el futuro, pero aquí un array base funciona.
        const estados = ['Registrado', 'En Almacén Origen', 'En Ruta', 'En Almacén Destino', 'En Reparto', 'Entregado'];
        const estadoTexto = estados[envio.estado_actual - 1] || 'En Proceso';

        // CORRECCIÓN: Usar la tabla 'seguimiento_envio' en lugar de 'historial_envios'
        const [historial] = await pool.query<RowDataPacket[]>(`
            SELECT 
                se.*,
                ee.nombre as nombre_estado,
                a.nombre as nombre_agencia,
                se.descripcion_evento as descripcion
            FROM seguimiento_envio se
            LEFT JOIN estados_envio ee ON se.id_estado = ee.id_estado
            LEFT JOIN agencias a ON se.id_agencia = a.id_agencia
            WHERE se.id_envio = ?
            ORDER BY se.fecha_hora DESC
        `, [envio.id_envio]);

        const historialFormateado = historial.map((h: any) => ({
            fecha_hora: h.fecha_hora,
            estado: h.nombre_estado || 'Actualización',
            descripcion_evento: h.descripcion || `Estado actualizado a ${h.nombre_estado}`,
            ubicacion: h.nombre_agencia || 'En tránsito'
        }));

        // Si no hay historial (recién creado), simulamos el registro con datos del envío
        if (historialFormateado.length === 0) {
            historialFormateado.push({
                fecha_hora: envio.fecha_registro,
                estado: 'Registrado',
                descripcion_evento: 'El envío ha sido registrado en el sistema.',
                ubicacion: envio.origen
            });
        }

        return NextResponse.json({
            info: {
                ...envio,
                estado_actual: estadoTexto
            },
            historial: historialFormateado
        });

    } catch (error) {
        console.error('Error al obtener tracking:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
