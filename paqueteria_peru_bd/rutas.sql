-- =====================================================
-- INSERCIÓN DE RUTAS - Sistema Paquetería Perú
-- =====================================================
-- Tabla: rutas
-- Dependencias: agencias (deben existir primero)
-- =====================================================

USE paqueteria_peru;

-- =====================================================
-- RUTAS PRINCIPALES DESDE LIMA (HUB CENTRAL)
-- =====================================================
-- Agencias:
-- 1: Sede Central Lima
-- 2: Base Arequipa
-- 3: Base Cusco
-- 4: Agencia Trujillo
-- 5: Agencia Chiclayo
-- 6: Agencia Piura
-- 7: Agencia Huancayo
-- 8: Agencia Iquitos

-- Lima ↔ Arequipa (Costa Sur)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(1, 2, 1015.00, 960, 'principal'),   -- Lima → Arequipa (16 horas)
(2, 1, 1015.00, 960, 'principal')    -- Arequipa → Lima
ON DUPLICATE KEY UPDATE distancia_km = VALUES(distancia_km), tiempo_estimado_min = VALUES(tiempo_estimado_min);

-- Lima ↔ Cusco (Sierra Sur)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(1, 3, 1100.00, 1020, 'principal'),  -- Lima → Cusco (17 horas)
(3, 1, 1100.00, 1020, 'principal')   -- Cusco → Lima
ON DUPLICATE KEY UPDATE distancia_km = VALUES(distancia_km), tiempo_estimado_min = VALUES(tiempo_estimado_min);

-- Lima ↔ Trujillo (Costa Norte)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(1, 4, 560.00, 480, 'principal'),    -- Lima → Trujillo (8 horas)
(4, 1, 560.00, 480, 'principal')     -- Trujillo → Lima
ON DUPLICATE KEY UPDATE distancia_km = VALUES(distancia_km), tiempo_estimado_min = VALUES(tiempo_estimado_min);

-- Lima ↔ Chiclayo (Costa Norte)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(1, 5, 770.00, 660, 'principal'),    -- Lima → Chiclayo (11 horas)
(5, 1, 770.00, 660, 'principal')     -- Chiclayo → Lima
ON DUPLICATE KEY UPDATE distancia_km = VALUES(distancia_km), tiempo_estimado_min = VALUES(tiempo_estimado_min);

-- Lima ↔ Piura (Costa Norte Extremo)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(1, 6, 973.00, 840, 'principal'),    -- Lima → Piura (14 horas)
(6, 1, 973.00, 840, 'principal')     -- Piura → Lima
ON DUPLICATE KEY UPDATE distancia_km = VALUES(distancia_km), tiempo_estimado_min = VALUES(tiempo_estimado_min);

-- Lima ↔ Huancayo (Sierra Central)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(1, 7, 305.00, 360, 'principal'),    -- Lima → Huancayo (6 horas)
(7, 1, 305.00, 360, 'principal')     -- Huancayo → Lima
ON DUPLICATE KEY UPDATE distancia_km = VALUES(distancia_km), tiempo_estimado_min = VALUES(tiempo_estimado_min);

-- Lima ↔ Iquitos (Ruta estándar terrestre/fluvial)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(1, 8, 1050.00, 2880, 'principal'),  -- Lima → Iquitos (48 horas vía terrestre/fluvial)
(8, 1, 1050.00, 2880, 'principal')   -- Iquitos → Lima
ON DUPLICATE KEY UPDATE distancia_km = VALUES(distancia_km), tiempo_estimado_min = VALUES(tiempo_estimado_min);

-- =====================================================
-- RUTAS INTERPROVINCIALES (CONEXIONES REGIONALES)
-- =====================================================

-- Arequipa ↔ Cusco (Ruta Sur)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(2, 3, 520.00, 600, 'secundaria'),   -- Arequipa → Cusco (10 horas)
(3, 2, 520.00, 600, 'secundaria')    -- Cusco → Arequipa
ON DUPLICATE KEY UPDATE distancia_km = VALUES(distancia_km), tiempo_estimado_min = VALUES(tiempo_estimado_min);

-- Trujillo ↔ Chiclayo (Ruta Norte)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(4, 5, 210.00, 180, 'secundaria'),   -- Trujillo → Chiclayo (3 horas)
(5, 4, 210.00, 180, 'secundaria')    -- Chiclayo → Trujillo
ON DUPLICATE KEY UPDATE distancia_km = VALUES(distancia_km), tiempo_estimado_min = VALUES(tiempo_estimado_min);

-- Chiclayo ↔ Piura (Costa Norte)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(5, 6, 205.00, 240, 'secundaria'),   -- Chiclayo → Piura (4 horas)
(6, 5, 205.00, 240, 'secundaria')    -- Piura → Chiclayo
ON DUPLICATE KEY UPDATE distancia_km = VALUES(distancia_km), tiempo_estimado_min = VALUES(tiempo_estimado_min);

-- Trujillo ↔ Huancayo (Sierra)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(4, 7, 520.00, 540, 'secundaria'),   -- Trujillo → Huancayo (9 horas)
(7, 4, 520.00, 540, 'secundaria')    -- Huancayo → Trujillo
ON DUPLICATE KEY UPDATE distancia_km = VALUES(distancia_km), tiempo_estimado_min = VALUES(tiempo_estimado_min);

-- Cusco ↔ Huancayo (Ruta Sierra Central)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(3, 7, 680.00, 720, 'secundaria'),   -- Cusco → Huancayo (12 horas)
(7, 3, 680.00, 720, 'secundaria')    -- Huancayo → Cusco
ON DUPLICATE KEY UPDATE distancia_km = VALUES(distancia_km), tiempo_estimado_min = VALUES(tiempo_estimado_min);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
SELECT 'TOTAL RUTAS INSERTADAS' AS info, COUNT(*) AS cantidad FROM rutas;
