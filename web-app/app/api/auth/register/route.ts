import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface ExistingUser extends RowDataPacket {
    count: number;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            nombres,
            apellidos,
            email,
            password,
            telefono,
            direccion,
            ciudad,
            tipo_documento,
            numero_documento
        } = body;

        // Validaciones básicas
        if (!nombres || !apellidos || !email || !password || !telefono || !direccion || !numero_documento) {
            return NextResponse.json(
                { error: 'Todos los campos son requeridos' },
                { status: 400 }
            );
        }

        // Verificar si el email ya existe
        const [existing] = await pool.query<ExistingUser[]>(
            'SELECT COUNT(*) as count FROM credenciales WHERE correo = ?',
            [email]
        );

        if (existing[0].count > 0) {
            return NextResponse.json(
                { error: 'Este correo ya está registrado' },
                { status: 409 }
            );
        }

        // Verificar si el documento ya existe
        const [existingDoc] = await pool.query<ExistingUser[]>(
            'SELECT COUNT(*) as count FROM usuarios WHERE numero_documento = ?',
            [numero_documento]
        );

        if (existingDoc[0].count > 0) {
            return NextResponse.json(
                { error: 'Este número de documento ya está registrado' },
                { status: 409 }
            );
        }

        // Iniciar transacción
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Crear usuario
            const [userResult] = await connection.query<ResultSetHeader>(
                `INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, telefono, direccion, id_ubigeo)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [nombres, apellidos, tipo_documento, numero_documento, telefono, direccion, ciudad || '150101']
            );

            const userId = userResult.insertId;

            // 2. Crear credenciales (contraseña en texto plano por ahora)
            await connection.query(
                'INSERT INTO credenciales (id_usuario, correo, password_hash, estado) VALUES (?, ?, ?, ?)',
                [userId, email, password, 'activo']
            );

            // 3. Asignar rol de Cliente (id_rol = 2)
            await connection.query(
                'INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (?, 2)',
                [userId]
            );

            await connection.commit();
            connection.release();

            return NextResponse.json({
                success: true,
                message: 'Usuario registrado exitosamente',
                userId: userId
            }, { status: 201 });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error: any) {
        console.error('Error en registro:', error);
        return NextResponse.json(
            { error: 'Error al registrar usuario' },
            { status: 500 }
        );
    }
}
