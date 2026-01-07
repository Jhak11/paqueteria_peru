USE paqueteria_peru;

-- ----------------------------------------------------
-- VISTAS PÚBLICAS (Seguridad y Privacidad)
-- ----------------------------------------------------

-- Esta vista enmascara los datos sensibles para el portal web público
CREATE OR REPLACE VIEW vista_rastreo_publico AS
SELECT 
    e.codigo_seguimiento,
    est.nombre AS estado_actual,
    est.descripcion AS mensaje_estado,
    -- Ocultamos la dirección exacta, solo mostramos la Agencia o Distrito
    ub_orig.departamento AS origen_departamento,
    ub_dest.departamento AS destino_departamento,
    ub_dest.distrito AS destino_distrito,
    -- Enmascaramos fechas futuras para no prometer lo que no se sabe
    e.fecha_registro,
    e.fecha_estimada_entrega
FROM envios e
JOIN estados_envio est ON e.estado_actual = est.id_estado
LEFT JOIN agencias a_orig ON e.id_agencia_origen = a_orig.id_agencia
LEFT JOIN ubigeo ub_orig ON a_orig.id_ubigeo = ub_orig.id_ubigeo
LEFT JOIN direccion_destino_envio dde ON e.id_envio = dde.id_envio
LEFT JOIN ubigeo ub_dest ON dde.id_ubigeo = ub_dest.id_ubigeo;
