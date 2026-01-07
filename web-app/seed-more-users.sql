-- Insertar usuarios de prueba para Counter y Conductor si no existen

-- Counter
INSERT IGNORE INTO ubigeo (id_ubigeo, departamento, provincia, distrito) VALUES ('150101', 'LIMA', 'LIMA', 'LIMA');

INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, telefono, direccion, id_ubigeo)
SELECT 'Carlos', 'Counter', 'DNI', '99887766', '999888777', 'Av. Counter 123', '150101'
WHERE NOT EXISTS (SELECT 1 FROM credenciales WHERE correo = 'counter@paqueteria.pe');

SET @id_counter = (SELECT id_usuario FROM usuarios WHERE numero_documento = '99887766' LIMIT 1);

INSERT INTO credenciales (id_usuario, correo, password_hash, estado)
SELECT @id_counter, 'counter@paqueteria.pe', 'admin123', 'activo'
WHERE NOT EXISTS (SELECT 1 FROM credenciales WHERE correo = 'counter@paqueteria.pe');

INSERT INTO usuario_roles (id_usuario, id_rol)
SELECT @id_counter, 3 -- Rol Empleado
WHERE NOT EXISTS (SELECT 1 FROM usuario_roles WHERE id_usuario = @id_counter AND id_rol = 3);


-- Conductor
INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, telefono, direccion, id_ubigeo)
SELECT 'Pedro', 'Conductor', 'DNI', '55443322', '999555444', 'Av. Ruta 456', '150101'
WHERE NOT EXISTS (SELECT 1 FROM credenciales WHERE correo = 'conductor@paqueteria.pe');

SET @id_conductor = (SELECT id_usuario FROM usuarios WHERE numero_documento = '55443322' LIMIT 1);

INSERT INTO credenciales (id_usuario, correo, password_hash, estado)
SELECT @id_conductor, 'conductor@paqueteria.pe', 'admin123', 'activo'
WHERE NOT EXISTS (SELECT 1 FROM credenciales WHERE correo = 'conductor@paqueteria.pe');

INSERT INTO usuario_roles (id_usuario, id_rol)
SELECT @id_conductor, 4 -- Rol Conductor
WHERE NOT EXISTS (SELECT 1 FROM usuario_roles WHERE id_usuario = @id_conductor AND id_rol = 4);
