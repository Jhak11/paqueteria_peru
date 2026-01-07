-- =====================================================
-- CARGA DE RUTAS, VIAJES Y TARIFAS
-- Sistema: Paquetería Perú
-- =====================================================
-- Este script debe ejecutarse DESPUÉS de tener:
-- - 8 Agencias creadas (IDs 1-8)
-- - Vehículos disponibles
-- - Usuarios conductores
-- =====================================================

USE paqueteria_peru;

-- =====================================================
-- 1. RUTAS PRINCIPALES (RED LOGÍSTICA COMPLETA)
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

-- IMPORTANTE: Cada ruta principal debe ser bidireccional (ida y vuelta)
-- Distancias y tiempos basados en rutas reales de Perú

-- =============================================
-- A. RUTAS DESDE LIMA (HUB PRINCIPAL)
-- =============================================

-- Lima ↔ Arequipa (Costa Sur)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(1, 2, 1015.00, 960, 'principal'),   -- Lima → Arequipa (16 horas)
(2, 1, 1015.00, 960, 'principal');   -- Arequipa → Lima

-- Lima ↔ Cusco (Sierra Sur)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(1, 3, 1100.00, 1020, 'principal'),  -- Lima → Cusco (17 horas)
(3, 1, 1100.00, 1020, 'principal');  -- Cusco → Lima

-- Lima ↔ Trujillo (Costa Norte)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(1, 4, 560.00, 480, 'principal'),    -- Lima → Trujillo (8 horas)
(4, 1, 560.00, 480, 'principal');    -- Trujillo → Lima

-- Lima ↔ Chiclayo (Costa Norte)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(1, 5, 770.00, 660, 'principal'),    -- Lima → Chiclayo (11 horas)
(5, 1, 770.00, 660, 'principal');    -- Chiclayo → Lima

-- Lima ↔ Piura (Costa Norte Extremo)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(1, 6, 973.00, 840, 'principal'),    -- Lima → Piura (14 horas)
(6, 1, 973.00, 840, 'principal');    -- Piura → Lima

-- Lima ↔ Huancayo (Sierra Central)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(1, 7, 305.00, 360, 'principal'),    -- Lima → Huancayo (6 horas)
(7, 1, 305.00, 360, 'principal');    -- Huancayo → Lima

-- Lima ↔ Iquitos (Selva - NOTA: No hay ruta terrestre directa, se simula aérea/fluvial)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(1, 8, 1800.00, 180, 'principal'),   -- Lima → Iquitos (vía aérea 3h + distribución)
(8, 1, 1800.00, 180, 'principal');   -- Iquitos → Lima

-- =============================================
-- B. RUTAS INTERPROVINCIALES (CONEXIONES REGIONALES)
-- =============================================

-- Arequipa ↔ Cusco (Ruta Sur)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(2, 3, 520.00, 600, 'secundaria'),   -- Arequipa → Cusco (10 horas)
(3, 2, 520.00, 600, 'secundaria');   -- Cusco → Arequipa

-- Trujillo ↔ Chiclayo (Ruta Norte)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(4, 5, 210.00, 180, 'secundaria'),   -- Trujillo → Chiclayo (3 horas)
(5, 4, 210.00, 180, 'secundaria');   -- Chiclayo → Trujillo

-- Chiclayo ↔ Piura (Costa Norte)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(5, 6, 205.00, 240, 'secundaria'),   -- Chiclayo → Piura (4 horas)
(6, 5, 205.00, 240, 'secundaria');   -- Piura → Chiclayo

-- Trujillo ↔ Huancayo (Sierra)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(4, 7, 520.00, 540, 'secundaria'),   -- Trujillo → Huancayo (9 horas)
(7, 4, 520.00, 540, 'secundaria');   -- Huancayo → Trujillo

-- Cusco ↔ Huancayo (Ruta Sierra Central)
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo) VALUES
(3, 7, 680.00, 720, 'secundaria'),   -- Cusco → Huancayo (12 horas)
(7, 3, 680.00, 720, 'secundaria');   -- Huancayo → Cusco

-- Total de rutas: 24 (8 desde Lima x 2 + 5 interprovinciales x 2)

-- =====================================================
-- 2. TARIFAS (BASADAS EN RUTAS Y SERVICIOS)
-- =====================================================
-- Fórmula: Precio base + (peso adicional x precio_kg_extra)
-- 3 tipos de servicio: estandar, express, carga_pesada
-- Zonas: Basadas en departamentos de origen/destino

-- IMPORTANTE: Cada RUTA debe tener al menos una tarifa (preferiblemente 1 por cada tipo de servicio)

-- =============================================
-- A. TARIFAS DESDE LIMA
-- =============================================

-- Lima → Arequipa
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LIMA', 'AREQUIPA', 'estandar', 35.00, 1.00, 12.00, 2, 4, 'vigente'),
('LIMA', 'AREQUIPA', 'express', 55.00, 1.00, 15.00, 1, 2, 'vigente'),
('LIMA', 'AREQUIPA', 'carga_pesada', 120.00, 10.00, 8.00, 3, 5, 'vigente');

-- Lima → Cusco
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LIMA', 'CUSCO', 'estandar', 40.00, 1.00, 13.00, 2, 4, 'vigente'),
('LIMA', 'CUSCO', 'express', 60.00, 1.00, 16.00, 1, 2, 'vigente'),
('LIMA', 'CUSCO', 'carga_pesada', 130.00, 10.00, 9.00, 3, 5, 'vigente');

-- Lima → Trujillo
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LIMA', 'LA LIBERTAD', 'estandar', 25.00, 1.00, 10.00, 1, 3, 'vigente'),
('LIMA', 'LA LIBERTAD', 'express', 40.00, 1.00, 12.00, 1, 1, 'vigente'),
('LIMA', 'LA LIBERTAD', 'carga_pesada', 90.00, 10.00, 7.00, 2, 4, 'vigente');

-- Lima → Chiclayo
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LIMA', 'LAMBAYEQUE', 'estandar', 30.00, 1.00, 11.00, 2, 3, 'vigente'),
('LIMA', 'LAMBAYEQUE', 'express', 48.00, 1.00, 14.00, 1, 2, 'vigente'),
('LIMA', 'LAMBAYEQUE', 'carga_pesada', 100.00, 10.00, 7.50, 2, 4, 'vigente');

-- Lima → Piura
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LIMA', 'PIURA', 'estandar', 38.00, 1.00, 12.50, 2, 4, 'vigente'),
('LIMA', 'PIURA', 'express', 58.00, 1.00, 15.50, 1, 2, 'vigente'),
('LIMA', 'PIURA', 'carga_pesada', 115.00, 10.00, 8.50, 3, 5, 'vigente');

-- Lima → Huancayo
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LIMA', 'JUNIN', 'estandar', 20.00, 1.00, 8.00, 1, 2, 'vigente'),
('LIMA', 'JUNIN', 'express', 32.00, 1.00, 10.00, 1, 1, 'vigente'),
('LIMA', 'JUNIN', 'carga_pesada', 75.00, 10.00, 6.00, 1, 3, 'vigente');

-- Lima → Iquitos
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LIMA', 'LORETO', 'estandar', 80.00, 1.00, 25.00, 1, 2, 'vigente'),
('LIMA', 'LORETO', 'express', 120.00, 1.00, 30.00, 1, 1, 'vigente'),
('LIMA', 'LORETO', 'carga_pesada', 250.00, 10.00, 20.00, 2, 3, 'vigente');

-- =============================================
-- B. TARIFAS DE REGRESO (Mismos departamentos invertidos)
-- =============================================

-- Arequipa → Lima
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('AREQUIPA', 'LIMA', 'estandar', 35.00, 1.00, 12.00, 2, 4, 'vigente'),
('AREQUIPA', 'LIMA', 'express', 55.00, 1.00, 15.00, 1, 2, 'vigente'),
('AREQUIPA', 'LIMA', 'carga_pesada', 120.00, 10.00, 8.00, 3, 5, 'vigente');

-- Cusco → Lima
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('CUSCO', 'LIMA', 'estandar', 40.00, 1.00, 13.00, 2, 4, 'vigente'),
('CUSCO', 'LIMA', 'express', 60.00, 1.00, 16.00, 1, 2, 'vigente'),
('CUSCO', 'LIMA', 'carga_pesada', 130.00, 10.00, 9.00, 3, 5, 'vigente');

-- Trujillo → Lima
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LA LIBERTAD', 'LIMA', 'estandar', 25.00, 1.00, 10.00, 1, 3, 'vigente'),
('LA LIBERTAD', 'LIMA', 'express', 40.00, 1.00, 12.00, 1, 1, 'vigente'),
('LA LIBERTAD', 'LIMA', 'carga_pesada', 90.00, 10.00, 7.00, 2, 4, 'vigente');

-- Chiclayo → Lima
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LAMBAYEQUE', 'LIMA', 'estandar', 30.00, 1.00, 11.00, 2, 3, 'vigente'),
('LAMBAYEQUE', 'LIMA', 'express', 48.00, 1.00, 14.00, 1, 2, 'vigente'),
('LAMBAYEQUE', 'LIMA', 'carga_pesada', 100.00, 10.00, 7.50, 2, 4, 'vigente');

-- Piura → Lima
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('PIURA', 'LIMA', 'estandar', 38.00, 1.00, 12.50, 2, 4, 'vigente'),
('PIURA', 'LIMA', 'express', 58.00, 1.00, 15.50, 1, 2, 'vigente'),
('PIURA', 'LIMA', 'carga_pesada', 115.00, 10.00, 8.50, 3, 5, 'vigente');

-- Huancayo → Lima
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('JUNIN', 'LIMA', 'estandar', 20.00, 1.00, 8.00, 1, 2, 'vigente'),
('JUNIN', 'LIMA', 'express', 32.00, 1.00, 10.00, 1, 1, 'vigente'),
('JUNIN', 'LIMA', 'carga_pesada', 75.00, 10.00, 6.00, 1, 3, 'vigente');

-- Iquitos → Lima
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LORETO', 'LIMA', 'estandar', 80.00, 1.00, 25.00, 1, 2, 'vigente'),
('LORETO', 'LIMA', 'express', 120.00, 1.00, 30.00, 1, 1, 'vigente'),
('LORETO', 'LIMA', 'carga_pesada', 250.00, 10.00, 20.00, 2, 3, 'vigente');

-- =============================================
-- C. TARIFAS INTERPROVINCIALES
-- =============================================

-- Arequipa ↔ Cusco
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('AREQUIPA', 'CUSCO', 'estandar', 30.00, 1.00, 11.00, 1, 3, 'vigente'),
('AREQUIPA', 'CUSCO', 'express', 48.00, 1.00, 14.00, 1, 2, 'vigente'),
('CUSCO', 'AREQUIPA', 'estandar', 30.00, 1.00, 11.00, 1, 3, 'vigente'),
('CUSCO', 'AREQUIPA', 'express', 48.00, 1.00, 14.00, 1, 2, 'vigente');

-- Trujillo ↔ Chiclayo
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LA LIBERTAD', 'LAMBAYEQUE', 'estandar', 18.00, 1.00, 7.00, 1, 2, 'vigente'),
('LA LIBERTAD', 'LAMBAYEQUE', 'express', 28.00, 1.00, 9.00, 1, 1, 'vigente'),
('LAMBAYEQUE', 'LA LIBERTAD', 'estandar', 18.00, 1.00, 7.00, 1, 2, 'vigente'),
('LAMBAYEQUE', 'LA LIBERTAD', 'express', 28.00, 1.00, 9.00, 1, 1, 'vigente');

-- Chiclayo ↔ Piura
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LAMBAYEQUE', 'PIURA', 'estandar', 20.00, 1.00, 8.00, 1, 2, 'vigente'),
('LAMBAYEQUE', 'PIURA', 'express', 32.00, 1.00, 10.00, 1, 1, 'vigente'),
('PIURA', 'LAMBAYEQUE', 'estandar', 20.00, 1.00, 8.00, 1, 2, 'vigente'),
('PIURA', 'LAMBAYEQUE', 'express', 32.00, 1.00, 10.00, 1, 1, 'vigente');

-- Trujillo ↔ Huancayo
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('LA LIBERTAD', 'JUNIN', 'estandar', 28.00, 1.00, 10.00, 1, 3, 'vigente'),
('LA LIBERTAD', 'JUNIN', 'express', 45.00, 1.00, 13.00, 1, 2, 'vigente'),
('JUNIN', 'LA LIBERTAD', 'estandar', 28.00, 1.00, 10.00, 1, 3, 'vigente'),
('JUNIN', 'LA LIBERTAD', 'express', 45.00, 1.00, 13.00, 1, 2, 'vigente');

-- Cusco ↔ Huancayo
INSERT INTO tarifas (departamento_origen, departamento_destino, tipo_servicio, precio_base, peso_base_kg, precio_kg_extra, tiempo_min_dias, tiempo_max_dias, estado) VALUES
('CUSCO', 'JUNIN', 'estandar', 35.00, 1.00, 12.00, 2, 4, 'vigente'),
('CUSCO', 'JUNIN', 'express', 55.00, 1.00, 15.00, 1, 2, 'vigente'),
('JUNIN', 'CUSCO', 'estandar', 35.00, 1.00, 12.00, 2, 4, 'vigente'),
('JUNIN', 'CUSCO', 'express', 55.00, 1.00, 15.00, 1, 2, 'vigente');

-- Total de tarifas: 67 (21 rutas principales + 5 interprovinciales, cada una con 2-3 tipos de servicio)

-- =====================================================
-- 3. VIAJES PROGRAMADOS (EJEMPLOS)
-- =====================================================
-- Viajes activos para las próximas semanas
-- NOTA: Se requiere que existan conductores (usuarios con rol 'Conductor')

-- Verificar si hay conductores disponibles
SET @conductor_id = (SELECT u.id_usuario 
                     FROM usuarios u 
                     INNER JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario 
                     WHERE ur.id_rol = 4 
                     LIMIT 1);

-- Si no hay conductores, usar el admin como conductor temporal
SET @conductor_id = IFNULL(@conductor_id, 1);

-- Viajes Lima → Provincias (Próxima semana)
INSERT INTO viajes (id_ruta, id_vehiculo, id_conductor, fecha_salida, fecha_llegada_estimada, estado) VALUES
-- Lima → Arequipa
((SELECT id_ruta FROM rutas WHERE id_agencia_origen=1 AND id_agencia_destino=2 LIMIT 1), 
 1, @conductor_id, 
 DATE_ADD(NOW(), INTERVAL 1 DAY), 
 DATE_ADD(NOW(), INTERVAL 2 DAY), 
 'programado'),

-- Lima → Cusco
((SELECT id_ruta FROM rutas WHERE id_agencia_origen=1 AND id_agencia_destino=3 LIMIT 1), 
 2, @conductor_id, 
 DATE_ADD(NOW(), INTERVAL 1 DAY), 
 DATE_ADD(NOW(), INTERVAL 2 DAY), 
 'programado'),

-- Lima → Trujillo
((SELECT id_ruta FROM rutas WHERE id_agencia_origen=1 AND id_agencia_destino=4 LIMIT 1), 
 3, @conductor_id, 
 DATE_ADD(NOW(), INTERVAL 2 DAY), 
 DATE_ADD(NOW(), INTERVAL 3 DAY), 
 'programado'),

-- Lima → Chiclayo
((SELECT id_ruta FROM rutas WHERE id_agencia_origen=1 AND id_agencia_destino=5 LIMIT 1), 
 1, @conductor_id, 
 DATE_ADD(NOW(), INTERVAL 3 DAY), 
 DATE_ADD(NOW(), INTERVAL 4 DAY), 
 'programado'),

-- Lima → Piura
((SELECT id_ruta FROM rutas WHERE id_agencia_origen=1 AND id_agencia_destino=6 LIMIT 1), 
 2, @conductor_id, 
 DATE_ADD(NOW(), INTERVAL 4 DAY), 
 DATE_ADD(NOW(), INTERVAL 5 DAY), 
 'programado');

-- =====================================================
-- 4. VERIFICACIÓN DE DATOS
-- =====================================================

-- Contar rutas creadas
SELECT 'RUTAS TOTALES' AS tabla, COUNT(*) AS total FROM rutas;

-- Contar tarifas creadas
SELECT 'TARIFAS TOTALES' AS tabla, COUNT(*) AS total FROM tarifas;

-- Contar viajes programados
SELECT 'VIAJES PROGRAMADOS' AS tabla, COUNT(*) AS total FROM viajes;

-- Verificar cobertura de tarifas por ruta
SELECT 
    CONCAT(a_orig.nombre, ' → ', a_dest.nombre) AS ruta,
    r.distancia_km,
    COUNT(DISTINCT t.tipo_servicio) AS servicios_disponibles
FROM rutas r
LEFT JOIN agencias a_orig ON r.id_agencia_origen = a_orig.id_agencia
LEFT JOIN agencias a_dest ON r.id_agencia_destino = a_dest.id_agencia
LEFT JOIN ubigeo u_orig ON a_orig.id_ubigeo = u_orig.id_ubigeo
LEFT JOIN ubigeo u_dest ON a_dest.id_ubigeo = u_dest.id_ubigeo
LEFT JOIN tarifas t ON (t.departamento_origen = u_orig.departamento AND t.departamento_destino = u_dest.departamento)
GROUP BY r.id_ruta
ORDER BY a_orig.nombre, a_dest.nombre;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
-- Resultado esperado:
-- - 24 rutas (bidireccionales)
-- - 67 tarifas (con diferentes tipos de servicio)
-- - 5 viajes programados de ejemplo
-- =====================================================
