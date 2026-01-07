'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import pool from './db';
import { SignJWT } from 'jose';
import { RowDataPacket } from 'mysql2';

interface UserCredentials extends RowDataPacket {
    id_usuario: number;
    correo: string;
    password_hash: string;
    estado: string;
}

interface UserRole extends RowDataPacket {
    id_rol: number;
    nombre: string;
}

interface UserInfo extends RowDataPacket {
    nombres: string;
    apellidos: string;
}

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Correo y contraseña son requeridos' };
    }

    try {
        // 1. Buscar credenciales (comparación directa SIN hash por ahora)
        const [credentials] = await pool.query<UserCredentials[]>(
            'SELECT id_usuario, correo, password_hash, estado FROM credenciales WHERE correo = ? AND password_hash = ?',
            [email, password]
        );

        if (credentials.length === 0) {
            return { error: 'Credenciales inválidas' };
        }

        const user = credentials[0];

        // 2. Verificar estado
        if (user.estado !== 'activo') {
            return { error: 'Usuario inactivo. Contacte al administrador.' };
        }

        // 3. Obtener roles
        const [roles] = await pool.query<UserRole[]>(
            `SELECT r.id_rol, r.nombre 
             FROM usuario_roles ur 
             JOIN roles r ON ur.id_rol = r.id_rol 
             WHERE ur.id_usuario = ?`,
            [user.id_usuario]
        );

        if (roles.length === 0) {
            return { error: 'Usuario sin roles asignados' };
        }

        // 4. Obtener información del usuario
        const [userInfo] = await pool.query<UserInfo[]>(
            'SELECT nombres, apellidos FROM usuarios WHERE id_usuario = ?',
            [user.id_usuario]
        );

        const primaryRole = roles[0];
        const fullName = userInfo.length > 0
            ? `${userInfo[0].nombres} ${userInfo[0].apellidos}`
            : 'Usuario';

        // 5. Crear JWT Token
        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || 'paqueteria-peru-secret-key-2024'
        );

        const token = await new SignJWT({
            userId: user.id_usuario,
            email: email,
            role: primaryRole.nombre,
            roleId: primaryRole.id_rol,
            name: fullName
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(secret);

        // 6. Configurar cookie
        cookies().set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24,
            path: '/',
        });

        // 7. Redirigir según rol
        const redirectTo = getRedirectPath(primaryRole.nombre);
        redirect(redirectTo);

    } catch (error: any) {
        // El redirect lanza un error especial que debemos dejar pasar
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        console.error('Error en login:', error);
        return { error: 'Error de conexión. Intente nuevamente.' };
    }
}

export async function logoutAction() {
    cookies().delete('auth-token');
    redirect('/login');
}

function getRedirectPath(roleName: string): string {
    switch (roleName) {
        case 'Administrador':
            return '/admin';
        case 'Empleado':
            return '/counter';
        case 'Cliente':
            return '/cliente';
        case 'Conductor':
            return '/conductor';
        default:
            return '/login';
    }
}
