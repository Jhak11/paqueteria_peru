-- Verificar y asignar agencia al usuario Counter
USE paqueteria_peru;

-- Verificar estado actual
SELECT 
    u.id_usuario, 
    u.nombres, 
    u.apellidos, 
    u.id_agencia_trabajo, 
    a.nombre as agencia,
    c.correo
FROM usuarios u
LEFT JOIN agencias a ON u.id_agencia_trabajo = a.id_agencia
JOIN credenciales c ON u.id_usuario = c.id_usuario
WHERE c.correo = 'counter@paqueteria.pe';

-- S agencia 1 (Sede Central) al usuario Counter si no la tiene
UPDATE usuarios u
JOIN credenciales c ON u.id_usuario = c.id_usuario
SET u.id_agencia_trabajo = 1
WHERE c.correo = 'counter@paqueteria.pe' 
AND (u.id_agencia_trabajo IS NULL OR u.id_agencia_trabajo = 0);

-- Verificar después de la actualización
SELECT 
    u.id_usuario, 
    u.nombres, 
    u.apellidos, 
    u.id_agencia_trabajo, 
    a.nombre as agencia
FROM usuarios u
LEFT JOIN agencias a ON u.id_agencia_trabajo = a.id_agencia
JOIN credenciales c ON u.id_usuario = c.id_usuario
WHERE c.correo = 'counter@paqueteria.pe';
