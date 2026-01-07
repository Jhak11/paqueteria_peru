import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface Tarifa {
    departamento_origen: string;
    departamento_destino: string;
    tipo_servicio: 'estandar' | 'express' | 'carga_pesada';
    precio_base: number;
    peso_base_kg: number;
    precio_kg_extra: number;
    tiempo_min_dias: number;
    tiempo_max_dias: number;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const origen = searchParams.get('origen');
        const destino = searchParams.get('destino');

        let query = `
            SELECT * FROM tarifas 
            WHERE estado = 'vigente'
        `;
        const params: any[] = [];

        if (origen) {
            query += ` AND departamento_origen LIKE ?`;
            params.push(`%${origen}%`);
        }
        if (destino) {
            query += ` AND departamento_destino LIKE ?`;
            params.push(`%${destino}%`);
        }

        query += ` ORDER BY departamento_origen, departamento_destino`;

        const [rows] = await pool.query(query, params);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching tarifas:', error);
        return NextResponse.json(
            { error: 'Error al obtener tarifas' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body: Tarifa = await request.json();

        // Validación básica
        if (!body.departamento_origen || !body.departamento_destino || !body.precio_base) {
            return NextResponse.json(
                { error: 'Faltan campos obligatorios' },
                { status: 400 }
            );
        }

        const query = `
            INSERT INTO tarifas (
                departamento_origen, departamento_destino, tipo_servicio,
                precio_base, peso_base_kg, precio_kg_extra,
                tiempo_min_dias, tiempo_max_dias
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                precio_base = VALUES(precio_base),
                precio_kg_extra = VALUES(precio_kg_extra),
                estado = 'vigente'
        `;

        const values = [
            body.departamento_origen.toUpperCase(),
            body.departamento_destino.toUpperCase(),
            body.tipo_servicio || 'estandar',
            body.precio_base,
            body.peso_base_kg || 1.00,
            body.precio_kg_extra,
            body.tiempo_min_dias || 1,
            body.tiempo_max_dias || 3
        ];

        const [result]: any = await pool.query(query, values);

        return NextResponse.json({
            message: 'Tarifa registrada exitosamente',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error creating tarifa:', error);
        return NextResponse.json(
            { error: 'Error al registrar tarifa' },
            { status: 500 }
        );
    }
}
