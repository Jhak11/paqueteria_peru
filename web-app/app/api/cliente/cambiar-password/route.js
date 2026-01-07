import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// POST - Change password
export async function POST(request) {
    try {
        const user = await getAuthUser();

        if (!user || user.role !== 'Cliente') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 });
        }

        // Verify current password (plain text comparison as per current implementation)
        const [credentials] = await pool.query(
            'SELECT password_hash FROM credenciales WHERE id_usuario = ?',
            [user.userId]
        );

        if (credentials.length === 0) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // Compare passwords (currently plain text)
        if (credentials[0].password_hash !== currentPassword) {
            return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 401 });
        }

        // Update password (plain text for now - should use bcrypt in production)
        await pool.query(
            'UPDATE credenciales SET password_hash = ? WHERE id_usuario = ?',
            [newPassword, user.userId]
        );

        return NextResponse.json({ message: 'Contraseña cambiada correctamente' });

    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
