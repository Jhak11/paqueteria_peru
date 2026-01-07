import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Generar contraseña temporal
function generarPasswordTemporal(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

interface ExistingCount extends RowDataPacket {
    count: number;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            razon_social,
            nombre_comercial,
            ruc,
            direccion_fiscal,
            ciudad,
            telefono_central,
            sitio_web,
            linea_credito,
            dias_credito,
            porcentaje_descuento,
            contacto_nombres,
            contacto_apellidos,
            contacto_email,
            contacto_telefono,
            contacto_cargo,
            contacto_documento,
        } = body;

        // Validaciones
        if (!razon_social || !ruc || !contacto_nombres || !contacto_apellidos || !contacto_email) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
        }

        if (ruc.length !== 11) {
            return NextResponse.json({ error: 'El RUC debe tener 11 dígitos' }, { status: 400 });
        }

        // Verificar RUC único
        const [existingRuc] = await pool.query<ExistingCount[]>(
            'SELECT COUNT(*) as count FROM empresas_cliente WHERE ruc = ?',
            [ruc]
        );
        if (existingRuc[0].count > 0) {
            return NextResponse.json({ error: 'Este RUC ya está registrado' }, { status: 409 });
        }

        // Verificar email único
        const [existingEmail] = await pool.query<ExistingCount[]>(
            'SELECT COUNT(*) as count FROM credenciales WHERE correo = ?',
            [contacto_email]
        );
        if (existingEmail[0].count > 0) {
            return NextResponse.json({ error: 'Este correo ya está registrado' }, { status: 409 });
        }

        // Generar contraseña temporal
        const tempPassword = generarPasswordTemporal();

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Crear empresa
            const [empresaResult] = await connection.query<ResultSetHeader>(
                `INSERT INTO empresas_cliente 
                (razon_social, nombre_comercial, ruc, direccion_fiscal, id_ubigeo, telefono_central, sitio_web, linea_credito, dias_credito, porcentaje_descuento)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [razon_social, nombre_comercial || razon_social, ruc, direccion_fiscal, ciudad || '150101',
                    telefono_central, sitio_web, parseFloat(linea_credito) || 0, parseInt(dias_credito) || 0, parseFloat(porcentaje_descuento) || 0]
            );
            const empresaId = empresaResult.insertId;

            // 2. Crear usuario para el contacto
            const [usuarioResult] = await connection.query<ResultSetHeader>(
                `INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, telefono, direccion, id_ubigeo)
                 VALUES (?, ?, 'DNI', ?, ?, ?, ?)`,
                [contacto_nombres, contacto_apellidos, contacto_documento, contacto_telefono, direccion_fiscal, ciudad || '150101']
            );
            const usuarioId = usuarioResult.insertId;

            // 3. Crear credenciales
            await connection.query(
                'INSERT INTO credenciales (id_usuario, correo, password_hash, estado) VALUES (?, ?, ?, ?)',
                [usuarioId, contacto_email, tempPassword, 'activo']
            );

            // 4. Asignar rol Cliente (id_rol = 2)
            await connection.query(
                'INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (?, 2)',
                [usuarioId]
            );

            // 5. Crear contacto de empresa
            await connection.query(
                `INSERT INTO empresa_contactos (id_empresa, id_usuario, nombre_completo, telefono_movil, correo, cargo, es_principal)
                 VALUES (?, ?, ?, ?, ?, ?, 1)`,
                [empresaId, usuarioId, `${contacto_nombres} ${contacto_apellidos}`, contacto_telefono, contacto_email, contacto_cargo || 'Contacto Principal']
            );

            await connection.commit();
            connection.release();

            return NextResponse.json({
                success: true,
                empresaId,
                usuarioId,
                email: contacto_email,
                tempPassword,
                message: 'Empresa y usuario creados exitosamente'
            }, { status: 201 });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error: any) {
        console.error('Error creando empresa:', error);
        return NextResponse.json({ error: 'Error al crear empresa' }, { status: 500 });
    }
}
