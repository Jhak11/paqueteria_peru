USE paqueteria_peru;

-- =====================================================
-- CARGA MASIVA: 2000 USUARIOS + ENVÍOS COHERENTES
-- =====================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS generar_2000_usuarios_completos$$

CREATE PROCEDURE generar_2000_usuarios_completos()
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE j INT DEFAULT 0;
    DECLARE v_nombre VARCHAR(50);
    DECLARE v_apellido VARCHAR(50);
    DECLARE v_dni VARCHAR(20);
    DECLARE v_email VARCHAR(100);
    DECLARE v_telefono VARCHAR(20);
    DECLARE v_ubigeo CHAR(6);
    DECLARE v_direccion VARCHAR(250);
    DECLARE v_id_usuario INT;
    DECLARE v_remitente INT;
    DECLARE v_destinatario INT;
    DECLARE v_ag_origen INT;
    DECLARE v_ag_destino INT;
    DECLARE v_fecha_reg DATETIME;
    DECLARE v_estado INT;
    DECLARE v_costo DECIMAL(12,2);
    DECLARE v_peso DECIMAL(8,3);
    DECLARE v_last_envio BIGINT;
    DECLARE v_id_viaje BIGINT;
    
    -- A. GENERAR 2000 USUARIOS
    WHILE i < 2000 DO
        -- Nombre aleatorio
        SET v_nombre = ELT(FLOOR(1 + RAND() * 30), 
            'Juan','José','Luis','Carlos','Jorge','Miguel','Pedro','David','Manuel','Victor',
            'María','Ana','Rosa','Carmen','Sofía','Lucía','Elena','Patricia','Isabel','Gabriela',
            'Fernando','Ricardo','Laura','Andrea','Diego','Hugo','Mónica','Daniela','Pablo','Andrés');
        
        SET v_apellido = CONCAT(
            ELT(FLOOR(1 + RAND() * 30), 
                'Quispe','Flores','Sánchez','García','Rojas','Huamán','Mamani','Chávez','Vásquez','Ramos',
                'López','Torres','Díaz','Gonzáles','Rodríguez','Mendoza','Espinoza','Castillo','Fernández','Gutiérrez',
                'Vargas','Romero','Herrera','Medina','Aguilar','Morales','Reyes','Cruz','Jiménez','Pérez'),
            ' ',
            ELT(FLOOR(1 + RAND() * 15), 
                'Silva','Campos','Salazar','Ortiz','Delgado','Castro','Ruiz','Benítez','Paredes','Navarro',
                'Ríos','Mejía','Muñoz','Córdova','León')
        );
        
        SET v_dni = LPAD(70000500 + i, 8, '0');
        SET v_email = CONCAT(LOWER(v_nombre), '.', LOWER(SUBSTRING_INDEX(v_apellido, ' ', 1)), i, '@gmail.com');
        SET v_telefono = CONCAT('9', LPAD(FLOOR(10000000 + RAND() * 89999999), 8, '0'));
        SET v_direccion = CONCAT(
            ELT(FLOOR(1 + RAND() * 5), 'Av.', 'Jr.', 'Calle', 'Psje.', 'Parque'), ' ',
            ELT(FLOOR(1 + RAND() * 15), 'Los Laureles', 'San Martín', 'Bolívar', 'Grau', 'Pardo', 'Arequipa', 
                'Lima', 'Cusco', 'Tacna', 'Ayacucho', 'El Sol', 'Las Flores', 'Comercio', 'Unión', 'Progreso'),
            ' Nro. ', FLOOR(100 + RAND() * 2000)
        );
        
        SELECT id_ubigeo INTO v_ubigeo FROM ubigeo ORDER BY RAND() LIMIT 1;
        
        -- Insertar usuario (SIN campo correo)
        INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, telefono, direccion, id_ubigeo)
        VALUES (v_nombre, v_apellido, 'DNI', v_dni, v_telefono, v_direccion, v_ubigeo);
        
        SET v_id_usuario = LAST_INSERT_ID();
        
        -- Asignar rol: 85% Clientes, 10% Empleados, 5% Conductores
        IF RAND() < 0.85 THEN
            INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (v_id_usuario, 2); -- Cliente
            -- 40% de clientes tienen credenciales
            IF RAND() < 0.4 THEN
                INSERT INTO credenciales (id_usuario, correo, password_hash, estado)
                VALUES (v_id_usuario, v_email, SHA2(CONCAT('pass', v_dni), 256), 'activo');
            END IF;
        ELSEIF RAND() < 0.666 THEN
            INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (v_id_usuario, 3); -- Empleado
            INSERT INTO credenciales (id_usuario, correo, password_hash, estado)
            VALUES (v_id_usuario, v_email, SHA2(CONCAT('emp', v_dni), 256), 'activo');
        ELSE
            INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (v_id_usuario, 4); -- Conductor
            INSERT INTO credenciales (id_usuario, correo, password_hash, estado)
            VALUES (v_id_usuario, v_email, SHA2(CONCAT('cond', v_dni), 256), 'activo');
        END IF;
        
        SET i = i + 1;
    END WHILE;
    
    -- B. GENERAR VIAJES ADICIONALES
    SET i = 0;
    WHILE i < 100 DO
        INSERT INTO viajes (id_ruta, id_vehiculo, id_conductor, fecha_salida, fecha_llegada_estimada, estado)
        SELECT 
            r.id_ruta,
            (SELECT id_vehiculo FROM vehiculos WHERE estado = 'activo' ORDER BY RAND() LIMIT 1),
            (SELECT u.id_usuario FROM usuario_roles ur JOIN usuarios u ON ur.id_usuario = u.id_usuario WHERE ur.id_rol = 4 ORDER BY RAND() LIMIT 1),
            DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 60) DAY),
            DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 55) DAY),
            'completado'
        FROM rutas r ORDER BY RAND() LIMIT 1;
        SET i = i + 1;
    END WHILE;
    
    -- C. GENERAR ENVÍOS (3000-4000 aproximadamente)
    SET i = 0;
    WHILE i < 3500 DO
        -- Seleccionar remitente y destinatario (clientes)
        SELECT u.id_usuario INTO v_remitente 
        FROM usuarios u 
        JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario 
        WHERE ur.id_rol = 2 
        ORDER BY RAND() LIMIT 1;
        
        SELECT u.id_usuario INTO v_destinatario 
        FROM usuarios u 
        WHERE u.id_usuario != v_remitente 
        ORDER BY RAND() LIMIT 1;
        
        SELECT id_agencia INTO v_ag_origen FROM agencias ORDER BY RAND() LIMIT 1;
        SELECT id_agencia INTO v_ag_destino FROM agencias WHERE id_agencia != v_ag_origen ORDER BY RAND() LIMIT 1;
        
        SET v_fecha_reg = DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 120) DAY);
        SET v_peso = ROUND(0.5 + RAND() * 20, 2);
        SET v_costo = ROUND(15 + (v_peso * 5) + RAND() * 50, 2);
        
        -- Estado: 60% Entregado, 20% En Ruta, 10% En Almacén, 10% otros
        SET v_estado = CASE 
            WHEN RAND() < 0.60 THEN 6
            WHEN RAND() < 0.80 THEN 3
            WHEN RAND() < 0.90 THEN 4
            ELSE FLOOR(1 + RAND() * 5)
        END;
        
        -- Insertar envío
        INSERT INTO envios (
            codigo_seguimiento, id_usuario_remitente, id_usuario_destinatario, 
            id_agencia_origen, id_agencia_destino, fecha_registro, 
            estado_actual, costo_envio_total, valor_declarado_total,
            fecha_entrega
        ) VALUES (
            CONCAT('PE-2026-', UNIX_TIMESTAMP(), '-', LPAD(i + 1, 5, '0')),
            v_remitente, v_destinatario, v_ag_origen, v_ag_destino, v_fecha_reg,
            v_estado, v_costo, v_costo * FLOOR(3 + RAND() * 7),
            IF(v_estado = 6, DATE_ADD(v_fecha_reg, INTERVAL FLOOR(1 + RAND() * 5) DAY), NULL)
        );
        
        SET v_last_envio = LAST_INSERT_ID();
        
        -- Paquete
        INSERT INTO paquetes (id_envio, descripcion_contenido, peso_kg, tipo_paquete, fragil)
        VALUES (
            v_last_envio, 
            ELT(FLOOR(1 + RAND() * 10), 'Ropa', 'Documentos', 'Electrónicos', 'Libros', 
                'Repuestos', 'Artículos oficina', 'Productos belleza', 'Juguetes', 'Herramientas', 'Alimentos'),
            v_peso, 
            ELT(FLOOR(1 + RAND() * 4), 'sobre', 'caja_chica', 'caja_chica', 'caja_grande'),
            IF(RAND() < 0.15, 1, 0)
        );
        
        -- Dirección destino
        INSERT INTO direccion_destino_envio (id_envio, nombre_destinatario, telefono, direccion, id_ubigeo)
        SELECT v_last_envio, CONCAT(u.nombres, ' ', u.apellidos), u.telefono, u.direccion, u.id_ubigeo
        FROM usuarios u WHERE u.id_usuario = v_destinatario;
        
        -- Pago
        IF RAND() < 0.92 THEN
            INSERT INTO pagos (id_envio, monto, metodo_pago, fecha_pago, estado)
            VALUES (
                v_last_envio, v_costo, 
                ELT(FLOOR(1 + RAND() * 5), 'efectivo', 'yape', 'plin', 'tarjeta', 'efectivo'),
                v_fecha_reg, 'pagado'
            );
            
            -- Factura (30%) - USAR ID DEL ENVÍO PARA CORRELATIVO ÚNICO
            IF RAND() < 0.30 THEN
                INSERT INTO facturas (id_envio, numero_serie, numero_correlativo, tipo_comprobante, 
                    fecha_emision, subtotal, monto_igv, total, estado)
                VALUES (
                    v_last_envio, 
                    IF(RAND() < 0.7, 'B001', 'F001'), 
                    LPAD(v_last_envio, 8, '0'),  -- USAR ID ENVÍO COMO CORRELATIVO
                    IF(RAND() < 0.7, 'boleta', 'factura'), 
                    v_fecha_reg,
                    ROUND(v_costo / 1.18, 2), 
                    ROUND(v_costo - (v_costo / 1.18), 2), 
                    v_costo, 
                    'emitida'
                );
            END IF;
        END IF;
        
        -- Seguimiento básico
        INSERT INTO seguimiento_envio (id_envio, fecha_hora, id_estado, descripcion_evento, id_agencia)
        VALUES (v_last_envio, v_fecha_reg, 1, 'Envío registrado', v_ag_origen);
        
        IF v_estado >= 2 THEN
            INSERT INTO seguimiento_envio (id_envio, fecha_hora, id_estado, descripcion_evento, id_agencia)
            VALUES (v_last_envio, DATE_ADD(v_fecha_reg, INTERVAL FLOOR(2 + RAND() * 6) HOUR), 2, 'En almacén origen', v_ag_origen);
        END IF;
        
        IF v_estado >= 3 THEN
            -- Asignar a viaje
            SELECT id_viaje INTO v_id_viaje FROM viajes ORDER BY RAND() LIMIT 1;
            INSERT IGNORE INTO envio_viaje (id_envio, id_viaje) VALUES (v_last_envio, v_id_viaje);
            INSERT INTO seguimiento_envio (id_envio, fecha_hora, id_estado, descripcion_evento)
            VALUES (v_last_envio, DATE_ADD(v_fecha_reg, INTERVAL FLOOR(8 + RAND() * 12) HOUR), 3, 'En tránsito');
        END IF;
        
        IF v_estado >= 4 THEN
            INSERT INTO seguimiento_envio (id_envio, fecha_hora, id_estado, descripcion_evento, id_agencia)
            VALUES (v_last_envio, DATE_ADD(v_fecha_reg, INTERVAL FLOOR(1 + RAND() * 2) DAY), 4, 'En almacén destino', v_ag_destino);
        END IF;
        
        IF v_estado >= 5 THEN
            INSERT INTO seguimiento_envio (id_envio, fecha_hora, id_estado, descripcion_evento)
            VALUES (v_last_envio, DATE_ADD(v_fecha_reg, INTERVAL FLOOR(2 + RAND() * 3) DAY), 5, 'En reparto');
        END IF;
        
        IF v_estado = 6 THEN
            INSERT INTO seguimiento_envio (id_envio, fecha_hora, id_estado, descripcion_evento)
            VALUES (v_last_envio, DATE_ADD(v_fecha_reg, INTERVAL FLOOR(2 + RAND() * 4) DAY), 6, 'Entregado');
        END IF;
        
        SET i = i + 1;
    END WHILE;
    
END$$

DELIMITER ;

-- EJECUTAR
CALL generar_2000_usuarios_completos();

-- VERIFICACIÓN
SELECT 'Usuarios' AS Tabla, COUNT(*) AS Total FROM usuarios
UNION ALL SELECT 'Credenciales', COUNT(*) FROM credenciales
UNION ALL SELECT 'Envíos', COUNT(*) FROM envios
UNION ALL SELECT 'Paquetes', COUNT(*) FROM paquetes
UNION ALL SELECT 'Pagos', COUNT(*) FROM pagos
UNION ALL SELECT 'Facturas', COUNT(*) FROM facturas
UNION ALL SELECT 'Seguimiento', COUNT(*) FROM seguimiento_envio
UNION ALL SELECT 'Viajes', COUNT(*) FROM viajes;

-- Distribución de roles
SELECT r.nombre, COUNT(*) AS cantidad 
FROM usuario_roles ur 
JOIN roles r ON ur.id_rol = r.id_rol 
GROUP BY r.nombre;

-- Estados de envíos
SELECT e.nombre, COUNT(*) AS cantidad 
FROM envios env 
JOIN estados_envio e ON env.estado_actual = e.id_estado 
GROUP BY e.nombre;
