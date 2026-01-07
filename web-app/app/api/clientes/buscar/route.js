import { NextResponse } from 'next/server';
import pool from '@/lib/db';
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q');
        if (!q || q.length < 3) {
            return NextResponse.json([]);
        }
        // 1. Buscar en Usuarios (Personas o Representantes)
        const [usuarios] = await pool.query(`
            SELECT id_usuario, nombres, apellidos, tipo_documento, numero_documento, direccion, telefono, id_ubigeo
            FROM usuarios 
            WHERE numero_documento LIKE ? OR CONCAT(nombres, ' ', apellidos) LIKE ?
            LIMIT 5
        `, [`${q}%`, `%${q}%`]);
        // 2. Si es formato RUC (11 dígitos), buscar en Empresas para ver crédito
        let empresaInfo = null;
        if (/^\d{11}$/.test(q)) {
            const [empresas] = await pool.query(`
                SELECT id_empresa, razon_social, linea_credito, estado 
                FROM empresas_cliente 
                WHERE ruc = ?
            `, [q]);
            if (empresas.length > 0) {
                empresaInfo = empresas[0];
            }
        }
        // Formatear respuesta combinada
        const resultados = usuarios.map((u) => ({
            type: 'usuario',
            id: u.id_usuario,
            nombre: `${u.nombres} ${u.apellidos}`,
            documento: u.numero_documento,
            tipo_documento: u.tipo_documento,
            direccion: u.direccion,
            telefono: u.telefono,
            empresa_relacionada: (u.numero_documento === empresaInfo?.ruc) ? empresaInfo : null
        }));
        // Si no se encontró usuario pero sí empresa (caso raro donde la empresa existe pero no tiene usuario 'persona' asociado con ese RUC)
        // En este modelo asumimos que si busco por RUC, quiero al cliente con ese RUC.
        if (resultados.length === 0 && empresaInfo) {
            resultados.push({
                type: 'empresa_only', // Flag para indicar que falta crear el usuario
                nombre: empresaInfo.razon_social,
                documento: q,
                tipo_documento: 'RUC',
                empresa_relacionada: empresaInfo
            });
        }
        return NextResponse.json(resultados);
    }
    catch (error) {
        console.error('Error buscando clientes:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
