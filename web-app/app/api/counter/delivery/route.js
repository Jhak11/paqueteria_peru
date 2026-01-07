import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(request) {
    const connection = await pool.getConnection();

    try {
        const user = await getAuthUser();

        if (!user || user.role !== 'Empleado') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        if (!user.agencyId) {
            return NextResponse.json({ error: 'Usuario sin agencia asignada' }, { status: 400 });
        }

        const body = await request.json();
        const { codigo_seguimiento, documento_destinatario } = body;

        if (!codigo_seguimiento || !documento_destinatario) {
            return NextResponse.json({
                error: 'Código de seguimiento y documento son requeridos'
            }, { status: 400 });
        }

        await connection.beginTransaction();

        // Verificar que el paquete existe y está en esta agencia
        const [envios] = await connection.query(`
            SELECT 
                e.id_envio,
                e.id_agencia_destino,
                e.estado_actual,
                dd.numero_documento,
                es.nombre as estado_nombre
            FROM envios e
            LEFT JOIN direccion_destino_envio dd ON e.id_envio = dd.id_envio
            JOIN estados_envio es ON e.estado_actual = es.id_estado
            WHERE e.codigo_seguimiento = ?
        `, [codigo_seguimiento]);

        if (envios.length === 0) {
            await connection.rollback();
            return NextResponse.json({
                error: 'Envío no encontrado'
            }, { status: 404 });
        }

        const envio = envios[0];

        // Verificar que está en esta agencia
        if (envio.id_agencia_destino !== user.agencyId) {
            await connection.rollback();
            return NextResponse.json({
                error: 'Este paquete no está en esta agencia'
            }, { status: 403 });
        }

        // Verificar que está en estado correcto
        if (envio.estado_nombre !== 'En Almacén Destino') {
            await connection.rollback();
            return NextResponse.json({
                error: `El paquete no está listo para entrega. Estado actual: ${envio.estado_nombre}`
            }, { status: 400 });
        }

        // Verificar documento del destinatario
        if (envio.numero_documento && envio.numero_documento !== documento_destinatario) {
            await connection.rollback();
            return NextResponse.json({
                error: 'El documento no coincide con el destinatario'
            }, { status: 400 });
        }

        // Obtener ID del estado "Entregado"
        const [estadoEntregado] = await connection.query(`
            SELECT id_estado FROM estados_envio WHERE nombre = 'Entregado'
        `);

        if (estadoEntregado.length === 0) {
            await connection.rollback();
            return NextResponse.json({
                error: 'Error de configuración: estado Entregado no existe'
            }, { status: 500 });
        }

        const idEstadoEntregado = estadoEntregado[0].id_estado;

        // Actualizar envío
        await connection.query(`
            UPDATE envios 
            SET estado_actual = ?,
                fecha_entrega = NOW()
            WHERE id_envio = ?
        `, [idEstadoEntregado, envio.id_envio]);

        // Registrar en seguimiento
        await connection.query(`
            INSERT INTO seguimiento_envio (
                id_envio,
                id_estado,
                id_agencia,
                id_responsable,
                descripcion_evento
            ) VALUES (?, ?, ?, ?, ?)
        `, [
            envio.id_envio,
            idEstadoEntregado,
            user.agencyId,
            user.userId,
            'Paquete entregado en agencia'
        ]);

        await connection.commit();

        return NextResponse.json({
            success: true,
            message: 'Paquete entregado correctamente',
            codigo_seguimiento
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al entregar paquete:', error);
        return NextResponse.json({
            error: 'Error al procesar entrega',
            details: error.message
        }, { status: 500 });
    } finally {
        connection.release();
    }
}
