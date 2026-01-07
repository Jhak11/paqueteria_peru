USE paqueteria_peru;

-- =========================================================
-- 1. PROCEDIMIENTO ALMACENADO
-- Registro de pagos de forma segura
-- =========================================================

DROP PROCEDURE IF EXISTS pago_simple;
DELIMITER $$

CREATE PROCEDURE pago_simple(
    IN p_monto DECIMAL(12,2),
    IN p_metodo VARCHAR(20)
)
BEGIN
    DECLARE v_id_envio BIGINT;

    -- Obtener un envío válido existente
    SELECT id_envio
    INTO v_id_envio
    FROM envios
    ORDER BY RAND()
    LIMIT 1;

    START TRANSACTION;

    INSERT INTO pagos (id_envio, monto, metodo_pago, fecha_pago, estado)
    VALUES (v_id_envio, p_monto, p_metodo, NOW(), 'pagado');

    COMMIT;

    SELECT CONCAT('Pago registrado correctamente para el envío ', v_id_envio) AS mensaje;
END$$

DELIMITER ;

-- Ejecución del procedimiento
-- CALL pago_simple(100.00, 'yape');



-- =========================================================
-- 2. WINDOW FUNCTIONS - TOP 3 ENVÍOS POR CLIENTE
-- =========================================================

SELECT *
FROM (
    SELECT 
        id_usuario_remitente,
        codigo_seguimiento,
        fecha_registro,
        ROW_NUMBER() OVER (
            PARTITION BY id_usuario_remitente
            ORDER BY fecha_registro DESC
        ) AS numero_envio
    FROM envios
) t
WHERE numero_envio <= 3
ORDER BY id_usuario_remitente, fecha_registro DESC;



-- =========================================================
-- 3. WINDOW FUNCTIONS - RANK y DENSE_RANK
-- =========================================================

SELECT 
    id_usuario_remitente,
    COUNT(*) AS total_envios,
    RANK() OVER (ORDER BY COUNT(*) DESC) AS ranking,
    DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) AS ranking_denso
FROM envios
GROUP BY id_usuario_remitente
ORDER BY total_envios DESC
LIMIT 10;



-- =========================================================
-- 4. ÍNDICES Y OPTIMIZACIÓN (MariaDB compatible)
-- =========================================================

EXPLAIN
SELECT *
FROM envios
WHERE fecha_registro >= CURDATE()
  AND fecha_registro < CURDATE() + INTERVAL 1 DAY;



-- =========================================================
-- 5. TRANSACCIONES (ACID)
-- COMMIT y ROLLBACK con datos válidos
-- =========================================================

-- Caso COMMIT
START TRANSACTION;

INSERT INTO pagos (id_envio, monto, metodo_pago, fecha_pago, estado)
SELECT id_envio, 50.00, 'efectivo', NOW(), 'pagado'
FROM envios
ORDER BY RAND()
LIMIT 1;

COMMIT;


-- Caso ROLLBACK (operación válida pero cancelada)
START TRANSACTION;

INSERT INTO pagos (id_envio, monto, metodo_pago, fecha_pago, estado)
SELECT id_envio, 999.99, 'tarjeta', NOW(), 'pagado'
FROM envios
ORDER BY RAND()
LIMIT 1;

ROLLBACK;



-- =========================================================
-- 6. TRAZABILIDAD DE ENVÍOS
-- =========================================================

SELECT 
    e.codigo_seguimiento,
    s.fecha_hora,
    es.nombre AS estado,
    s.descripcion_evento,
    a.nombre AS agencia,
    v.placa AS vehiculo
FROM seguimiento_envio s
JOIN envios e ON e.id_envio = s.id_envio
JOIN estados_envio es ON es.id_estado = s.id_estado
LEFT JOIN agencias a ON a.id_agencia = s.id_agencia
LEFT JOIN vehiculos v ON v.id_vehiculo = s.id_vehiculo
ORDER BY s.fecha_hora ASC
LIMIT 50;



-- =========================================================
-- 7. PROCEDIMIENTOS DE REGISTRO ASISTIDO (ONBOARDING)
-- =========================================================

-- Flujo 1: Registro de Personal Interno
DROP PROCEDURE IF EXISTS registrar_empleado;
DELIMITER $$

CREATE PROCEDURE registrar_empleado(
    IN p_nombres VARCHAR(120),
    IN p_apellidos VARCHAR(120),
    IN p_dni VARCHAR(20),
    IN p_correo_corp VARCHAR(150),
    IN p_password_hash VARCHAR(255),
    IN p_rol_nombre VARCHAR(30)
)
BEGIN
    DECLARE v_id_usuario INT;
    DECLARE v_id_rol TINYINT;

    -- Validar que el rol exista
    SELECT id_rol INTO v_id_rol FROM roles WHERE nombre = p_rol_nombre;
    
    IF v_id_rol IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El rol especificado no existe.';
    END IF;

    START TRANSACTION;

    -- 1. Crear Perfil
    INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento)
    VALUES (p_nombres, p_apellidos, 'DNI', p_dni);
    
    SET v_id_usuario = LAST_INSERT_ID();

    -- 2. Crear Acceso
    INSERT INTO credenciales (id_usuario, correo, password_hash)
    VALUES (v_id_usuario, p_correo_corp, p_password_hash);

    -- 3. Asignar Poder (Rol)
    INSERT INTO usuario_roles (id_usuario, id_rol)
    VALUES (v_id_usuario, v_id_rol);

    COMMIT;
END$$

-- Flujo 2: Registro de Empresa Cliente (B2B)
DROP PROCEDURE IF EXISTS registrar_empresa_b2b;

CREATE PROCEDURE registrar_empresa_b2b(
    -- Datos Empresa
    IN p_razon_social VARCHAR(200),
    IN p_ruc VARCHAR(11),
    IN p_linea_credito DECIMAL(12,2),
    
    -- Datos Representante
    IN p_rep_nombres VARCHAR(120),
    IN p_rep_apellidos VARCHAR(120),
    IN p_rep_dni VARCHAR(20),
    IN p_rep_correo VARCHAR(150),
    IN p_rep_pass_hash VARCHAR(255)
)
BEGIN
    DECLARE v_id_empresa INT;
    DECLARE v_id_usuario INT;
    DECLARE v_id_rol_cliente TINYINT;

    -- Obtener ID rol cliente
    SELECT id_rol INTO v_id_rol_cliente FROM roles WHERE nombre = 'Cliente';

    START TRANSACTION;

    -- 1. Registro de Empresa
    INSERT INTO empresas_cliente (razon_social, ruc, linea_credito, estado)
    VALUES (p_razon_social, p_ruc, p_linea_credito, 'activo');
    
    SET v_id_empresa = LAST_INSERT_ID();

    -- 2. Registro del Representante (Identidad)
    INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento)
    VALUES (p_rep_nombres, p_rep_apellidos, 'DNI', p_rep_dni);
    
    SET v_id_usuario = LAST_INSERT_ID();

    -- 3. Registro del Representante (Acceso)
    INSERT INTO credenciales (id_usuario, correo, password_hash)
    VALUES (v_id_usuario, p_rep_correo, p_rep_pass_hash);

    -- 4. Registro del Representante (Rol)
    INSERT INTO usuario_roles (id_usuario, id_rol)
    VALUES (v_id_usuario, v_id_rol_cliente);

    -- 5. Vinculación (Usuario -> Empresa)
    INSERT INTO empresa_contactos (id_empresa, id_usuario, nombre_completo, correo, es_principal)
    VALUES (v_id_empresa, v_id_usuario, CONCAT(p_rep_nombres, ' ', p_rep_apellidos), p_rep_correo, 1);

    COMMIT;
END$$

DELIMITER ;
