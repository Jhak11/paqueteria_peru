import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET - Fetch user profile
export async function GET(request) {
    try {
        const user = await getAuthUser();

        if (!user || user.role !== 'Cliente') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const [rows] = await pool.query(`
            SELECT 
                u.nombres,
                u.apellidos,
                u.tipo_documento,
                u.numero_documento,
                u.telefono,
                u.direccion,
                c.correo,
                u.fecha_registro
            FROM usuarios u
            JOIN credenciales c ON u.id_usuario = c.id_usuario
            WHERE u.id_usuario = ?
        `, [user.userId]);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);

    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}

// PUT - Update user profile
export async function PUT(request) {
    try {
        const user = await getAuthUser();

        if (!user || user.role !== 'Cliente') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { telefono, direccion, correo } = body;

        // Validate email format
        if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            return NextResponse.json({ error: 'Correo inválido' }, { status: 400 });
        }

        // Check if email already exists (for another user)
        if (correo) {
            const [existing] = await pool.query(
                'SELECT id_usuario FROM credenciales WHERE correo = ? AND id_usuario != ?',
                [correo, user.userId]
            );

            if (existing.length > 0) {
                return NextResponse.json({ error: 'El correo ya está en uso' }, { status: 400 });
            }
        }

        // Update usuarios table
        await pool.query(
            'UPDATE usuarios SET telefono = ?, direccion = ? WHERE id_usuario = ?',
            [telefono, direccion, user.userId]
        );

        // Update credenciales table if email changed
        if (correo) {
            await pool.query(
                'UPDATE credenciales SET correo = ? WHERE id_usuario = ?',
                [correo, user.userId]
            );
        }

        return NextResponse.json({ message: 'Perfil actualizado correctamente' });

    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
