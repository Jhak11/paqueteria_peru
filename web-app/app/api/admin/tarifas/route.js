import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Obtener todas las tarifas
export async function GET() {
    try {
        const [tarifas] = await pool.query(`
            SELECT * FROM tarifas
            ORDER BY departamento_origen, departamento_destino, tipo_servicio
        `);

        return NextResponse.json(tarifas);
    } catch (error) {
        console.error('Error fetching tarifas:', error);
        return NextResponse.json(
            { error: 'Error al obtener las tarifas' },
            { status: 500 }
        );
    }
}

// PUT - Actualizar tarifa
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id_tarifa, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias } = body;

        if (!id_tarifa) {
            return NextResponse.json(
                { error: 'ID de tarifa requerido' },
                { status: 400 }
            );
        }

        // Validar que los precios sean positivos
        if ((precio_base && precio_base <= 0) || (precio_kg_extra && precio_kg_extra <= 0)) {
            return NextResponse.json(
                { error: 'Los precios deben ser mayores a 0' },
                { status: 400 }
            );
        }

        const updates = [];
        const values = [];

        if (precio_base !== undefined) {
            updates.push('precio_base = ?');
            values.push(precio_base);
        }
        if (peso_base_kg !== undefined) {
            updates.push('peso_base_kg = ?');
            values.push(peso_base_kg);
        }
        if (precio_kg_extra !== undefined) {
            updates.push('precio_kg_extra = ?');
            values.push(precio_kg_extra);
        }
        if (tiempo_min_dias !== undefined) {
            updates.push('tiempo_min_dias = ?');
            values.push(tiempo_min_dias);
        }
        if (tiempo_max_dias !== undefined) {
            updates.push('tiempo_max_dias = ?');
            values.push(tiempo_max_dias);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: 'No hay campos para actualizar' },
                { status: 400 }
            );
        }

        values.push(id_tarifa);

        await pool.query(
            `UPDATE tarifas SET ${updates.join(', ')} WHERE id_tarifa = ?`,
            values
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating tarifa:', error);
        return NextResponse.json(
            { error: 'Error al actualizar la tarifa' },
            { status: 500 }
        );
    }
}

// PATCH - Activar/Desactivar tarifa
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id_tarifa, estado } = body;

        if (!id_tarifa || !estado) {
            return NextResponse.json(
                { error: 'ID de tarifa y estado requeridos' },
                { status: 400 }
            );
        }

        if (!['vigente', 'inactivo'].includes(estado)) {
            return NextResponse.json(
                { error: 'Estado inválido. Debe ser "vigente" o "inactivo"' },
                { status: 400 }
            );
        }

        await pool.query(
            'UPDATE tarifas SET estado = ? WHERE id_tarifa = ?',
            [estado, id_tarifa]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating tarifa estado:', error);
        return NextResponse.json(
            { error: 'Error al cambiar el estado de la tarifa' },
            { status: 500 }
        );
    }
}
