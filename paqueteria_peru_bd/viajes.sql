-- =====================================================
-- INSERCIÓN DE VIAJES - Sistema Paquetería Perú
-- =====================================================
-- Tabla: viajes
-- Dependencias: rutas, vehiculos, usuarios (conductores)
-- =====================================================

USE paqueteria_peru;

-- Verificar si hay conductores disponibles, sino usar admin como conductor temporal
SET @conductor_id = (SELECT u.id_usuario 
                     FROM usuarios u 
                     INNER JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario 
                     WHERE ur.id_rol = (SELECT id_rol FROM roles WHERE nombre = 'Conductor' LIMIT 1)
                     LIMIT 1);

-- Si no hay conductores, usar el admin como conductor temporal
SET @conductor_id = IFNULL(@conductor_id, 1);

-- =====================================================
-- VIAJES PROGRAMADOS (PRÓXIMOS DÍAS)
-- =====================================================

-- Viaje 1: Lima → Arequipa (Mañana)
INSERT INTO viajes (id_ruta, id_vehiculo, id_conductor, fecha_salida, fecha_llegada_estimada, estado) 
SELECT 
    r.id_ruta,
    1, -- Vehículo A1B-100
    @conductor_id,
    DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 8 HOUR, -- Mañana 8:00 AM
    DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 0 HOUR, -- Pasado mañana 12:00 AM
    'programado'
FROM rutas r
WHERE r.id_agencia_origen = 1 AND r.id_agencia_destino = 2
LIMIT 1;

-- Viaje 2: Lima → Cusco (Mañana)
INSERT INTO viajes (id_ruta, id_vehiculo, id_conductor, fecha_salida, fecha_llegada_estimada, estado) 
SELECT 
    r.id_ruta,
    3, -- Vehículo B3D-300
    @conductor_id,
    DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 9 HOUR,
    DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 2 HOUR,
    'programado'
FROM rutas r
WHERE r.id_agencia_origen = 1 AND r.id_agencia_destino = 3
LIMIT 1;

-- Viaje 3: Lima → Trujillo (Pasado mañana)
INSERT INTO viajes (id_ruta, id_vehiculo, id_conductor, fecha_salida, fecha_llegada_estimada, estado) 
SELECT 
    r.id_ruta,
    5, -- Vehículo D5F-500
    @conductor_id,
    DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 7 HOUR,
    DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 15 HOUR,
    'programado'
FROM rutas r
WHERE r.id_agencia_origen = 1 AND r.id_agencia_destino = 4
LIMIT 1;

-- Viaje 4: Lima → Chiclayo (En 3 días)
INSERT INTO viajes (id_ruta, id_vehiculo, id_conductor, fecha_salida, fecha_llegada_estimada, estado) 
SELECT 
    r.id_ruta,
    1, -- Vehículo A1B-100 (reutilizado después del viaje 1)
    @conductor_id,
    DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 8 HOUR,
    DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 19 HOUR,
    'programado'
FROM rutas r
WHERE r.id_agencia_origen = 1 AND r.id_agencia_destino = 5
LIMIT 1;

-- Viaje 5: Lima → Huancayo (En 3 días)
INSERT INTO viajes (id_ruta, id_vehiculo, id_conductor, fecha_salida, fecha_llegada_estimada, estado) 
SELECT 
    r.id_ruta,
    9, -- Vehículo H9J-900
    @conductor_id,
    DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 10 HOUR,
    DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 16 HOUR,
    'programado'
FROM rutas r
WHERE r.id_agencia_origen = 1 AND r.id_agencia_destino = 7
LIMIT 1;

-- Viaje 6: Arequipa → Lima (Regreso en 4 días)
INSERT INTO viajes (id_ruta, id_vehiculo, id_conductor, fecha_salida, fecha_llegada_estimada, estado) 
SELECT 
    r.id_ruta,
    3, -- Vehículo B3D-300
    @conductor_id,
    DATE_ADD(CURDATE(), INTERVAL 4 DAY) + INTERVAL 8 HOUR,
    DATE_ADD(CURDATE(), INTERVAL 5 DAY) + INTERVAL 0 HOUR,
    'programado'
FROM rutas r
WHERE r.id_agencia_origen = 2 AND r.id_agencia_destino = 1
LIMIT 1;

-- =====================================================
-- VIAJES COMPLETADOS (HISTÓRICO - ÚLTIMOS 7 DÍAS)
-- =====================================================

-- Viaje completado: Lima → Arequipa (Hace 5 días)
INSERT INTO viajes (id_ruta, id_vehiculo, id_conductor, fecha_salida, fecha_llegada_estimada, fecha_llegada_real, estado) 
SELECT 
    r.id_ruta,
    1,
    @conductor_id,
    DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL 8 HOUR,
    DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL 0 HOUR,
    DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL 1 HOUR, -- Llegó 1 hora tarde
    'completado'
FROM rutas r
WHERE r.id_agencia_origen = 1 AND r.id_agencia_destino = 2
LIMIT 1;

-- Viaje completado: Trujillo → Lima (Hace 3 días)
INSERT INTO viajes (id_ruta, id_vehiculo, id_conductor, fecha_salida, fecha_llegada_estimada, fecha_llegada_real, estado) 
SELECT 
    r.id_ruta,
    5,
    @conductor_id,
    DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 7 HOUR,
    DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 15 HOUR,
    DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 14 HOUR + INTERVAL 45 MINUTE, -- Llegó temprano
    'completado'
FROM rutas r
WHERE r.id_agencia_origen = 4 AND r.id_agencia_destino = 1
LIMIT 1;

-- Viaje en tránsito: Cusco → Lima (Salió ayer)
INSERT INTO viajes (id_ruta, id_vehiculo, id_conductor, fecha_salida, fecha_llegada_estimada, estado) 
SELECT 
    r.id_ruta,
    3,
    @conductor_id,
    DATE_SUB(CURDATE(), INTERVAL 1 DAY) + INTERVAL 6 HOUR,
    DATE_ADD(CURDATE(), INTERVAL 0 DAY) + INTERVAL 23 HOUR,
    'en_transito'
FROM rutas r
WHERE r.id_agencia_origen = 3 AND r.id_agencia_destino = 1
LIMIT 1;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
SELECT 'TOTAL VIAJES INSERTADOS' AS info, COUNT(*) AS cantidad FROM viajes;

SELECT 
    'VIAJES POR ESTADO' AS info,
    estado,
    COUNT(*) AS cantidad
FROM viajes
GROUP BY estado
ORDER BY estado;
