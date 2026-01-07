import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// POST - Asignar envíos a un viaje
export async function POST(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { envios } = body; // Array de IDs de envíos

        if (!envios || !Array.isArray(envios) || envios.length === 0) {
            return NextResponse.json(
                { error: 'Se requiere un array de IDs de envíos' },
                { status: 400 }
            );
        }

        // Verificar que el viaje existe y está en estado programado
        const [viaje] = await pool.query(
            'SELECT estado FROM viajes WHERE id_viaje = ?',
            [id]
        );

        if (viaje.length === 0) {
            return NextResponse.json(
                { error: 'Viaje no encontrado' },
                { status: 404 }
            );
        }

        if (viaje[0].estado !== 'programado') {
            return NextResponse.json(
                { error: 'Solo se pueden asignar envíos a viajes programados' },
                { status: 400 }
            );
        }

        // Insertar las asignaciones
        const values = envios.map(id_envio => [id_envio, id]);

        await pool.query(
            'INSERT IGNORE INTO envio_viaje (id_envio, id_viaje) VALUES ?',
            [values]
        );

        return NextResponse.json({
            success: true,
            assigned: envios.length
        });
    } catch (error) {
        console.error('Error asignando envíos:', error);
        return NextResponse.json(
            { error: 'Error al asignar envíos al viaje' },
            { status: 500 }
        );
    }
}

// GET - Obtener envíos asignados a un viaje
export async function GET(request, { params }) {
    try {
        const { id } = params;

        const [envios] = await pool.query(`
            SELECT 
                e.id_envio,
                e.codigo_seguimiento,
                e.estado_actual,
                CONCAT(u.nombres, ' ', u.apellidos) AS remitente,
                ao.nombre AS agencia_origen,
                ad.nombre AS agencia_destino
            FROM envio_viaje ev
            INNER JOIN envios e ON ev.id_envio = e.id_envio
            LEFT JOIN usuarios u ON e.id_usuario_remitente = u.id_usuario
            LEFT JOIN agencias ao ON e.id_agencia_origen = ao.id_agencia
            LEFT JOIN agencias ad ON e.id_agencia_destino = ad.id_agencia
            WHERE ev.id_viaje = ?
        `, [id]);

        return NextResponse.json(envios);
    } catch (error) {
        console.error('Error obteniendo envíos:', error);
        return NextResponse.json(
            { error: 'Error al obtener los envíos del viaje' },
            { status: 500 }
        );
    }
}

// DELETE - Desasignar envío de un viaje  
export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const id_envio = searchParams.get('envio');

        if (!id_envio) {
            return NextResponse.json(
                { error: 'ID de envío requerido' },
                { status: 400 }
            );
        }

        await pool.query(
            'DELETE FROM envio_viaje WHERE id_viaje = ? AND id_envio = ?',
            [id, id_envio]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error desasignando envío:', error);
        return NextResponse.json(
            { error: 'Error al desasignar el envío' },
            { status: 500 }
        );
    }
}
