import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
export async function POST(request) {
    const connection = await pool.getConnection();
    try {
        const body = await request.json();
        const { nombres, apellidos, tipo_documento, numero_documento, telefono, direccion, email } = body;
        // Validaciones básicas
        if (!nombres || !numero_documento) {
            return NextResponse.json({ error: 'Nombre y Documento son obligatorios' }, { status: 400 });
        }
        await connection.beginTransaction();
        // 1. Verificar si ya existe
        const [existing] = await connection.query('SELECT id_usuario FROM usuarios WHERE numero_documento = ?', [numero_documento]);
        if (existing.length > 0) {
            return NextResponse.json({ error: 'El cliente ya está registrado' }, { status: 409 });
        }
        // 2. Crear Usuario
        const [resUser] = await connection.query(`
            INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, telefono, direccion, id_ubigeo)
            VALUES (?, ?, ?, ?, ?, ?, '150101') 
        `, [
            nombres,
            apellidos || '',
            tipo_documento,
            numero_documento,
            telefono || '',
            direccion || ''
            // Ubigeo default Lima por ahora, se puede mejorar
        ]);
        const userId = resUser.insertId;
        // 3. Crear Credenciales (Opcional, generamos una password dummy o null si el sistema permite usuarios sin login)
        // Para consistencia con el sistema actual que requiere login para clientes app:
        const dummyPass = await bcrypt.hash(numero_documento, 10); // Pass = DNI
        const emailFinal = email || `${numero_documento}@cliente.sinemail`;
        await connection.query(`
            INSERT INTO credenciales (id_usuario, correo, password_hash, estado)
            VALUES (?, ?, ?, 'activo')
        `, [userId, emailFinal, dummyPass]);
        // 4. Asignar Rol Cliente (2)
        await connection.query(`
             INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (?, 2)
        `, [userId]);
        await connection.commit();
        return NextResponse.json({
            success: true,
            cliente: {
                id: userId,
                nombre: `${nombres} ${apellidos || ''}`.trim(),
                documento: numero_documento,
                tipo_documento,
                direccion,
                telefono
            }
        });
    }
    catch (error) {
        await connection.rollback();
        console.error('Error creando cliente rápido:', error);
        return NextResponse.json({ error: 'Error al registrar cliente' }, { status: 500 });
    }
    finally {
        connection.release();
    }
}
