import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: Request) {
    const user = await getAuthUser();

    if (!user || user.role !== 'Empleado' || !user.agencyId) {
        return NextResponse.json({ error: 'No autorizado o sin agencia asignada' }, { status: 403 });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const body = await request.json();
        const { remitente, destino, paquetes, pago } = body;

        // 0. Determinar Agencia Destino (Basado en Ubigeo)
        // Buscamos una agencia que tenga el mismo ubigeo (Distrito) o Provincia o Departamento (Cascada)
        // Por simplicidad MVP: Buscamos cualquier agencia en el mismo departamento, o fallback a Sede Central (1)
        const [agenciasDestino]: any = await connection.query(`
            SELECT a.id_agencia 
            FROM agencias a
            JOIN ubigeo u ON a.id_ubigeo = u.id_ubigeo
            WHERE u.id_ubigeo = ? 
            LIMIT 1
        `, [destino.ubigeo_id]);

        // Si no hay agencia exacta en ese distrito, intentar buscar en la misma provincia/departamento o usar default
        // Nota: Para producción, se necesita una tabla de cobertura 'ubigeo -> agencia_responsable'
        let idAgenciaDestino = agenciasDestino.length > 0 ? agenciasDestino[0].id_agencia : 1;

        // 1. Generar Código de Seguimiento (Ej: PE-A1B2-C3D4)
        const generateTrackingCode = () => {
            const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let result = 'PE-';
            for (let i = 0; i < 8; i++) {
                if (i === 4) result += '-';
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        };
        const trackingCode = generateTrackingCode();

        // 2. Insertar Envío
        const [resEnvio]: any = await connection.query(`
            INSERT INTO envios (
                codigo_seguimiento, 
                id_usuario_remitente,
                id_agencia_origen,
                id_agencia_destino,
                estado_actual,
                costo_envio_total,
                fecha_registro
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [
            trackingCode,
            remitente.id,
            user.agencyId, // Agencia Origen = Agencia del Empleado Logueado
            idAgenciaDestino,
            1, // Estado 1 = Recibido/Pendiente
            pago.monto
        ]);

        const envioId = resEnvio.insertId;

        // 3. Insertar Paquetes (Bucle)
        // Validar que paquetes sea un array
        const listaPaquetes = Array.isArray(paquetes) ? paquetes : [paquetes];

        for (const p of listaPaquetes) {
            await connection.query(`
                INSERT INTO paquetes (
                    id_envio, tipo_paquete, peso_kg, 
                    alto_cm, ancho_cm, largo_cm, 
                    fragil
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                envioId,
                'caja_chica', // Default o mapear según p.tipo_servicio si aplica
                p.peso,
                p.alto || null,
                p.ancho || null,
                p.largo || null,
                p.fragil ? 1 : 0
            ]);
        }

        // 4. Insertar Dirección Destino
        await connection.query(`
            INSERT INTO direccion_destino_envio (
                id_envio, nombre_destinatario, telefono, 
                direccion, referencia, id_ubigeo
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
            envioId,
            destino.nombre_destinatario,
            destino.telefono,
            destino.direccion,
            destino.referencia,
            destino.ubigeo_id
        ]);

        // 5. Insertar Pago
        await connection.query(`
            INSERT INTO pagos (
                id_envio, monto, metodo_pago, estado
            ) VALUES (?, ?, ?, 'pagado')
        `, [envioId, pago.monto, pago.metodo]);

        // 6. Tracking Inicial
        await connection.query(`
            INSERT INTO seguimiento_envio (
                id_envio, id_estado, descripcion_evento, id_agencia, id_responsable
            ) VALUES (?, 1, 'Paquete recibido en counter', ?, ?)
        `, [envioId, user.agencyId, user.userId]);

        await connection.commit();

        return NextResponse.json({
            message: 'Envío registrado exitosamente',
            codigo: trackingCode,
            id_envio: envioId
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error transaction envio:', error);
        return NextResponse.json({ error: 'Error al procesar envío' }, { status: 500 });
    } finally {
        connection.release();
    }
}
