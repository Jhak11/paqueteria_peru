import { NextResponse } from 'next/server';
import pool from '@/lib/db';
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        let query = `SELECT * FROM vehiculos`;
        const params = [];
        if (search) {
            query += ` WHERE placa LIKE ? OR marca LIKE ? OR modelo LIKE ?`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        query += ` ORDER BY estado, marca, modelo`;
        const [rows] = await pool.query(query, params);
        return NextResponse.json(rows);
    }
    catch (error) {
        console.error('Error fetching vehiculos:', error);
        return NextResponse.json({ error: 'Error al obtener vehículos' }, { status: 500 });
    }
}
export async function POST(request) {
    try {
        const body = await request.json();
        // Validación básica
        if (!body.placa || !body.marca || !body.modelo || !body.capacidad_kg) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }
        const query = `
            INSERT INTO vehiculos (placa, marca, modelo, capacidad_kg, tipo, estado)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [
            body.placa.toUpperCase(),
            body.marca,
            body.modelo,
            body.capacidad_kg,
            body.tipo || 'furgoneta',
            body.estado || 'activo'
        ];
        const [result] = await pool.query(query, values);
        return NextResponse.json({
            message: 'Vehículo registrado exitosamente',
            id: result.insertId
        });
    }
    catch (error) {
        console.error('Error creating vehiculo:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Ya existe un vehículo con esa placa' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Error al registrar vehículo' }, { status: 500 });
    }
}
