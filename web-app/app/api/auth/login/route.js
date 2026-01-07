import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { SignJWT } from 'jose';
export async function POST(request) {
    try {
        const { correo, password } = await request.json();
        // 1. Validar inputs
        if (!correo || !password) {
            return NextResponse.json({ error: 'Correo y contraseña son requeridos' }, { status: 400 });
        }
        // 2. Buscar credenciales
        const [credentials] = await pool.query('SELECT id_usuario, correo, password_hash, estado FROM credenciales WHERE correo = ?', [correo]);
        if (credentials.length === 0) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }
        const user = credentials[0];
        // 3. Verificar estado
        if (user.estado !== 'activo') {
            return NextResponse.json({ error: 'Usuario inactivo. Contacte al administrador.' }, { status: 403 });
        }
        // 4. Validar contraseña (texto plano - SOLO DESARROLLO)
        if (password !== user.password_hash) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }
        // 5. Obtener roles
        const [roles] = await pool.query(`SELECT r.id_rol, r.nombre 
             FROM usuario_roles ur 
             JOIN roles r ON ur.id_rol = r.id_rol 
             WHERE ur.id_usuario = ?`, [user.id_usuario]);
        if (roles.length === 0) {
            return NextResponse.json({ error: 'Usuario sin roles asignados' }, { status: 403 });
        }
        // 6. Obtener información del usuario y su agencia
        const [userInfo] = await pool.query(`SELECT u.nombres, u.apellidos, u.id_agencia_trabajo, a.nombre as nombre_agencia 
             FROM usuarios u
             LEFT JOIN agencias a ON u.id_agencia_trabajo = a.id_agencia
             WHERE u.id_usuario = ?`, [user.id_usuario]);
        const primaryRole = roles[0];
        const userData = userInfo[0];
        const fullName = userData
            ? `${userData.nombres} ${userData.apellidos}`
            : 'Usuario';
        const agencyId = userData?.id_agencia_trabajo || null;
        const agencyName = userData?.nombre_agencia || 'Sin Asignar';
        // 7. Crear JWT Token
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'paqueteria-peru-secret-key-2024');
        const token = await new SignJWT({
            userId: user.id_usuario,
            email: correo,
            role: primaryRole.nombre,
            roleId: primaryRole.id_rol,
            name: fullName,
            agencyId: agencyId,
            agencyName: agencyName
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(secret);
        // 8. Crear respuesta con cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id_usuario,
                email: correo,
                name: fullName,
                role: primaryRole.nombre,
                roleId: primaryRole.id_rol,
                agencyId,
                agencyName
            },
            redirectTo: getRedirectPath(primaryRole.nombre)
        });
        // Configurar cookie segura
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 24 horas
            path: '/',
        });
        return response;
    }
    catch (error) {
        console.error('Error en login:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
// Determinar ruta de redirección según rol
function getRedirectPath(roleName) {
    switch (roleName) {
        case 'Administrador':
        case 'Empleado':
            return '/';
        case 'Cliente':
            return '/cliente';
        case 'Conductor':
            return '/conductor';
        default:
            return '/login';
    }
}
