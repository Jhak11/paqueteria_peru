 use  paqueteria_peru;
-- =====================================================
-- 2. CARGA DE DATOS ESTÁTICOS
-- =====================================================

INSERT IGNORE INTO roles (nombre, descripcion) VALUES 
('Administrador','Acceso total al sistema'),
('Cliente','Usuario cliente que realiza envíos'),
('Empleado','Personal de mostrador y almacén'),
('Conductor','Chofer de ruta y reparto');

INSERT IGNORE INTO estados_envio (id_estado, nombre, descripcion) VALUES 
(1,'Registrado','Envío registrado, pendiente de entrega en agencia'),
(2,'En Almacén Origen','Recibido en la agencia de origen'),
(3,'En Ruta','En transporte hacia la ciudad de destino'),
(4,'En Almacén Destino','Recibido en la agencia de destino'),
(5,'En Reparto','Salió a distribución final'),
(6,'Entregado','Entregado al destinatario'),
(7,'Devuelto','No se pudo entregar, devuelto a origen');

SET GLOBAL local_infile = 1;

-- Carga masiva de Ubigeo (Asegurando ruta)
LOAD DATA LOCAL INFILE 'C:/Users/ASUS 40-60/Downloads/paqueteria_peru_bd (1)/paqueteria_peru_bd/ubigeo.csv'
INTO TABLE ubigeo
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id_ubigeo, departamento, provincia, distrito);

-- Agencias Principales y Secundarias (Simulación)
-- Usamos ubigeos fijos de capitales
INSERT INTO agencias (nombre, direccion, id_ubigeo, tipo, telefono, estado) VALUES 
('Sede Central Lima', 'Av. Javier Prado Este 2501', '150101', 'mixta', '01-224-5555', 'activa'),
('Base Arequipa', 'Calle Mercaderes 500', '040101', 'mixta', '054-222-111', 'activa'),
('Base Cusco', 'Av. El Sol 800', '080101', 'mixta', '084-233-444', 'activa'),
('Agencia Trujillo', 'Jr. Pizarro 400', '130101', 'mixta', '044-211-122', 'activa'),
('Agencia Chiclayo', 'Av. Balta 1200', '140101', 'destino', '074-200-300', 'activa'),
('Agencia Piura', 'Calle Tacna 550', '200101', 'destino', '073-300-400', 'activa'),
('Agencia Huancayo', 'Calle Real 900', '120101', 'origen', '064-500-600', 'activa'),
('Agencia Iquitos', 'Av. Quiñones 120', '160101', 'destino', '065-222-222', 'activa');

-- Vehículos Variados (Flota completa)
INSERT INTO vehiculos (placa, marca, modelo, capacidad_kg, tipo, estado) VALUES 
('A1B-100', 'Toyota', 'Hiace', 1500, 'furgoneta', 'activo'),
('A2C-200', 'Hyundai', 'H1', 1200, 'furgoneta', 'activo'),
('B3D-300', 'Volvo', 'FH16', 25000, 'camion', 'activo'),
('C4E-400', 'Scania', 'R450', 28000, 'camion', 'activo'),
('D5F-500', 'Mitsubishi', 'Canter', 5000, 'camioneta', 'activo'),
('E6G-600', 'Honda', 'GL150', 50, 'moto', 'activo'),
('F7H-700', 'Yamaha', 'FZN', 60, 'moto', 'activo'),
('G8I-800', 'Mercedes', 'Sprinter', 2000, 'furgoneta', 'mantenimiento'),
('H9J-900', 'Hino', 'Dutro', 4000, 'camion', 'activo'),
('I0K-000', 'Isuzu', 'NPR', 4500, 'camion', 'activo');

-- Rutas Logísticas
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(1, 2, 1015.00, 960, 'principal'), -- Lima -> Arequipa
(2, 1, 1015.00, 960, 'principal'),
(1, 3, 1100.00, 1020, 'principal'), -- Lima -> Cusco
(3, 1, 1100.00, 1020, 'principal'),
(1, 4, 560.00, 480, 'principal'), -- Lima -> Trujillo
(4, 1, 560.00, 480, 'principal'),
(1, 7, 300.00, 360, 'secundaria'); -- Lima -> Huancayo

-- =====================================================
-- 3. PROCEDIMIENTO MASIVO
-- =====================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS generar_datos_coherentes$$

CREATE PROCEDURE generar_datos_coherentes()
BEGIN
    DECLARE i INT DEFAULT 0;
    
    -- Variables para Datos Aleatorios
    DECLARE v_nombre VARCHAR(50);
    DECLARE v_apellido VARCHAR(50);
    DECLARE v_dni VARCHAR(20);
    DECLARE v_email VARCHAR(100);
    DECLARE v_telefono VARCHAR(20);
    DECLARE v_ubigeo CHAR(6);
    DECLARE v_direccion VARCHAR(250);
    
    -- Variables para Empresas
    DECLARE v_razon_social VARCHAR(150);
    DECLARE v_ruc VARCHAR(11);
    
    -- Variables para Envíos y Finanzas
    DECLARE v_remitente INT;
    DECLARE v_destinatario INT;
    DECLARE v_ag_origen INT;
    DECLARE v_ag_destino INT;
    DECLARE v_fecha_reg DATETIME;
    DECLARE v_estado INT;
    DECLARE v_costo DECIMAL(12,2);
    DECLARE v_last_envio BIGINT;
    DECLARE v_peso DECIMAL(8,3);
    
    -- Control
    DECLARE max_users INT DEFAULT 2800; -- Más de 2000
    DECLARE max_companies INT DEFAULT 80;
    DECLARE max_envios INT DEFAULT 6000;
    
    -- ---------------------------------------------------
    -- A. GENERAR USUARIOS (REALISTAS)
    -- ---------------------------------------------------
    SET i = 0;
    WHILE i < max_users DO
        -- Generar nombres peruanos comunes
        SET v_nombre = ELT(FLOOR(1 + RAND() * 20), 
            'Juan', 'José', 'Luis', 'Carlos', 'Jorge', 
            'María', 'Ana', 'Rosa', 'Carmen', 'Sofía', 
            'Miguel', 'Pedro', 'David', 'Manuel', 'Victor',
            'Lucía', 'Elena', 'Patricia', 'Isabel', 'Gabriela');
            
        SET v_apellido = ELT(FLOOR(1 + RAND() * 20), 
            'Quispe', 'Flores', 'Sánchez', 'García', 'Rojas', 
            'Huamán', 'Mamani', 'Chávez', 'Vásquez', 'Ramos',
            'López', 'Torres', 'Díaz', 'Gonzáles', 'Rodríguez',
            'Mendoza', 'Espinoza', 'Castillo', 'Fernández', 'Gutiérrez');
            
        SET v_dni = FLOOR(10000000 + RAND() * 89999999);
        SET v_email = CONCAT(LOWER(v_nombre), '.', LOWER(v_apellido), '.', FLOOR(RAND()*999), '@gmail.com');
        SET v_telefono = CONCAT('9', FLOOR(10000000 + RAND() * 89999999));
        
        -- Dirección aleatoria
        SET v_direccion = CONCAT(
            ELT(FLOOR(1 + RAND() * 5), 'Av.', 'Ca.', 'Jr.', 'Psje.', 'Carr.'), ' ',
            ELT(FLOOR(1 + RAND() * 10), 'Perú', 'Arequipa', 'Lima', 'Grau', 'Bolognesi', 'Alfonso Ugarte', 'Pardo', 'Larco', 'Brasil', 'La Marina'),
            ' ', FLOOR(100 + RAND() * 3000)
        );
        
        -- Ubigeo Real
        SELECT id_ubigeo INTO v_ubigeo FROM ubigeo ORDER BY RAND() LIMIT 1;
        
        INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, correo, telefono, direccion, id_ubigeo)
        VALUES (v_nombre, v_apellido, 'DNI', v_dni, v_email, v_telefono, v_direccion, v_ubigeo);
        
        -- Asignar Rol: 80% Clientes, 10% Empleados, 10% Conductores
        IF RAND() < 0.8 THEN
            INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (LAST_INSERT_ID(), 2); -- Cliente
        ELSEIF RAND() < 0.5 THEN -- Del 20% restante, mitad
            INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (LAST_INSERT_ID(), 3); -- Empleado
        ELSE
            INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (LAST_INSERT_ID(), 4); -- Conductor
        END IF;
        
        SET i = i + 1;
    END WHILE;
    
    -- ---------------------------------------------------
    -- B. GENERAR EMPRESAS Y CONTACTOS
    -- ---------------------------------------------------
    SET i = 0;
    WHILE i < max_companies DO
        SET v_ubigeo = (SELECT id_ubigeo FROM ubigeo ORDER BY RAND() LIMIT 1);
        SET v_ruc = CONCAT('20', FLOOR(100000000 + RAND() * 899999999));
        SET v_razon_social = CONCAT('Inversiones ', ELT(FLOOR(1 + RAND() * 10), 'Andina', 'Del Sur', 'Norte', 'Global', 'Logística', 'Express', 'Rápida', 'Segura', 'Digital', 'Futuro'), ' S.A.C.');
        
        INSERT INTO empresas_cliente (razon_social, ruc, nombre_comercial, direccion_fiscal, id_ubigeo, telefono_central)
        VALUES (v_razon_social, v_ruc, v_razon_social, 'Av. Industrial 500', v_ubigeo, CONCAT('01-', FLOOR(2000000 + RAND()*5000000)));
        
        -- Contacto para la empresa
        INSERT INTO empresa_contactos (id_empresa, nombre_completo, cargo, correo, telefono_movil, es_principal)
        VALUES (LAST_INSERT_ID(), 'Gerente General', 'Gerente', CONCAT('contacto@', FLOOR(RAND()*1000), '.com'), '999888777', 1);
        
        SET i = i + 1;
    END WHILE;
    
    -- ---------------------------------------------------
    -- C. GENERAR VIAJES (Para conectar envíos)
    -- ---------------------------------------------------
    SET i = 0;
    WHILE i < 100 DO
        INSERT INTO viajes (id_ruta, id_vehiculo, fecha_salida, fecha_llegada_estimada, estado)
        SELECT 
            id_ruta, 
            (SELECT id_vehiculo FROM vehiculos ORDER BY RAND() LIMIT 1),
            DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*30) DAY), -- Salidas último mes
            DATE_ADD(NOW(), INTERVAL 1 DAY),
            'completado'
        FROM rutas ORDER BY RAND() LIMIT 1;
        SET i = i + 1;
    END WHILE;

    -- ---------------------------------------------------
    -- D. GENERAR ENVÍOS (CICLO COMPLETO)
    -- ---------------------------------------------------
    SET i = 0;
    WHILE i < max_envios DO
        -- Datos Base
        SELECT id_usuario INTO v_remitente FROM usuarios WHERE id_usuario < 2000 ORDER BY RAND() LIMIT 1; -- Clientes
        SELECT id_usuario INTO v_destinatario FROM usuarios WHERE id_usuario != v_remitente ORDER BY RAND() LIMIT 1;
        SELECT id_agencia INTO v_ag_origen FROM agencias ORDER BY RAND() LIMIT 1;
        SELECT id_agencia INTO v_ag_destino FROM agencias WHERE id_agencia != v_ag_origen ORDER BY RAND() LIMIT 1;
        
        SET v_fecha_reg = DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 180) DAY); -- Últimos 6 meses
        SET v_costo = ROUND(15 + RAND() * 250, 2);
        
        -- Probabilidad de Estados
        -- 50% Entregados, 20% En Ruta, 10% Registrados, etc.
        IF RAND() < 0.5 THEN SET v_estado = 6; -- Entregado
        ELSEIF RAND() < 0.8 THEN SET v_estado = 3; -- En Ruta
        ELSE SET v_estado = 1; -- Registrado
        END IF;
        
        INSERT INTO envios (
            codigo_seguimiento, id_usuario_remitente, id_usuario_destinatario, 
            id_agencia_origen, id_agencia_destino, fecha_registro, 
            estado_actual, costo_envio_total, fecha_entrega
        ) VALUES (
            CONCAT('PKG-', LPAD(i, 6, '0'), '-', CHAR(65 + FLOOR(RAND()*25))),
            v_remitente, v_destinatario, v_ag_origen, v_ag_destino, v_fecha_reg,
            v_estado, v_costo, IF(v_estado=6, DATE_ADD(v_fecha_reg, INTERVAL 3 DAY), NULL)
        );
        SET v_last_envio = LAST_INSERT_ID();
        
        -- Paquetes
        SET v_peso = ROUND(0.5 + RAND() * 15, 2);
        INSERT INTO paquetes (id_envio, descripcion_contenido, peso_kg, tipo_paquete)
        VALUES (v_last_envio, ELT(FLOOR(1+RAND()*4), 'Ropa', 'Electrónicos', 'Documentos', 'Repuestos'), v_peso, 'caja_chica');
        
        -- Direccion Destino
        INSERT INTO direccion_destino_envio (id_envio, nombre_destinatario, direccion, id_ubigeo)
        VALUES (v_last_envio, 'Destinatario Final', 'Direccion de entrega casa', (SELECT id_ubigeo FROM ubigeo ORDER BY RAND() LIMIT 1));
        
        -- Pagos (Si no está anulado)
        IF v_estado != 7 THEN
            INSERT INTO pagos (id_envio, monto, metodo_pago, estado)
            VALUES (v_last_envio, v_costo, ELT(FLOOR(1+RAND()*3), 'yape', 'tarjeta', 'efectivo'), 'pagado');
            
            -- Facturas (30% de probabilidad)
            IF RAND() < 0.3 THEN
                INSERT INTO facturas (id_envio, numero_serie, numero_correlativo, tipo_comprobante, subtotal, monto_igv, total)
                VALUES (v_last_envio, 'F001', LPAD(i, 8, '0'), 'boleta', v_costo/1.18, v_costo - (v_costo/1.18), v_costo);
            END IF;
        END IF;

        SET i = i + 1;
    END WHILE;
    
END$$

DELIMITER ;

CALL generar_datos_coherentes();
use paqueteria_peru_masiva;
select*from usuarios;
select*from estadios_envio;


