-- =====================================================
-- SISTEMA DE PAQUETERÍA PERÚ
-- Base de Datos Completa
-- =====================================================
-- Motor: MySQL 8.x / MariaDB
-- Charset: utf8mb4_spanish_ci
-- Total de Tablas: 19
-- Última actualización: Enero 2026
-- =====================================================

DROP DATABASE IF EXISTS paqueteria_peru;
CREATE DATABASE paqueteria_peru
CHARACTER SET utf8mb4
COLLATE utf8mb4_spanish_ci;

USE paqueteria_peru;

-- =====================================================
-- CATÁLOGO: ESTADOS DE ENVÍO
-- =====================================================
CREATE TABLE estados_envio (
  id_estado TINYINT UNSIGNED PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT
);

-- =====================================================
-- MÓDULO GEOGRÁFICO
-- =====================================================
CREATE TABLE ubigeo (
  id_ubigeo CHAR(6) PRIMARY KEY,
  departamento VARCHAR(100) NOT NULL,
  provincia VARCHAR(100) NOT NULL,
  distrito VARCHAR(100) NOT NULL,
  UNIQUE KEY ux_ubigeo (departamento, provincia, distrito)
);

-- =====================================================
-- MÓDULO DE SEGURIDAD Y ACCESOS
-- =====================================================

-- 1. IDENTIDAD (Perfil de persona)
CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombres VARCHAR(120) NOT NULL,
  apellidos VARCHAR(120) NOT NULL,
  tipo_documento ENUM('DNI','CE','PASAPORTE','RUC') NOT NULL,
  numero_documento VARCHAR(20) NOT NULL,
  telefono VARCHAR(30),
  direccion VARCHAR(250),
  id_ubigeo CHAR(6),
  id_agencia_trabajo INT NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ux_documento (tipo_documento, numero_documento),
  FOREIGN KEY (id_ubigeo) REFERENCES ubigeo(id_ubigeo),
  FOREIGN KEY (id_agencia_trabajo) REFERENCES agencias(id_agencia)
);

-- 2. ACCESO (Login y Contraseña)
CREATE TABLE credenciales (
  id_credencial INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE, 
  correo VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  ultimo_login DATETIME,
  estado ENUM('activo','bloqueado','suspendido') DEFAULT 'activo',
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- 3. CATÁLOGO DE ROLES
CREATE TABLE roles (
  id_rol TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE,
  descripcion TEXT
);

-- 4. ASIGNACIÓN DE ROLES (Tabla intermedia N:M)
CREATE TABLE usuario_roles (
  id_usuario INT NOT NULL,
  id_rol TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (id_usuario, id_rol),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- =====================================================
-- MÓDULO DE INFRAESTRUCTURA
-- =====================================================

-- Agencias (Sedes físicas)
CREATE TABLE agencias (
  id_agencia INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  direccion VARCHAR(250),
  id_ubigeo CHAR(6),
  telefono VARCHAR(30),
  tipo ENUM('origen','destino','mixta') DEFAULT 'mixta',
  estado ENUM('activa','cerrada') DEFAULT 'activa',
  FOREIGN KEY (id_ubigeo) REFERENCES ubigeo(id_ubigeo)
);

-- Vehículos (Flota de transporte)
CREATE TABLE vehiculos (
  id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
  placa VARCHAR(15) NOT NULL UNIQUE,
  marca VARCHAR(50),
  modelo VARCHAR(50),
  capacidad_kg INT,
  tipo ENUM('moto','furgoneta','camioneta','camion','bus','otro') DEFAULT 'furgoneta',
  estado ENUM('activo','mantenimiento','retirado') DEFAULT 'activo'
);

-- Rutas (Conexiones entre agencias)
CREATE TABLE rutas (
  id_ruta INT AUTO_INCREMENT PRIMARY KEY,
  id_agencia_origen INT NOT NULL,
  id_agencia_destino INT NOT NULL,
  distancia_km DECIMAL(10,2),
  tiempo_estimado_min INT,
  tipo ENUM('principal','secundaria') DEFAULT 'principal',
  FOREIGN KEY (id_agencia_origen) REFERENCES agencias(id_agencia),
  FOREIGN KEY (id_agencia_destino) REFERENCES agencias(id_agencia)
);

-- =====================================================
-- MÓDULO DE CLIENTES EMPRESARIALES (B2B)
-- =====================================================

CREATE TABLE empresas_cliente (
  id_empresa INT AUTO_INCREMENT PRIMARY KEY,
  razon_social VARCHAR(200) NOT NULL,
  ruc VARCHAR(11) NOT NULL UNIQUE,
  nombre_comercial VARCHAR(200),
  direccion_fiscal VARCHAR(250),
  id_ubigeo CHAR(6),
  telefono_central VARCHAR(30),
  sitio_web VARCHAR(150),
  linea_credito DECIMAL(12,2) DEFAULT 0.00,
  dias_credito INT DEFAULT 0,
  fecha_corte_facturacion TINYINT DEFAULT 30,
  porcentaje_descuento DECIMAL(5,2) DEFAULT 0.00,
  estado ENUM('activo','inactivo') DEFAULT 'activo',
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_ubigeo) REFERENCES ubigeo(id_ubigeo)
);

CREATE TABLE empresa_contactos (
  id_contacto INT AUTO_INCREMENT PRIMARY KEY,
  id_empresa INT NOT NULL,
  id_usuario INT NULL,
  nombre_completo VARCHAR(150) NOT NULL,
  telefono_movil VARCHAR(30),
  telefono_fijo VARCHAR(30),
  correo VARCHAR(150),
  cargo VARCHAR(80),
  es_principal TINYINT(1) DEFAULT 0,
  estado ENUM('activo','inactivo') DEFAULT 'activo',
  FOREIGN KEY (id_empresa) REFERENCES empresas_cliente(id_empresa),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

-- =====================================================
-- MÓDULO DE ENVÍOS
-- =====================================================

-- Tabla principal de envíos
CREATE TABLE envios (
  id_envio BIGINT AUTO_INCREMENT PRIMARY KEY,
  codigo_seguimiento VARCHAR(30) NOT NULL UNIQUE,
  id_usuario_remitente INT NOT NULL,
  id_usuario_destinatario INT,
  id_empresa_destino INT,
  id_agencia_origen INT NOT NULL,
  id_agencia_destino INT NOT NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_estimada_entrega DATE,
  valor_declarado_total DECIMAL(12,2) DEFAULT 0.00,
  costo_envio_total DECIMAL(12,2) DEFAULT 0.00,
  estado_actual TINYINT UNSIGNED NOT NULL,
  fecha_entrega DATETIME,
  observaciones_entrega TEXT,
  FOREIGN KEY (id_usuario_remitente) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_usuario_destinatario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_empresa_destino) REFERENCES empresas_cliente(id_empresa),
  FOREIGN KEY (id_agencia_origen) REFERENCES agencias(id_agencia),
  FOREIGN KEY (id_agencia_destino) REFERENCES agencias(id_agencia),
  FOREIGN KEY (estado_actual) REFERENCES estados_envio(id_estado),
  INDEX ix_envios_codigo (codigo_seguimiento),
  INDEX ix_envios_remitente (id_usuario_remitente),
  INDEX ix_envios_estado (estado_actual),
  INDEX ix_envios_agencias (id_agencia_origen, id_agencia_destino)
);

-- Paquetes dentro de un envío
CREATE TABLE paquetes (
  id_paquete BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_envio BIGINT NOT NULL,
  tipo_paquete ENUM('documento','sobre','caja_chica','caja_grande','pallet','otro') DEFAULT 'caja_chica',
  descripcion_contenido VARCHAR(255),
  peso_kg DECIMAL(8,3) DEFAULT 0.00,
  alto_cm DECIMAL(8,2),
  ancho_cm DECIMAL(8,2),
  largo_cm DECIMAL(8,2),
  fragil TINYINT(1) DEFAULT 0,
  valor_declarado DECIMAL(12,2) DEFAULT 0.00,
  FOREIGN KEY (id_envio) REFERENCES envios(id_envio),
  INDEX ix_paquetes_envio (id_envio)
);

-- Dirección de destino del envío
CREATE TABLE direccion_destino_envio (
  id_direccion INT AUTO_INCREMENT PRIMARY KEY,
  id_envio BIGINT NOT NULL,
  nombre_destinatario VARCHAR(200) NOT NULL,
  dni VARCHAR(20),
  telefono VARCHAR(30),
  direccion VARCHAR(300),
  referencia VARCHAR(300),
  id_ubigeo CHAR(6),
  FOREIGN KEY (id_envio) REFERENCES envios(id_envio),
  FOREIGN KEY (id_ubigeo) REFERENCES ubigeo(id_ubigeo)
);

-- Historial de seguimiento (trazabilidad completa)
CREATE TABLE seguimiento_envio (
  id_evento BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_envio BIGINT NOT NULL,
  fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
  id_estado TINYINT UNSIGNED NOT NULL,
  descripcion_evento VARCHAR(500),
  id_agencia INT,
  id_vehiculo INT,
  id_responsable INT,
  id_ubigeo CHAR(6),
  creado_por INT,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_envio) REFERENCES envios(id_envio),
  FOREIGN KEY (id_estado) REFERENCES estados_envio(id_estado),
  FOREIGN KEY (id_agencia) REFERENCES agencias(id_agencia),
  FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id_vehiculo),
  FOREIGN KEY (id_responsable) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_ubigeo) REFERENCES ubigeo(id_ubigeo),
  INDEX ix_seg_envio (id_envio, fecha_hora),
  INDEX ix_seg_estado (id_estado)
);

-- =====================================================
-- MÓDULO DE LOGÍSTICA
-- =====================================================

-- Viajes programados
CREATE TABLE viajes (
  id_viaje BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_ruta INT NOT NULL,
  id_vehiculo INT NOT NULL,
  id_conductor INT NOT NULL,
  fecha_salida DATETIME,
  fecha_llegada_estimada DATETIME,
  fecha_llegada_real DATETIME,
  estado ENUM('programado','en_transito','completado','cancelado') DEFAULT 'programado',
  FOREIGN KEY (id_ruta) REFERENCES rutas(id_ruta),
  FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id_vehiculo),
  FOREIGN KEY (id_conductor) REFERENCES usuarios(id_usuario)
);

-- Envíos asignados a viajes (N:M)
CREATE TABLE envio_viaje (
  id_envio BIGINT NOT NULL,
  id_viaje BIGINT NOT NULL,
  PRIMARY KEY (id_envio, id_viaje),
  FOREIGN KEY (id_envio) REFERENCES envios(id_envio),
  FOREIGN KEY (id_viaje) REFERENCES viajes(id_viaje)
);

-- =====================================================
-- MÓDULO FINANCIERO
-- =====================================================

-- Pagos realizados por envíos
CREATE TABLE pagos (
  id_pago BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_envio BIGINT NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  metodo_pago ENUM('efectivo','tarjeta','transferencia','yape','plin','credito') DEFAULT 'efectivo',
  fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('pagado','pendiente','anulado') DEFAULT 'pagado',
  referencia_pago VARCHAR(200),
  FOREIGN KEY (id_envio) REFERENCES envios(id_envio),
  INDEX ix_pagos_envio (id_envio)
);

-- Comprobantes electrónicos
CREATE TABLE facturas (
  id_factura BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_envio BIGINT,
  id_empresa INT,
  numero_serie VARCHAR(10) NOT NULL,
  numero_correlativo VARCHAR(20) NOT NULL,
  tipo_comprobante ENUM('factura','boleta','nota_credito') DEFAULT 'boleta',
  fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
  ruc_receptor VARCHAR(11),
  razon_social_receptor VARCHAR(200),
  direccion_receptor VARCHAR(250),
  moneda CHAR(3) DEFAULT 'PEN',
  subtotal DECIMAL(12,2) NOT NULL,
  monto_igv DECIMAL(12,2) NOT NULL,
  descuento DECIMAL(12,2) DEFAULT 0.00,
  total DECIMAL(12,2) NOT NULL,
  estado ENUM('emitida','anulada') DEFAULT 'emitida',
  url_pdf VARCHAR(300),
  FOREIGN KEY (id_envio) REFERENCES envios(id_envio),
  FOREIGN KEY (id_empresa) REFERENCES empresas_cliente(id_empresa),
  UNIQUE KEY ux_factura_numero (numero_serie, numero_correlativo)
);

-- =====================================================
-- MÓDULO DE TARIFAS (Cotización y Precios)
-- =====================================================
CREATE TABLE tarifas (
  id_tarifa INT AUTO_INCREMENT PRIMARY KEY,
  
  -- ZONIFICACIÓN
  departamento_origen VARCHAR(100) NOT NULL,
  departamento_destino VARCHAR(100) NOT NULL,
  
  -- TIPO DE SERVICIO
  tipo_servicio ENUM('estandar', 'express', 'carga_pesada') DEFAULT 'estandar',
  
  -- FÓRMULA DE COBRO
  precio_base DECIMAL(10,2) NOT NULL,
  peso_base_kg DECIMAL(5,2) DEFAULT 1.00,
  precio_kg_extra DECIMAL(10,2) NOT NULL,
  
  -- TIEMPOS (Promesa de entrega)
  tiempo_min_dias INT DEFAULT 1,
  tiempo_max_dias INT DEFAULT 3,
  
  estado ENUM('vigente','inactivo') DEFAULT 'vigente',
  
  -- Evita duplicar tarifas para la misma ruta y servicio
  UNIQUE KEY ux_ruta_servicio (departamento_origen, departamento_destino, tipo_servicio)
);

-- =====================================================
-- MÓDULO DE AUDITORÍA
-- =====================================================

-- Log de acciones críticas
CREATE TABLE log_acciones (
  id_log BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  accion VARCHAR(200) NOT NULL,
  tabla_afectada VARCHAR(100),
  registro_id VARCHAR(100),
  detalles TEXT,
  fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
