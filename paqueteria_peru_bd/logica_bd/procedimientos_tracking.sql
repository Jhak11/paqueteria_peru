-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- Sistema de Paquetería Perú
-- =====================================================

USE paqueteria_peru;

DELIMITER //

-- =====================================================
-- I. Procedimiento de Rastreo Seguro (Para Tracking)
-- =====================================================
-- Este procedimiento devuelve solo información necesaria
-- para el seguimiento público/cliente, ocultando datos
-- internos como el conductor asignado.
-- =====================================================

DROP PROCEDURE IF EXISTS sp_obtener_tracking//

CREATE PROCEDURE sp_obtener_tracking(IN p_codigo VARCHAR(30))
BEGIN
    SELECT 
        h.fecha_hora,
        e.nombre AS estado,
        h.descripcion_evento,
        CASE 
            WHEN h.id_agencia IS NOT NULL THEN (
                SELECT nombre FROM agencias WHERE id_agencia = h.id_agencia
            )
            WHEN h.id_ubigeo IS NOT NULL THEN (
                SELECT CONCAT(distrito, ', ', provincia, ', ', departamento) 
                FROM ubigeo WHERE id_ubigeo = h.id_ubigeo
            )
            ELSE 'En tránsito'
        END AS ubicacion
    FROM seguimiento_envio h
    JOIN envios env ON h.id_envio = env.id_envio
    JOIN estados_envio e ON h.id_estado = e.id_estado
    WHERE env.codigo_seguimiento = p_codigo
    ORDER BY h.fecha_hora DESC;
END//

-- =====================================================
-- II. Procedimiento de Rastreo Detallado (Para Cliente Logueado)
-- =====================================================
-- Este procedimiento devuelve información más detallada
-- del envío para clientes autenticados
-- =====================================================

DROP PROCEDURE IF EXISTS sp_obtener_tracking_cliente//

CREATE PROCEDURE sp_obtener_tracking_cliente(
    IN p_codigo VARCHAR(30),
    IN p_id_usuario INT
)
BEGIN
    -- Primero verificar que el envío pertenece al usuario
    DECLARE v_id_envio BIGINT;
    DECLARE v_autorizado BOOLEAN DEFAULT FALSE;
    
    SELECT id_envio INTO v_id_envio
    FROM envios 
    WHERE codigo_seguimiento = p_codigo
    AND (id_usuario_remitente = p_id_usuario OR id_usuario_destinatario = p_id_usuario)
    LIMIT 1;
    
    IF v_id_envio IS NOT NULL THEN
        SET v_autorizado = TRUE;
    END IF;
    
    IF v_autorizado THEN
        -- Retornar datos del envío
        SELECT 
            e.codigo_seguimiento,
            e.fecha_registro,
            e.fecha_estimada_entrega,
            e.fecha_entrega,
            e.costo_envio_total,
            e.valor_declarado_total,
            es.nombre AS estado_actual,
            a_orig.nombre AS agencia_origen,
            a_dest.nombre AS agencia_destino,
            dd.nombre_destinatario,
            dd.direccion AS direccion_destino,
            dd.telefono AS telefono_destino,
            CONCAT(ub_dest.distrito, ', ', ub_dest.provincia, ', ', ub_dest.departamento) AS ubigeo_destino
        FROM envios e
        JOIN estados_envio es ON e.estado_actual = es.id_estado
        JOIN agencias a_orig ON e.id_agencia_origen = a_orig.id_agencia
        JOIN agencias a_dest ON e.id_agencia_destino = a_dest.id_agencia
        LEFT JOIN direccion_destino_envio dd ON e.id_envio = dd.id_envio
        LEFT JOIN ubigeo ub_dest ON dd.id_ubigeo = ub_dest.id_ubigeo
        WHERE e.id_envio = v_id_envio;
        
        -- Retornar historial de seguimiento
        SELECT 
            h.fecha_hora,
            e.nombre AS estado,
            h.descripcion_evento,
            CASE 
                WHEN h.id_agencia IS NOT NULL THEN (
                    SELECT nombre FROM agencias WHERE id_agencia = h.id_agencia
                )
                WHEN h.id_ubigeo IS NOT NULL THEN (
                    SELECT CONCAT(distrito, ', ', provincia, ', ', departamento) 
                    FROM ubigeo WHERE id_ubigeo = h.id_ubigeo
                )
                ELSE 'En tránsito'
            END AS ubicacion
        FROM seguimiento_envio h
        JOIN estados_envio e ON h.id_estado = e.id_estado
        WHERE h.id_envio = v_id_envio
        ORDER BY h.fecha_hora DESC;
        
        -- Retornar paquetes
        SELECT 
            tipo_paquete,
            descripcion_contenido,
            peso_kg,
            CONCAT(largo_cm, ' x ', ancho_cm, ' x ', alto_cm, ' cm') AS dimensiones,
            fragil,
            valor_declarado
        FROM paquetes
        WHERE id_envio = v_id_envio;
    ELSE
        -- Envío no autorizado
        SELECT 'No autorizado' AS error;
    END IF;
END//

DELIMITER ;

-- Verificar que se crearon correctamente
SHOW PROCEDURE STATUS WHERE Db = 'paqueteria_peru';
