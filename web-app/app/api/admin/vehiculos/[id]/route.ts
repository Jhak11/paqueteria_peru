import { NextResponse } from 'next/server';
import pool from '@/lib/db';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const id = params.id;
        const body = await request.json();

        // Permitimos actualizar estado y otros campos si fuera necesario
        const { estado } = body;

        if (!estado) {
            return NextResponse.json(
                { error: 'Se requiere el campo estado' },
                { status: 400 }
            );
        }

        const query = `
            UPDATE vehiculos 
            SET estado = ?
            WHERE id_vehiculo = ?
        `;

        const [result]: any = await pool.query(query, [estado, id]);

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { error: 'Vehículo no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Vehículo actualizado exitosamente' });
    } catch (error) {
        console.error('Error updating vehiculo:', error);
        return NextResponse.json(
            { error: 'Error al actualizar vehículo' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const id = params.id;

        // Verificar si se puede eliminar (integridad referencial)
        // Por ahora intentamos eliminar y capturamos error de FK
        const query = `DELETE FROM vehiculos WHERE id_vehiculo = ?`;

        const [result]: any = await pool.query(query, [id]);

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { error: 'Vehículo no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Vehículo eliminado exitosamente' });
    } catch (error: any) {
        console.error('Error deleting vehiculo:', error);

        // Manejo básico de error por llave foránea
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return NextResponse.json(
                { error: 'No se puede eliminar el vehículo porque tiene viajes o historial asociado. Intente cambiar su estado a "Retirado".' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Error al eliminar vehículo' },
            { status: 500 }
        );
    }
}
