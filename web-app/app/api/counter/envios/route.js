import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(request) {
    const user = await getAuthUser();

    if (!user || user.role !== 'Empleado' || !user.agencyId) {
        return NextResponse.json({ error: 'No autorizado o sin agencia asignada' }, { status: 403 });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const body = await request.json();
        const { remitente, destino, paquetes, pago } = body;

        // 0. Determinar Agencia Destino (Basado en Departamento)
        // Buscamos cualquier agencia que esté en el mismo DEPARTAMENTO (primeros 2 dígitos del Ubigeo)
        // Esto asegura que si mandas a cualquier distrito de Arequipa (04xxxx), caiga en la agencia de Arequipa (040101)
        const [agenciasDestino] = await connection.query(`
            SELECT a.id_agencia 
            FROM agencias a
            JOIN ubigeo u ON a.id_ubigeo = u.id_ubigeo
            WHERE LEFT(u.id_ubigeo, 2) = LEFT(?, 2)
            ORDER BY a.id_agencia ASC 
            LIMIT 1
        `, [destino.ubigeo_id]);

        // Si no hay agencia en ese departamento, fallback a Sede Central (1)
        let idAgenciaDestino = agenciasDestino.length > 0 ? agenciasDestino[0].id_agencia : 1;

        // 1. Generar Código de Seguimiento (Ej: PE-A1B2-C3D4)
        const generateTrackingCode = () => {
            const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let result = 'PE-';
            for (let i = 0; i < 8; i++) {
                if (i === 4)
                    result += '-';
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        };

        const trackingCode = generateTrackingCode();

        // 2. Insertar Envío
        const [resEnvio] = await connection.query(`
            INSERT INTO envios (
                codigo_seguimiento, 
                id_usuario_remitente,
                id_usuario_destinatario,
                id_agencia_origen,
                id_agencia_destino,
                estado_actual,
                costo_envio_total,
                fecha_registro
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            trackingCode,
            remitente.id,
            destino.id_usuario_destinatario || null, // NEW: Support registered recipient
            user.agencyId, // Agencia Origen = Agencia del Empleado Logueado
            idAgenciaDestino,
            2, // Estado 2 = En Almacén Origen (recibido en counter)
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
                    fragil, valor_declarado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                envioId,
                p.tipo_paquete || 'caja_chica', // NEW: Support package type
                p.peso,
                p.alto || null,
                p.ancho || null,
                p.largo || null,
                p.fragil ? 1 : 0,
                p.valor_declarado || 0.00 // NEW: Support declared value
            ]);
        }

        // 4. Insertar Dirección Destino
        await connection.query(`
            INSERT INTO direccion_destino_envio (
                id_envio, nombre_destinatario, dni, telefono, 
                direccion, referencia, id_ubigeo
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            envioId,
            destino.nombre_destinatario,
            destino.dni || null, // NEW: DNI field
            destino.telefono,
            destino.direccion,
            destino.referencia,
            destino.ubigeo_id
        ]);

        // 5. Insertar Pago
        await connection.query(`
            INSERT INTO pagos (
                id_envio, monto, metodo_pago, estado, referencia_pago
            ) VALUES (?, ?, ?, 'pagado', ?)
        `, [envioId, pago.monto, pago.metodo, pago.referencia || null]);

        // 6. Crear Factura/Boleta
        if (pago.factura) {
            const subtotal = parseFloat((pago.monto / 1.18).toFixed(2));
            const igv = parseFloat((pago.monto - subtotal).toFixed(2));

            await connection.query(`
                INSERT INTO facturas (
                    id_envio, numero_serie, numero_correlativo,
                    tipo_comprobante, subtotal, monto_igv, total,
                    ruc_receptor, razon_social_receptor
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                envioId,
                pago.factura.tipo_comprobante === 'factura' ? 'F001' : 'B001',
                String(envioId).padStart(8, '0'),
                pago.factura.tipo_comprobante,
                subtotal,
                igv,
                pago.monto,
                pago.factura.ruc || null,
                pago.factura.razon_social || null
            ]);
        }

        // 7. Tracking Inicial  
        await connection.query(`
            INSERT INTO seguimiento_envio (
                id_envio, id_estado, descripcion_evento, id_agencia, id_responsable
            ) VALUES (?, 2, 'Paquete recibido y registrado en almacén de origen', ?, ?)
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
