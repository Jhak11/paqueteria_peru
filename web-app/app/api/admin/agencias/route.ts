
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function GET() {
    try {
        const [agencias] = await pool.query<RowDataPacket[]>(`
            SELECT 
                a.id_agencia,
                a.nombre,
                a.direccion,
                a.tipo,
                a.telefono,
                a.estado,
                u.departamento,
                u.provincia,
                u.distrito
            FROM agencias a
            LEFT JOIN ubigeo u ON a.id_ubigeo = u.id_ubigeo
            ORDER BY a.nombre ASC
        `);

        return NextResponse.json(agencias);
    } catch (error) {
        console.error('Error obteniendo agencias:', error);
        return NextResponse.json({ error: 'Error al cargar agencias' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nombre, direccion, id_ubigeo, tipo, telefono } = body;

        if (!nombre || !id_ubigeo || !tipo) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO agencias (nombre, direccion, id_ubigeo, tipo, telefono, estado)
             VALUES (?, ?, ?, ?, ?, 'activa')`,
            [nombre, direccion, id_ubigeo, tipo, telefono]
        );

        return NextResponse.json({
            success: true,
            id_agencia: result.insertId,
            message: 'Agencia creada exitosamente'
        }, { status: 201 });

    } catch (error) {
        console.error('Error creando agencia:', error);
        return NextResponse.json({ error: 'Error al crear agencia' }, { status: 500 });
    }
}
