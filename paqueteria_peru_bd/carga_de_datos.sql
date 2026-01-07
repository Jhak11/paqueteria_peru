USE paqueteria_peru;

-- =====================================================
-- 4. USUARIOS DE PRUEBA (DATA CONTROLADA)
-- =====================================================

-- 4.1 Administrador
INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, telefono, direccion, id_ubigeo, id_agencia_trabajo)
VALUES ('Admin', 'Sistema', 'DNI', '00000001', '999000001', 'Oficina Central', '150101', 1);
SET @id_admin = LAST_INSERT_ID();
INSERT INTO credenciales (id_usuario, correo, password_hash, estado) VALUES (@id_admin, 'admin@paqueteria.pe', '$2b$10$lO43FFrrwtlMn9a6UJtmdeFHvy5M1bGAquLE.3acScaDmmi1wTky', 'activo');
INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (@id_admin, 1);

-- 4.2 Cliente Remitente (Juan Pérez) - Ejemplo de Cliente asignado a sede 1 para pruebas de counter rapido
INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, telefono, direccion, id_ubigeo, id_agencia_trabajo)
VALUES ('Juan', 'Pérez', 'DNI', '10203040', '987654321', 'Av. Larco 100', '150101', 1);
SET @id_remitente = LAST_INSERT_ID();
INSERT INTO credenciales (id_usuario, correo, password_hash, estado) VALUES (@id_remitente, 'juan.perez@email.com', '$2b$10$lO43FFrrwtlMn9a6UJtmdeFHvy5M1bGAquLE.3acScaDmmi1wTky', 'activo');
INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (@id_remitente, 2);

-- 4.3 Cliente Destinatario (Maria Mendoza)
INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, telefono, direccion, id_ubigeo)
VALUES ('Maria', 'Mendoza', 'DNI', '40506070', '912345678', 'Calle Yanahuara 500', '040101');
SET @id_destinatario = LAST_INSERT_ID();
INSERT INTO credenciales (id_usuario, correo, password_hash, estado) VALUES (@id_destinatario, 'maria.mendoza@email.com', '$2b$10$lO43FFrrwtlMn9a6UJtmdeFHvy5M1bGAquLE.3acScaDmmi1wTky', 'activo');
INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (@id_destinatario, 2);

-- =====================================================
-- 5. ENVÍOS DE PRUEBA (SCENARIOS ESPECÍFICOS)
-- =====================================================

-- ESCENARIO 1: Envío "En Ruta" (Lima -> Arequipa)
-- Código: PE-TEST-001
INSERT INTO envios (codigo_seguimiento, id_usuario_remitente, id_usuario_destinatario, id_agencia_origen, id_agencia_destino, fecha_registro, estado_actual, costo_envio_total, fecha_estimada_entrega)
VALUES ('PE-TEST-001', @id_remitente, @id_destinatario, 1, 2, DATE_SUB(NOW(), INTERVAL 2 DAY), 3, 50.00, DATE_ADD(NOW(), INTERVAL 1 DAY));
SET @id_envio_1 = LAST_INSERT_ID();

INSERT INTO paquetes (id_envio, descripcion_contenido, peso_kg, tipo_paquete) VALUES (@id_envio_1, 'Documentos Importantes', 0.5, 'sobre');

-- Historial Coherehente
INSERT INTO seguimiento_envio (id_envio, id_estado, descripcion_evento, fecha_hora, id_agencia, id_ubigeo) VALUES
(@id_envio_1, 1, 'Envío registrado en Sede Central Lima', DATE_SUB(NOW(), INTERVAL 2 DAY), 1, '150101'),
(@id_envio_1, 2, 'Recibido en almacén origen', DATE_SUB(NOW(), INTERVAL 1 DAY), 1, '150101'),
(@id_envio_1, 3, 'En ruta hacia Arequipa', NOW(), 1, '150101');


-- ESCENARIO 2: Envío "Entregado" (Lima -> Cusco)
-- Código: PE-TEST-002
INSERT INTO envios (codigo_seguimiento, id_usuario_remitente, id_usuario_destinatario, id_agencia_origen, id_agencia_destino, fecha_registro, estado_actual, costo_envio_total, fecha_estimada_entrega, fecha_entrega)
VALUES ('PE-TEST-002', @id_remitente, @id_destinatario, 1, 3, DATE_SUB(NOW(), INTERVAL 5 DAY), 6, 120.00, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));
SET @id_envio_2 = LAST_INSERT_ID();

INSERT INTO paquetes (id_envio, descripcion_contenido, peso_kg, tipo_paquete) VALUES (@id_envio_2, 'Laptop y Accesorios', 2.5, 'caja_chica');

-- Historial Completo
INSERT INTO seguimiento_envio (id_envio, id_estado, descripcion_evento, fecha_hora, id_agencia, id_ubigeo) VALUES
(@id_envio_2, 1, 'Envío registrado', DATE_SUB(NOW(), INTERVAL 5 DAY), 1, '150101'),
(@id_envio_2, 3, 'Salió de Lima', DATE_SUB(NOW(), INTERVAL 4 DAY), 1, '150101'),
(@id_envio_2, 4, 'Llegó a Cusco', DATE_SUB(NOW(), INTERVAL 2 DAY), 3, '080101'),
(@id_envio_2, 5, 'Salió a reparto', DATE_SUB(NOW(), INTERVAL 1 DAY), 3, '080101'),
(@id_envio_2, 6, 'Entregado a titular', DATE_SUB(NOW(), INTERVAL 1 DAY), 3, '080101');


-- ESCENARIO 3: Envío "Registrado" (Recién creado)
-- Código: PE-TEST-003
INSERT INTO envios (codigo_seguimiento, id_usuario_remitente, id_usuario_destinatario, id_agencia_origen, id_agencia_destino, fecha_registro, estado_actual, costo_envio_total, fecha_estimada_entrega)
VALUES ('PE-TEST-003', @id_remitente, @id_destinatario, 1, 4, NOW(), 1, 85.00, DATE_ADD(NOW(), INTERVAL 3 DAY));
SET @id_envio_3 = LAST_INSERT_ID();

INSERT INTO seguimiento_envio (id_envio, id_estado, descripcion_evento, fecha_hora, id_agencia, id_ubigeo) VALUES
(@id_envio_3, 1, 'Envío registrado, pendiente de entrega', NOW(), 1, '150101');
