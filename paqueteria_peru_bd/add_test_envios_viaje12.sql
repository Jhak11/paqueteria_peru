-- Script para agregar envíos de prueba coherentes al viaje 12
-- Primero verificamos la información del viaje 12

USE paqueteria_peru;

-- Ver información del viaje 12
SELECT 
    v.id_viaje,
    v.estado,
    r.id_agencia_origen,
    r.id_agencia_destino,
    ao.nombre as origen,
    ad.nombre as destino
FROM viajes v
JOIN rutas r ON v.id_ruta = r.id_ruta
JOIN agencias ao ON r.id_agencia_origen = ao.id_agencia
JOIN agencias ad ON r.id_agencia_destino = ad.id_agencia
WHERE v.id_viaje = 12;

-- Insertar envíos coherentes para el viaje 12
-- Asumiendo que el viaje 12 va de Lima (1) a Arequipa (2)

-- Envío 1
INSERT INTO envios (
    codigo_seguimiento, 
    id_usuario_remitente,
    id_agencia_origen,
    id_agencia_destino,
    estado_actual,
    costo_envio_total,
    fecha_registro
) VALUES (
    'PE-VJ12-001',
    1, -- Cliente de prueba
    1, -- Lima (ajustar según corresponda)
    2, -- Arequipa (ajustar según corresponda)
    3, -- EN RUTA (ya que el viaje está en tránsito)
    45.00,
    NOW()
);

SET @envio1_id = LAST_INSERT_ID();

-- Paquete para envío 1
INSERT INTO paquetes (
    id_envio, 
    tipo_paquete, 
    peso_kg, 
    descripcion_contenido,
    fragil,
    valor_declarado
) VALUES (
    @envio1_id,
    'caja_chica',
    5.5,
    'Documentos y suministros de oficina',
    0,
    150.00
);

-- Dirección destino para envío 1
INSERT INTO direccion_destino_envio (
    id_envio,
    nombre_destinatario,
    dni,
    telefono,
    direccion,
    referencia,
    id_ubigeo
) VALUES (
    @envio1_id,
    'Carlos Mendoza López',
    '45678901',
    '987654321',
    'Av. Ejercito 456',
    'Edificio azul, segundo piso',
    '040101' -- Arequipa
);

-- Asignar envío 1 al viaje 12
INSERT INTO envio_viaje (id_envio, id_viaje) VALUES (@envio1_id, 12);

-- Tracking para envío 1
INSERT INTO seguimiento_envio (
    id_envio,
    id_estado,
    descripcion_evento,
    id_responsable
) VALUES (
    @envio1_id,
    3, -- EN RUTA
    'En ruta hacia agencia destino',
    2  -- Conductor (ajustar según ID real)
);

-- Envío 2
INSERT INTO envios (
    codigo_seguimiento, 
    id_usuario_remitente,
    id_agencia_origen,
    id_agencia_destino,
    estado_actual,
    costo_envio_total,
    fecha_registro
) VALUES (
    'PE-VJ12-002',
    1,
    1,
    2,
    3,
    32.50,
    NOW()
);

SET @envio2_id = LAST_INSERT_ID();

-- Paquete para envío 2
INSERT INTO paquetes (
    id_envio, 
    tipo_paquete, 
    peso_kg, 
    descripcion_contenido,
    fragil,
    valor_declarado
) VALUES (
    @envio2_id,
    'sobre',
    0.8,
    'Contratos legales',
    0,
    50.00
);

-- Dirección destino para envío 2
INSERT INTO direccion_destino_envio (
    id_envio,
    nombre_destinatario,
    dni,
    telefono,
    direccion,
    referencia,
    id_ubigeo
) VALUES (
    @envio2_id,
    'Patricia Ruiz Vargas',
    '87654321',
    '912345678',
    'Calle Mercaderes 123',
    'Local comercial, primer piso',
    '040101'
);

-- Asignar envío 2 al viaje 12
INSERT INTO envio_viaje (id_envio, id_viaje) VALUES (@envio2_id, 12);

-- Tracking para envío 2
INSERT INTO seguimiento_envio (
    id_envio,
    id_estado,
    descripcion_evento,
    id_responsable
) VALUES (
    @envio2_id,
    3,
    'En ruta hacia agencia destino',
    2
);

-- Envío 3
INSERT INTO envios (
    codigo_seguimiento, 
    id_usuario_remitente,
    id_agencia_origen,
    id_agencia_destino,
    estado_actual,
    costo_envio_total,
    fecha_registro
) VALUES (
    'PE-VJ12-003',
    1,
    1,
    2,
    3,
    58.00,
    NOW()
);

SET @envio3_id = LAST_INSERT_ID();

-- Paquete para envío 3 (frágil)
INSERT INTO paquetes (
    id_envio, 
    tipo_paquete, 
    peso_kg, 
    descripcion_contenido,
    fragil,
    valor_declarado
) VALUES (
    @envio3_id,
    'caja_chica',
    3.2,
    'Equipo electrónico',
    1, -- FRÁGIL
    500.00
);

-- Dirección destino para envío 3
INSERT INTO direccion_destino_envio (
    id_envio,
    nombre_destinatario,
    dni,
    telefono,
    direccion,
    referencia,
    id_ubigeo
) VALUES (
    @envio3_id,
    'Roberto Sánchez Torres',
    '12389045',
    '923456789',
    'Av. Goyeneche 789',
    'Casa blanca con portón verde',
    '040101'
);

-- Asignar envío 3 al viaje 12
INSERT INTO envio_viaje (id_envio, id_viaje) VALUES (@envio3_id, 12);

-- Tracking para envío 3
INSERT INTO seguimiento_envio (
    id_envio,
    id_estado,
    descripcion_evento,
    id_responsable
) VALUES (
    @envio3_id,
    3,
    'En ruta hacia agencia destino',
    2
);

-- Verificar los envíos asignados al viaje 12
SELECT 
    e.codigo_seguimiento,
    e.estado_actual,
    dd.nombre_destinatario,
    p.peso_kg,
    p.descripcion_contenido
FROM envios e
JOIN envio_viaje ev ON e.id_envio = ev.id_envio
JOIN direccion_destino_envio dd ON e.id_envio = dd.id_envio
JOIN paquetes p ON e.id_envio = p.id_envio
WHERE ev.id_viaje = 12;

-- Mensaje de confirmación
SELECT '✅ Se agregaron 3 envíos coherentes al viaje 12' as resultado;
