import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    try {
        const [rows] = await pool.query('SELECT id_agencia, nombre FROM agencias WHERE estado = "activa" ORDER BY nombre');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching agencias:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
