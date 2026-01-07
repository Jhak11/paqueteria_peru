/**
 * Calcula el costo de envío basado en tarifas escalonadas y peso volumétrico.
 * Fórmula: Costo = Base + (Max(0, PesoCalculado - PesoBase) * PrecioExtra)
 * PesoCalculado = Max(PesoFisico, (L*A*A)/5000)
 */
export function calcularPrecioEnvio(params) {
    const { peso_fisico, largo = 0, ancho = 0, alto = 0, precio_base, peso_base, precio_extra } = params;
    // 1. Calcular Peso Volumétrico
    // Fórmula: (Largo * Ancho * Alto) / 5000
    const peso_volumetrico = (largo * ancho * alto) / 5000;
    // 2. Determinar Peso Facturable (El mayor entre físico y volumétrico)
    const peso_final = Math.max(peso_fisico, peso_volumetrico);
    // 3. Aplicar tarifa escalonada
    let costo_total = precio_base;
    if (peso_final > peso_base) {
        const peso_excedente = peso_final - peso_base;
        costo_total += peso_excedente * precio_extra;
    }
    return {
        peso_final: parseFloat(peso_final.toFixed(2)),
        peso_volumetrico: parseFloat(peso_volumetrico.toFixed(2)),
        costo_total: parseFloat(costo_total.toFixed(2)),
        es_volumetrico: peso_final > peso_fisico
    };
}
