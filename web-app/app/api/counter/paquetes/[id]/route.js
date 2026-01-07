import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(request, { params }) {
    const user = await getAuthUser();

    if (!user || user.role !== 'Empleado') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        const { id } = params;
        const body = await request.json();
        const { descripcion_contenido } = body;

        if (!descripcion_contenido) {
            return NextResponse.json({ error: 'Descripción requerida' }, { status: 400 });
        }

        await pool.query(`
            UPDATE paquetes 
            SET descripcion_contenido = ?
            WHERE id_paquete = ?
        `, [descripcion_contenido, id]);

        return NextResponse.json({
            success: true,
            message: 'Descripción actualizada correctamente'
        });

    } catch (error) {
        console.error('Error updating package:', error);
        return NextResponse.json({ error: 'Error al actualizar paquete' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const user = await getAuthUser();

    if (!user || user.role !== 'Empleado') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const connection = await pool.getConnection();

    try {
        const { id } = params;

        // Get id_envio for this package
        const [paquetes] = await connection.query(`
            SELECT id_envio FROM paquetes WHERE id_paquete = ?
        `, [id]);

        if (paquetes.length === 0) {
            return NextResponse.json({ error: 'Paquete no encontrado' }, { status: 404 });
        }

        const idEnvio = paquetes[0].id_envio;

        // Check if this is the last package
        const [count] = await connection.query(`
            SELECT COUNT(*) as total FROM paquetes WHERE id_envio = ?
        `, [idEnvio]);

        if (count[0].total <= 1) {
            return NextResponse.json({
                error: 'No se puede eliminar el último paquete del envío'
            }, { status: 400 });
        }

        // Delete the package
        await connection.query(`
            DELETE FROM paquetes WHERE id_paquete = ?
        `, [id]);

        // Recalculate shipment total (optional, depends on business logic)
        // For now, we just return success

        return NextResponse.json({
            success: true,
            message: 'Paquete eliminado correctamente'
        });

    } catch (error) {
        console.error('Error deleting package:', error);
        return NextResponse.json({ error: 'Error al eliminar paquete' }, { status: 500 });
    } finally {
        connection.release();
    }
}
