import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { calcularPrecioEnvio } from '@/lib/pricing';
export async function POST(request) {
    try {
        const body = await request.json();
        const { departamento_origen, departamento_destino, peso_kg, alto, ancho, largo, tipo_envio } = body;
        // 1. Validaciones
        if (!departamento_destino || !peso_kg) {
            return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }
        const origen = departamento_origen || 'LIMA'; // Default
        // 2. Buscar Tarifa
        const [tarifas] = await pool.query(`
            SELECT * FROM tarifas 
            WHERE departamento_origen = ? 
            AND departamento_destino = ?
            AND tipo_servicio = ?
            AND estado = 'vigente'
            LIMIT 1
        `, [origen.toUpperCase(), departamento_destino.toUpperCase(), tipo_envio || 'estandar']);
        if (tarifas.length === 0) {
            return NextResponse.json({ error: 'No hay cobertura para esta ruta' }, { status: 404 });
        }
        const tarifa = tarifas[0];
        // 3. Usar Módulo de Cálculo
        const resultado = calcularPrecioEnvio({
            peso_fisico: parseFloat(peso_kg),
            largo: parseFloat(largo || 0),
            ancho: parseFloat(ancho || 0),
            alto: parseFloat(alto || 0),
            precio_base: parseFloat(tarifa.precio_base),
            peso_base: parseFloat(tarifa.peso_base_kg),
            precio_extra: parseFloat(tarifa.precio_kg_extra)
        });
        return NextResponse.json({
            costo_total: resultado.costo_total,
            peso_facturable: resultado.peso_final,
            es_volumetrico: resultado.es_volumetrico,
            tarifa_id: tarifa.id_tarifa,
            dias_min: tarifa.tiempo_min_dias,
            dias_max: tarifa.tiempo_max_dias
        });
    }
    catch (error) {
        console.error('Error calculando cotización:', error);
        return NextResponse.json({ error: 'Error calculando precio' }, { status: 500 });
    }
}
