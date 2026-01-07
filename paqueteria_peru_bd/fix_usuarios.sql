USE paqueteria_peru;

-- ==================================================
-- SCRIPT: Creación/Actualización de Usuarios de Prueba
-- Contraseña para TODOS: 123456
-- Hash bcrypt: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- ==================================================

-- 1. ADMIN (Ya existe, solo actualizamos contraseña)
UPDATE credenciales 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE correo = 'admin@paqueteria.pe';

-- 2. CLIENTE (Juan Pérez - Ya existe, actualizamos)
UPDATE credenciales 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE correo = 'juan.perez@email.com';

-- 3. EMPLEADO/COUNTER (Crear si no existe)
-- Primero verificamos si existe
SET @counter_exists = (SELECT COUNT(*) FROM credenciales WHERE correo = 'counter@paqueteria.pe');

-- Si no existe, lo creamos
INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, telefono, direccion, id_ubigeo, id_agencia_trabajo)
SELECT 'Counter', 'Empleado', 'DNI', '11111111', '999111111', 'Sede Central', '150101', 1
WHERE NOT EXISTS (SELECT 1 FROM credenciales WHERE correo = 'counter@paqueteria.pe');

SET @id_counter = (SELECT id_usuario FROM credenciales WHERE correo = 'counter@paqueteria.pe');
SET @id_counter = IFNULL(@id_counter, LAST_INSERT_ID());

INSERT INTO credenciales (id_usuario, correo, password_hash, estado) 
SELECT @id_counter, 'counter@paqueteria.pe', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'activo'
WHERE NOT EXISTS (SELECT 1 FROM credenciales WHERE correo = 'counter@paqueteria.pe');

INSERT INTO usuario_roles (id_usuario, id_rol) 
SELECT @id_counter, 3
WHERE NOT EXISTS (SELECT 1 FROM usuario_roles WHERE id_usuario = @id_counter AND id_rol = 3);

-- Si ya existe, solo actualizamos la contraseña
UPDATE credenciales 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE correo = 'counter@paqueteria.pe';

-- 4. CONDUCTOR (Crear si no existe)
INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, telefono, direccion, id_ubigeo, id_agencia_trabajo)
SELECT 'Pedro', 'Conductor', 'DNI', '22222222', '999222222', 'Base Operaciones', '150101', 1
WHERE NOT EXISTS (SELECT 1 FROM credenciales WHERE correo = 'conductor@paqueteria.pe');

SET @id_conductor = (SELECT id_usuario FROM credenciales WHERE correo = 'conductor@paqueteria.pe');
SET @id_conductor = IFNULL(@id_conductor, LAST_INSERT_ID());

INSERT INTO credenciales (id_usuario, correo, password_hash, estado) 
SELECT @id_conductor, 'conductor@paqueteria.pe', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'activo'
WHERE NOT EXISTS (SELECT 1 FROM credenciales WHERE correo = 'conductor@paqueteria.pe');

INSERT INTO usuario_roles (id_usuario, id_rol) 
SELECT @id_conductor, 4
WHERE NOT EXISTS (SELECT 1 FROM usuario_roles WHERE id_usuario = @id_conductor AND id_rol = 4);

-- Si ya existe, solo actualizamos la contraseña
UPDATE credenciales 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE correo = 'conductor@paqueteria.pe';

-- Verificación
SELECT 
    u.nombres, 
    u.apellidos, 
    c.correo, 
    r.nombre as rol,
    c.estado
FROM usuarios u
JOIN credenciales c ON u.id_usuario = c.id_usuario
JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario
JOIN roles r ON ur.id_rol = r.id_rol
WHERE c.correo IN ('admin@paqueteria.pe', 'juan.perez@email.com', 'counter@paqueteria.pe', 'conductor@paqueteria.pe');
