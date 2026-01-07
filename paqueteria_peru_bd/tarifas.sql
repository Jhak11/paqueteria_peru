<<<<<<< HEAD
-- =====================================================
-- ACTUALIZACIÓN DE TARIFAS - Sistema Paquetería Perú
-- =====================================================
-- Tabla: tarifas
-- Dependencias: Ninguna (solo usa nombres de departamentos)
-- Nota: Las tarifas se vinculan con rutas mediante departamentos
-- =====================================================

USE paqueteria_peru;

-- =====================================================
-- A. TARIFAS DESDE LIMA (HUB PRINCIPAL)
-- =====================================================

-- Lima → Arequipa
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LIMA', 'AREQUIPA', 'estandar', 35.00, 1.00, 12.00, 2, 4, 'vigente'),
('LIMA', 'AREQUIPA', 'express', 55.00, 1.00, 15.00, 1, 2, 'vigente'),
('LIMA', 'AREQUIPA', 'carga_pesada', 120.00, 10.00, 8.00, 3, 5, 'vigente')
ON DUPLICATE KEY UPDATE precio_base = VALUES(precio_base), precio_kg_extra = VALUES(precio_kg_extra);

-- Lima → Cusco
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LIMA', 'CUSCO', 'estandar', 40.00, 1.00, 13.00, 2, 4, 'vigente'),
('LIMA', 'CUSCO', 'express', 60.00, 1.00, 16.00, 1, 2, 'vigente'),
('LIMA', 'CUSCO', 'carga_pesada', 130.00, 10.00, 9.00, 3, 5, 'vigente')
ON DUPLICATE KEY UPDATE precio_base = VALUES(precio_base), precio_kg_extra = VALUES(precio_kg_extra);

-- Lima → Trujillo
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LIMA', 'LA LIBERTAD', 'estandar', 25.00, 1.00, 10.00, 1, 3, 'vigente'),
('LIMA', 'LA LIBERTAD', 'express', 40.00, 1.00, 12.00, 1, 1, 'vigente'),
('LIMA', 'LA LIBERTAD', 'carga_pesada', 90.00, 10.00, 7.00, 2, 4, 'vigente')
ON DUPLICATE KEY UPDATE precio_base = VALUES(precio_base), precio_kg_extra = VALUES(precio_kg_extra);

-- Lima → Chiclayo
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LIMA', 'LAMBAYEQUE', 'estandar', 30.00, 1.00, 11.00, 2, 3, 'vigente'),
('LIMA', 'LAMBAYEQUE', 'express', 48.00, 1.00, 14.00, 1, 2, 'vigente'),
('LIMA', 'LAMBAYEQUE', 'carga_pesada', 100.00, 10.00, 7.50, 2, 4, 'vigente')
ON DUPLICATE KEY UPDATE precio_base = VALUES(precio_base), precio_kg_extra = VALUES(precio_kg_extra);

-- Lima → Piura
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LIMA', 'PIURA', 'estandar', 38.00, 1.00, 12.50, 2, 4, 'vigente'),
('LIMA', 'PIURA', 'express', 58.00, 1.00, 15.50, 1, 2, 'vigente'),
('LIMA', 'PIURA', 'carga_pesada', 115.00, 10.00, 8.50, 3, 5, 'vigente')
ON DUPLICATE KEY UPDATE precio_base = VALUES(precio_base), precio_kg_extra = VALUES(precio_kg_extra);

-- Lima → Huancayo (Ruta más corta)
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LIMA', 'JUNIN', 'estandar', 20.00, 1.00, 8.00, 1, 2, 'vigente'),
('LIMA', 'JUNIN', 'express', 32.00, 1.00, 10.00, 1, 1, 'vigente'),
('LIMA', 'JUNIN', 'carga_pesada', 75.00, 10.00, 6.00, 1, 3, 'vigente')
ON DUPLICATE KEY UPDATE precio_base = VALUES(precio_base), precio_kg_extra = VALUES(precio_kg_extra);

-- Lima → Iquitos (Ruta estándar)
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LIMA', 'LORETO', 'estandar', 65.00, 1.00, 20.00, 5, 7, 'vigente'),
('LIMA', 'LORETO', 'express', 95.00, 1.00, 25.00, 3, 4, 'vigente'),
('LIMA', 'LORETO', 'carga_pesada', 200.00, 10.00, 15.00, 6, 8, 'vigente')
ON DUPLICATE KEY UPDATE precio_base = VALUES(precio_base), precio_kg_extra = VALUES(precio_kg_extra);

-- Lima → Lima (Local)
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LIMA', 'LIMA', 'estandar', 10.00, 1.00, 2.00, 1, 1, 'vigente'),
('LIMA', 'LIMA', 'express', 18.00, 1.00, 2.50, 0, 0, 'vigente')
ON DUPLICATE KEY UPDATE precio_base = VALUES(precio_base), precio_kg_extra = VALUES(precio_kg_extra);

-- =====================================================
-- B. TARIFAS DE REGRESO (PROVINCIAS → LIMA)
-- =====================================================

INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('AREQUIPA', 'LIMA', 'estandar', 35.00, 1.00, 12.00, 2, 4, 'vigente'),
('AREQUIPA', 'LIMA', 'express', 55.00, 1.00, 15.00, 1, 2, 'vigente'),
('AREQUIPA', 'LIMA', 'carga_pesada', 120.00, 10.00, 8.00, 3, 5, 'vigente'),

('CUSCO', 'LIMA', 'estandar', 40.00, 1.00, 13.00, 2, 4, 'vigente'),
('CUSCO', 'LIMA', 'express', 60.00, 1.00, 16.00, 1, 2, 'vigente'),
('CUSCO', 'LIMA', 'carga_pesada', 130.00, 10.00, 9.00, 3, 5, 'vigente'),

('LA LIBERTAD', 'LIMA', 'estandar', 25.00, 1.00, 10.00, 1, 3, 'vigente'),
('LA LIBERTAD', 'LIMA', 'express', 40.00, 1.00, 12.00, 1, 1, 'vigente'),
('LA LIBERTAD', 'LIMA', 'carga_pesada', 90.00, 10.00, 7.00, 2, 4, 'vigente'),

('LAMBAYEQUE', 'LIMA', 'estandar', 30.00, 1.00, 11.00, 2, 3, 'vigente'),
('LAMBAYEQUE', 'LIMA', 'express', 48.00, 1.00, 14.00, 1, 2, 'vigente'),
('LAMBAYEQUE', 'LIMA', 'carga_pesada', 100.00, 10.00, 7.50, 2, 4, 'vigente'),

('PIURA', 'LIMA', 'estandar', 38.00, 1.00, 12.50, 2, 4, 'vigente'),
('PIURA', 'LIMA', 'express', 58.00, 1.00, 15.50, 1, 2, 'vigente'),
('PIURA', 'LIMA', 'carga_pesada', 115.00, 10.00, 8.50, 3, 5, 'vigente'),

('JUNIN', 'LIMA', 'estandar', 20.00, 1.00, 8.00, 1, 2, 'vigente'),
('JUNIN', 'LIMA', 'express', 32.00, 1.00, 10.00, 1, 1, 'vigente'),
('JUNIN', 'LIMA', 'carga_pesada', 75.00, 10.00, 6.00, 1, 3, 'vigente'),

('LORETO', 'LIMA', 'estandar', 65.00, 1.00, 20.00, 5, 7, 'vigente'),
('LORETO', 'LIMA', 'express', 95.00, 1.00, 25.00, 3, 4, 'vigente'),
('LORETO', 'LIMA', 'carga_pesada', 200.00, 10.00, 15.00, 6, 8, 'vigente')
ON DUPLICATE KEY UPDATE precio_base = VALUES(precio_base), precio_kg_extra = VALUES(precio_kg_extra);

-- =====================================================
-- C. TARIFAS INTERPROVINCIALES
-- =====================================================

-- Arequipa ↔ Cusco
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('AREQUIPA', 'CUSCO', 'estandar', 30.00, 1.00, 11.00, 1, 3, 'vigente'),
('AREQUIPA', 'CUSCO', 'express', 48.00, 1.00, 14.00, 1, 2, 'vigente'),
('CUSCO', 'AREQUIPA', 'estandar', 30.00, 1.00, 11.00, 1, 3, 'vigente'),
('CUSCO', 'AREQUIPA', 'express', 48.00, 1.00, 14.00, 1, 2, 'vigente')
ON DUPLICATE KEY UPDATE precio_base = VALUES(precio_base), precio_kg_extra = VALUES(precio_kg_extra);

-- Trujillo ↔ Chiclayo
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LA LIBERTAD', 'LAMBAYEQUE', 'estandar', 18.00, 1.00, 7.00, 1, 2, 'vigente'),
('LA LIBERTAD', 'LAMBAYEQUE', 'express', 28.00, 1.00, 9.00, 1, 1, 'vigente'),
('LAMBAYEQUE', 'LA LIBERTAD', 'estandar', 18.00, 1.00, 7.00, 1, 2, 'vigente'),
('LAMBAYEQUE', 'LA LIBERTAD', 'express', 28.00, 1.00, 9.00, 1, 1, 'vigente')
ON DUPLICATE KEY UPDATE precio_base = VALUES(precio_base), precio_kg_extra = VALUES(precio_kg_extra);

-- Chiclayo ↔ Piura
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LAMBAYEQUE', 'PIURA', 'estandar', 20.00, 1.00, 8.00, 1, 2, 'vigente'),
('LAMBAYEQUE', 'PIURA', 'express', 32.00, 1.00, 10.00, 1, 1, 'vigente'),
('PIURA', 'LAMBAYEQUE', 'estandar', 20.00, 1.00, 8.00, 1, 2, 'vigente'),
('PIURA', 'LAMBAYEQUE', 'express', 32.00, 1.00, 10.00, 1, 1, 'vigente')
ON DUPLICATE KEY UPDATE precio_base = VALUES(precio_base), precio_kg_extra = VALUES(precio_kg_extra);

-- Trujillo ↔ Huancayo
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LA LIBERTAD', 'JUNIN', 'estandar', 28.00, 1.00, 10.00, 1, 3, 'vigente'),
('LA LIBERTAD', 'JUNIN', 'express', 45.00, 1.00, 13.00, 1, 2, 'vigente'),
('JUNIN', 'LA LIBERTAD', 'estandar', 28.00, 1.00, 10.00, 1, 3, 'vigente'),
('JUNIN', 'LA LIBERTAD', 'express', 45.00, 1.00, 13.00, 1, 2, 'vigente')
ON DUPLICATE KEY UPDATE precio_base = VALUES(precio_base), precio_kg_extra = VALUES(precio_kg_extra);

-- Cusco ↔ Huancayo
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('CUSCO', 'JUNIN', 'estandar', 35.00, 1.00, 12.00, 2, 4, 'vigente'),
('CUSCO', 'JUNIN', 'express', 55.00, 1.00, 15.00, 1, 2, 'vigente'),
('JUNIN', 'CUSCO', 'estandar', 35.00, 1.00, 12.00, 2, 4, 'vigente'),
('JUNIN', 'CUSCO', 'express', 55.00, 1.00, 15.00, 1, 2, 'vigente')
ON DUPLICATE KEY UPDATE precio_base = VALUES(precio_base), precio_kg_extra = VALUES(precio_kg_extra);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
SELECT 'TOTAL TARIFAS INSERTADAS' AS info, COUNT(*) AS cantidad FROM tarifas;

SELECT 
    'SERVICIOS POR RUTA' AS info,
    CONCAT(departamento_origen, ' → ', departamento_destino) AS ruta,
    GROUP_CONCAT(tipo_servicio ORDER BY tipo_servicio) AS servicios_disponibles,
    COUNT(*) AS num_servicios
FROM tarifas
GROUP BY departamento_origen, departamento_destino
ORDER BY departamento_origen, departamento_destino;
=======
-- Creación de la tabla tarifas
DROP TABLE IF EXISTS tarifas;
CREATE TABLE tarifas (
  id_tarifa INT AUTO_INCREMENT PRIMARY KEY,
  
  -- 1. ZONIFICACIÓN
  departamento_origen VARCHAR(100) NOT NULL,
  departamento_destino VARCHAR(100) NOT NULL,
  
  -- 2. TIPO DE SERVICIO
  tipo_servicio ENUM('estandar', 'express', 'carga_pesada') DEFAULT 'estandar',
  
  -- 3. FÓRMULA DE COBRO
  precio_base DECIMAL(10,2) NOT NULL,       -- Ej: 15.00 soles
  peso_base_kg DECIMAL(5,2) DEFAULT 1.00,   -- Ej: Esos 15 soles cubren hasta 1.00 Kg
  precio_kg_extra DECIMAL(10,2) NOT NULL,   -- Ej: 5.00 soles por cada Kg que se pase
  
  -- 4. TIEMPOS (Promesa de venta)
  tiempo_min_dias INT DEFAULT 1,
  tiempo_max_dias INT DEFAULT 3,
  
  estado ENUM('vigente','inactivo') DEFAULT 'vigente',
  
  -- Evita duplicar tarifas para la misma ruta y servicio
  UNIQUE KEY ux_ruta_servicio (departamento_origen, departamento_destino, tipo_servicio)
);

-- Inserción de datos iniciales
INSERT INTO tarifas 
(departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias) 
VALUES 

-- =============================================
-- 1. RUTA LOCAL (Lima Metropolitana)
-- =============================================
('LIMA', 'LIMA', 'estandar', 10.00, 1.00, 2.00, 1, 1),
('LIMA', 'LIMA', 'express', 18.00, 1.00, 2.50, 0, 0), -- Entrega mismo día

-- =============================================
-- 2. RUTA NORTE (Trujillo, Chiclayo, Piura)
-- =============================================
-- Lima -> La Libertad (Trujillo)
('LIMA', 'LA LIBERTAD', 'estandar', 15.00, 1.00, 3.50, 1, 2),
('LIMA', 'LA LIBERTAD', 'express', 24.00, 1.00, 5.00, 1, 1), -- Added Express
-- Lima -> Lambayeque (Chiclayo)
('LIMA', 'LAMBAYEQUE', 'estandar', 16.00, 1.00, 4.00, 2, 3),
('LIMA', 'LAMBAYEQUE', 'express', 26.00, 1.00, 6.00, 1, 1), -- Added Express
-- Lima -> Piura
('LIMA', 'PIURA', 'estandar', 18.00, 1.00, 4.50, 2, 3),
('LIMA', 'PIURA', 'express', 28.00, 1.00, 8.00, 1, 1), -- Vía Aérea

-- =============================================
-- 3. RUTA SUR (Arequipa)
-- =============================================
-- Lima -> Arequipa
('LIMA', 'AREQUIPA', 'estandar', 16.00, 1.00, 4.00, 2, 3),
('LIMA', 'AREQUIPA', 'express', 25.00, 1.00, 7.00, 1, 1),

-- =============================================
-- 4. RUTA SIERRA CENTRO Y SUR (Junín, Cusco)
-- =============================================
-- Lima -> Junin (Huancayo)
('LIMA', 'JUNIN', 'estandar', 14.00, 1.00, 3.00, 1, 2),
('LIMA', 'JUNIN', 'express', 22.00, 1.00, 5.00, 1, 1), -- Added Express
-- Lima -> Cusco (Ruta turística/comercial)
('LIMA', 'CUSCO', 'estandar', 22.00, 1.00, 5.50, 3, 4),
('LIMA', 'CUSCO', 'express', 35.00, 1.00, 9.00, 1, 1),

-- =============================================
-- 5. RUTA SELVA (Loreto/Iquitos - Acceso difícil)
-- =============================================
-- Nota: Iquitos es caro porque suele ser fluvial o aéreo
('LIMA', 'LORETO', 'estandar', 35.00, 1.00, 10.00, 5, 7),
('LIMA', 'LORETO', 'express', 55.00, 1.00, 15.00, 1, 2),

-- =============================================
-- 6. RUTAS DE RETORNO (Ejemplos de Provincia a Lima)
-- =============================================
('AREQUIPA', 'LIMA', 'estandar', 16.00, 1.00, 4.00, 2, 3),
('CUSCO', 'LIMA', 'estandar', 22.00, 1.00, 5.50, 3, 4),
('LA LIBERTAD', 'LIMA', 'estandar', 15.00, 1.00, 3.50, 1, 2);
>>>>>>> 4fed6731e648b42443bc913faa4a6c5fb1d19805
