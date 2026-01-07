import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Generar contraseña temporal
function generarPasswordTemporal() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const rol = searchParams.get('rol'); // 'Conductor', etc.

        let query = `
            SELECT 
                u.id_usuario,
                u.nombres,
                u.apellidos,
                u.telefono,
                c.correo,
                c.estado,
                r.nombre as rol,
                ub.distrito as ciudad
            FROM usuarios u
            JOIN credenciales c ON u.id_usuario = c.id_usuario
            JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario
            JOIN roles r ON ur.id_rol = r.id_rol
            LEFT JOIN ubigeo ub ON u.id_ubigeo = ub.id_ubigeo
        `;

        const params = [];

        if (rol) {
            query += ` WHERE r.nombre = ?`;
            params.push(rol);
        } else {
            // Return all employees (roles 3 and 4 usually)
            query += ` WHERE ur.id_rol IN (3, 4)`;
        }

        query += ` ORDER BY u.nombres ASC`;

        const [rows] = await pool.query(query, params);

        // Debug logging
        console.log(`[Empleados API] Rol filter: ${rol || 'none'}`);
        console.log(`[Empleados API] Results found: ${rows.length}`);
        if (rol === 'Conductor' && rows.length === 0) {
            console.warn('[Empleados API] No conductores found! Check roles table.');
        }

        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching empleados:', error);
        return NextResponse.json({ error: 'Error al obtener empleados' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { nombres, apellidos, tipo_documento, numero_documento, email, telefono, direccion, ciudad, rol, agencia } = body;

        // Validaciones
        if (!nombres || !apellidos || !numero_documento || !email || !rol || !agencia) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
        }

        // Validar que el rol sea interno (3=Empleado, 4=Conductor)
        const rolId = parseInt(rol);
        if (![3, 4].includes(rolId)) {
            return NextResponse.json({ error: 'Rol no válido para empleados' }, { status: 400 });
        }

        // Verificar documento único
        const [existingDoc] = await pool.query('SELECT COUNT(*) as count FROM usuarios WHERE numero_documento = ?', [numero_documento]);
        if (existingDoc[0].count > 0) {
            return NextResponse.json({ error: 'Este documento ya está registrado' }, { status: 409 });
        }

        // Verificar email único
        const [existingEmail] = await pool.query('SELECT COUNT(*) as count FROM credenciales WHERE correo = ?', [email]);
        if (existingEmail[0].count > 0) {
            return NextResponse.json({ error: 'Este correo ya está registrado' }, { status: 409 });
        }

        // Generar contraseña temporal
        const tempPassword = generarPasswordTemporal();

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Crear usuario
            const [usuarioResult] = await connection.query(`INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, telefono, direccion, id_ubigeo, id_agencia_trabajo)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [nombres, apellidos, tipo_documento || 'DNI', numero_documento, telefono, direccion || '', ciudad || '150101', agencia]);

            const usuarioId = usuarioResult.insertId;

            // 2. Crear credenciales
            await connection.query('INSERT INTO credenciales (id_usuario, correo, password_hash, estado) VALUES (?, ?, ?, ?)', [usuarioId, email, tempPassword, 'activo']);

            // 3. Asignar rol (3=Empleado, 4=Conductor)
            await connection.query('INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (?, ?)', [usuarioId, rolId]);

            await connection.commit();
            connection.release();

            return NextResponse.json({
                success: true,
                usuarioId,
                email,
                rol: rolId === 3 ? 'Empleado' : 'Conductor',
                tempPassword,
                message: 'Empleado registrado exitosamente'
            }, { status: 201 });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Error creando empleado:', error);
        return NextResponse.json({ error: 'Error al crear empleado' }, { status: 500 });
    }
}
