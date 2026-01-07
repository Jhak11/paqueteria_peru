import { NextResponse } from 'next/server';
import pool from '@/lib/db';
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'departamentos', 'provincias', 'distritos'
        let query = '';
        let params = [];
        if (type === 'departamentos') {
            query = `SELECT DISTINCT departamento FROM ubigeo ORDER BY departamento`;
        }
        else if (type === 'provincias') {
            const departamento = searchParams.get('departamento');
            query = `SELECT DISTINCT provincia FROM ubigeo WHERE departamento = ? ORDER BY provincia`;
            params = [departamento];
        }
        else if (type === 'distritos') {
            const departamento = searchParams.get('departamento');
            const provincia = searchParams.get('provincia');
            query = `SELECT id_ubigeo, distrito FROM ubigeo WHERE departamento = ? AND provincia = ? ORDER BY distrito`;
            params = [departamento, provincia];
        }
        else {
            // Default: return all proper formatting (limited to important ones or all)
            // returning all ~1800 rows is fine for this scale
            query = `SELECT id_ubigeo, departamento, provincia, distrito FROM ubigeo ORDER BY departamento, provincia, distrito`;
        }
        const [rows] = await pool.query(query, params);
        return NextResponse.json(rows);
    }
    catch (error) {
        console.error('Error fetching ubigeo:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
