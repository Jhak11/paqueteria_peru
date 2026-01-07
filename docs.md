# Documentación Detallada de Base de Datos - Paquetería Perú

**Base de Datos:** `paqueteria_peru`  
**Motor:** MySQL 8.x / MariaDB  
**Charset:** utf8mb4_spanish_ci  
**Total de Tablas:** 18

---

## Índice

1. [Arquitectura General](#arquitectura-general)
2. [Módulo de Seguridad y Accesos](#módulo-de-seguridad-y-accesos)
3. [Módulo Geográfico](#módulo-geográfico)
4. [Módulo de Infraestructura](#módulo-de-infraestructura)
5. [Módulo de Clientes Empresariales](#módulo-de-clientes-empresariales)
6. [Módulo de Envíos](#módulo-de-envíos)
7. [Módulo de Logística](#módulo-de-logística)
8. [Módulo Financiero](#módulo-financiero)
9. [Módulo de Auditoría](#módulo-de-auditoría)
10. [Relaciones y Flujos de Datos](#relaciones-y-flujos-de-datos)

---

## Arquitectura General

La base de datos está organizada en **9 módulos funcionales** que agrupan las 18 tablas según su propósito:

```
┌─────────────────────────────────────────────────────────┐
│                  PAQUETERÍA PERÚ                        │
│                 Base de Datos MySQL                     │
└─────────────────────────────────────────────────────────┘
           │
           ├─► Seguridad y Accesos (4 tablas)
           ├─► Geográfico (1 tabla)
           ├─► Infraestructura (3 tablas)
           ├─► Clientes Empresariales (2 tablas)
           ├─► Envíos (4 tablas + 1 catálogo)
           ├─► Logística (3 tablas)
           ├─► Financiero (2 tablas)
           └─► Auditoría (1 tabla)
```

---

## Módulo de Seguridad y Accesos

Este módulo implementa un sistema de **3 capas** para la gestión de usuarios:
1. **Identidad** - Información personal del usuario
2. **Acceso** - Credenciales de autenticación
3. **Autorización** - Roles y permisos

### 1. Tabla: `usuarios`

**Propósito:** Almacena el perfil de identidad de todas las personas en el sistema (clientes, empleados, conductores, administradores).

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_usuario` | INT | PK, AUTO_INCREMENT | Identificador único del usuario |
| `nombres` | VARCHAR(120) | NOT NULL | Nombres de la persona |
| `apellidos` | VARCHAR(120) | NOT NULL | Apellidos de la persona |
| `tipo_documento` | ENUM | NOT NULL | Tipo: DNI, CE, PASAPORTE, RUC |
| `numero_documento` | VARCHAR(20) | NOT NULL | Número del documento |
| `telefono` | VARCHAR(30) | NULL | Teléfono de contacto |
| `direccion` | VARCHAR(250) | NULL | Dirección física |
| `id_ubigeo` | CHAR(6) | FK → `ubigeo` | Ubicación geográfica |
| `fecha_registro` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de registro en el sistema |

**Restricciones:**
- `UNIQUE KEY ux_documento (tipo_documento, numero_documento)` - Previene duplicados
- `FOREIGN KEY (id_ubigeo) REFERENCES ubigeo(id_ubigeo)` - Valida ubicación

**Ejemplo de Registro:**
```sql
INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, telefono, direccion, id_ubigeo)
VALUES ('Juan', 'Pérez García', 'DNI', '10203040', '987654321', 'Av. Larco 100', '150101');
```

**Relaciones:**
- Es referenciada por: `credenciales`, `envios`, `seguimiento_envio`, `empresa_contactos`, `log_acciones`
- Referencia a: `ubigeo`

---

### 2. Tabla: `credenciales`

**Propósito:** Gestiona las credenciales de acceso al sistema (login y contraseña).

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_credencial` | INT | PK, AUTO_INCREMENT | Identificador único |
| `id_usuario` | INT | FK → `usuarios`, UNIQUE | Usuario asociado |
| `correo` | VARCHAR(150) | NOT NULL, UNIQUE | Email de login |
| `password_hash` | VARCHAR(255) | NOT NULL | Contraseña hasheada con bcrypt |
| `ultimo_login` | DATETIME | NULL | Última vez que inició sesión |
| `estado` | ENUM | DEFAULT 'activo' | activo, bloqueado, suspendido |

**Restricciones:**
- `FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE`
- Relación 1:1 con usuarios (un usuario = una credencial)

**Ejemplo:**
```sql
-- Password hasheado con bcrypt (password123)
INSERT INTO credenciales (id_usuario, correo, password_hash, estado)
VALUES (1, 'juan.perez@email.com', '$2b$10$lO43FFrrwtlMn9a6UJtmdeFHvy5M1bGAquLE.3acScaDmmi1wTky', 'activo');
```

**Notas de Seguridad:**
- Las contraseñas se almacenan hasheadas con bcrypt (cost factor: 10)
- El correo es único y sirve como username
- `ON DELETE CASCADE` elimina credenciales si se borra el usuario

---

### 3. Tabla: `roles`

**Propósito:** Catálogo de roles disponibles en el sistema (RBAC - Role-Based Access Control).

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_rol` | TINYINT UNSIGNED | PK, AUTO_INCREMENT | Identificador único |
| `nombre` | VARCHAR(30) | NOT NULL, UNIQUE | Nombre del rol |
| `descripcion` | TEXT | NULL | Descripción de permisos |

**Roles Predefinidos:**

| ID | Nombre | Descripción |
|----|--------|-------------|
| 1 | Administrador | Acceso total al sistema |
| 2 | Cliente | Usuario que realiza envíos |
| 3 | Empleado | Personal de mostrador y almacén |
| 4 | Conductor | Chofer de ruta y reparto |

**Ejemplo:**
```sql
INSERT INTO roles (nombre, descripcion) 
VALUES ('Administrador', 'Acceso total al sistema');
```

---

### 4. Tabla: `usuario_roles`

**Propósito:** Tabla intermedia que asigna roles a usuarios (relación N:M).

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_usuario` | INT | PK, FK → `usuarios` | Usuario |
| `id_rol` | TINYINT UNSIGNED | PK, FK → `roles` | Rol asignado |

**Restricciones:**
- `PRIMARY KEY (id_usuario, id_rol)` - Previene duplicados
- `FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)`
- `FOREIGN KEY (id_rol) REFERENCES roles(id_rol)`

**Características:**
- Un usuario puede tener múltiples roles
- Un rol puede estar asignado a múltiples usuarios
- Ejemplo: Un empleado puede también ser cliente

**Ejemplo:**
```sql
-- Asignar rol de Cliente (id=2) al usuario id=5
INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (5, 2);

-- El mismo usuario también puede ser Empleado
INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (5, 3);
```

---

## Módulo Geográfico

### 5. Tabla: `ubigeo`

**Propósito:** Almacena la división geográfica del Perú (departamentos, provincias y distritos) basada en el estándar INEI.

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_ubigeo` | CHAR(6) | PK | Código INEI de 6 dígitos |
| `departamento` | VARCHAR(100) | NOT NULL | Nombre del departamento |
| `provincia` | VARCHAR(100) | NOT NULL | Nombre de la provincia |
| `distrito` | VARCHAR(100) | NOT NULL | Nombre del distrito |

**Restricciones:**
- `UNIQUE KEY ux_ubigeo (departamento, provincia, distrito)` - Previene duplicados

**Estructura del Código:**
- Posiciones 1-2: Código de departamento
- Posiciones 3-4: Código de provincia
- Posiciones 5-6: Código de distrito

**Ejemplos:**
```sql
-- Lima, Lima, Lima
INSERT INTO ubigeo VALUES ('150101', 'LIMA', 'LIMA', 'LIMA');

-- Arequipa, Arequipa, Arequipa
INSERT INTO ubigeo VALUES ('040101', 'AREQUIPA', 'AREQUIPA', 'AREQUIPA');

-- Cusco, Cusco, Cusco
INSERT INTO ubigeo VALUES ('080101', 'CUSCO', 'CUSCO', 'CUSCO');
```

**Datos:**
- El sistema incluye 1,874 ubigeos reales cargados desde `ubigeo.csv`
- Cubre todo el Perú a nivel de distrito

**Uso:**
- Ubicación de usuarios, agencias, direcciones de entrega
- Cálculo de tarifas por distancia
- Reportes geográficos

---

## Módulo de Infraestructura

### 6. Tabla: `agencias`

**Propósito:** Gestiona las sedes físicas de la empresa de paquetería.

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_agencia` | INT | PK, AUTO_INCREMENT | Identificador único |
| `nombre` | VARCHAR(150) | NOT NULL | Nombre de la agencia |
| `direccion` | VARCHAR(250) | NULL | Dirección física |
| `id_ubigeo` | CHAR(6) | FK → `ubigeo` | Ubicación geográfica |
| `telefono` | VARCHAR(30) | NULL | Teléfono de contacto |
| `tipo` | ENUM | DEFAULT 'mixta' | origen, destino, mixta |
| `estado` | ENUM | DEFAULT 'activa' | activa, cerrada |

**Tipos de Agencia:**
- **origen**: Solo recibe envíos
- **destino**: Solo entrega envíos
- **mixta**: Recibe y entrega

**Ejemplo:**
```sql
INSERT INTO agencias (nombre, direccion, id_ubigeo, tipo, telefono, estado)
VALUES ('Sede Central Lima', 'Av. Javier Prado Este 2501', '150101', 'mixta', '01-224-5555', 'activa');
```

**Relaciones:**
- Referencia a: `ubigeo`
- Es referenciada por: `envios` (origen/destino), `seguimiento_envio`, `rutas`

---

### 7. Tabla: `vehiculos`

**Propósito:** Registro de la flota de vehículos de transporte.

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_vehiculo` | INT | PK, AUTO_INCREMENT | Identificador único |
| `placa` | VARCHAR(15) | NOT NULL, UNIQUE | Placa del vehículo |
| `marca` | VARCHAR(50) | NULL | Marca del vehículo |
| `modelo` | VARCHAR(50) | NULL | Modelo |
| `capacidad_kg` | INT | NULL | Capacidad de carga en kg |
| `tipo` | ENUM | DEFAULT 'furgoneta' | Tipo de vehículo |
| `estado` | ENUM | DEFAULT 'activo' | Estado operativo |

**Tipos de Vehículo:**
- `moto` - Hasta 50 kg
- `furgoneta` - Hasta 1,500 kg
- `camioneta` - Hasta 3,000 kg
- `camion` - Hasta 25,000 kg
- `bus` - Pasajeros + carga
- `otro` - Otro tipo

**Estados:**
- `activo` - Operativo
- `mantenimiento` - En mantenimiento
- `retirado` - Fuera de servicio

**Ejemplo:**
```sql
INSERT INTO vehiculos (placa, marca, modelo, capacidad_kg, tipo, estado)
VALUES ('A1B-100', 'Toyota', 'Hiace', 1500, 'furgoneta', 'activo');
```

---

### 8. Tabla: `rutas`

**Propósito:** Define las conexiones entre agencias con distancias y tiempos estimados.

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_ruta` | INT | PK, AUTO_INCREMENT | Identificador único |
| `id_agencia_origen` | INT | FK → `agencias` | Agencia de origen |
| `id_agencia_destino` | INT | FK → `agencias` | Agencia de destino |
| `distancia_km` | DECIMAL(10,2) | NULL | Distancia en kilómetros |
| `tiempo_estimado_min` | INT | NULL | Tiempo estimado en minutos |
| `tipo` | ENUM | DEFAULT 'principal' | principal, secundaria |

**Tipos de Ruta:**
- **principal**: Ruta directa entre ciudades principales
- **secundaria**: Ruta alternativa o con transbordos

**Ejemplo:**
```sql
-- Lima → Arequipa: 1,015 km, 16 horas
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo)
VALUES (1, 2, 1015.00, 960, 'principal');

-- Ruta de retorno
INSERT INTO rutas (id_agencia_origen, id_agencia_destino, distancia_km, tiempo_estimado_min, tipo)
VALUES (2, 1, 1015.00, 960, 'principal');
```

**Nota:** Las rutas son direccionales, por lo que se requiere un registro para cada dirección.

---

## Módulo de Clientes Empresariales

### 9. Tabla: `empresas_cliente`

**Propósito:** Gestiona clientes corporativos (B2B) con condiciones especiales de crédito y facturación.

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_empresa` | INT | PK, AUTO_INCREMENT | Identificador único |
| `razon_social` | VARCHAR(200) | NOT NULL | Razón social legal |
| `ruc` | VARCHAR(11) | NOT NULL, UNIQUE | RUC de la empresa |
| `nombre_comercial` | VARCHAR(200) | NULL | Nombre comercial |
| `direccion_fiscal` | VARCHAR(250) | NULL | Dirección fiscal |
| `id_ubigeo` | CHAR(6) | FK → `ubigeo` | Ubicación |
| `telefono_central` | VARCHAR(30) | NULL | Teléfono principal |
| `sitio_web` | VARCHAR(150) | NULL | Sitio web |
| `linea_credito` | DECIMAL(12,2) | DEFAULT 0.00 | Línea de crédito en soles |
| `dias_credito` | INT | DEFAULT 0 | Días de crédito (ej: 30, 60) |
| `fecha_corte_facturacion` | TINYINT | DEFAULT 30 | Día del mes para corte |
| `porcentaje_descuento` | DECIMAL(5,2) | DEFAULT 0.00 | Descuento corporativo % |
| `estado` | ENUM | DEFAULT 'activo' | activo, inactivo |
| `fecha_registro` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de registro |

**Ejemplo:**
```sql
INSERT INTO empresas_cliente (razon_social, ruc, nombre_comercial, linea_credito, dias_credito, porcentaje_descuento)
VALUES ('Tech Solutions SAC', '20123456789', 'TechSol', 50000.00, 60, 15.00);
```

**Características Especiales:**
- Línea de crédito permite envíos sin pago inmediato
- Descuentos por volumen
- Facturación consolidada mensual

---

### 10. Tabla: `empresa_contactos`

**Propósito:** Almacena los contactos/representantes de las empresas clientes.

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_contacto` | INT | PK, AUTO_INCREMENT | Identificador único |
| `id_empresa` | INT | FK → `empresas_cliente` | Empresa asociada |
| `id_usuario` | INT | FK → `usuarios`, NULL | Usuario del sistema (si tiene login) |
| `nombre_completo` | VARCHAR(150) | NOT NULL | Nombre del contacto |
| `telefono_movil` | VARCHAR(30) | NULL | Celular |
| `telefono_fijo` | VARCHAR(30) | NULL | Teléfono fijo |
| `correo` | VARCHAR(150) | NULL | Email |
| `cargo` | VARCHAR(80) | NULL | Cargo en la empresa |
| `es_principal` | TINYINT(1) | DEFAULT 0 | 1 si es contacto principal |
| `estado` | ENUM | DEFAULT 'activo' | activo, inactivo |

**Ejemplo:**
```sql
INSERT INTO empresa_contactos (id_empresa, id_usuario, nombre_completo, telefono_movil, correo, cargo, es_principal)
VALUES (1, 15, 'Carlos Mendoza', '987123456', 'cmendoza@techsol.com', 'Gerente de Logística', 1);
```

**Relación con Sistema de Login:**
- `id_usuario` puede ser NULL si el contacto no tiene acceso al sistema
- Si tiene `id_usuario`, el contacto puede hacer login y gestionar envíos

---

## Módulo de Envíos

### 11. Tabla: `estados_envio`

**Propósito:** Catálogo de estados posibles para un envío.

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_estado` | TINYINT UNSIGNED | PK | Identificador (1-7) |
| `nombre` | VARCHAR(50) | NOT NULL | Nombre del estado |
| `descripcion` | TEXT | NULL | Descripción detallada |

**Estados Definidos:**

| ID | Nombre | Descripción |
|----|--------|-------------|
| 1 | Registrado | Envío registrado, pendiente de entrega en agencia |
| 2 | En Almacén Origen | Recibido en la agencia de origen |
| 3 | En Ruta | En transporte hacia la ciudad de destino |
| 4 | En Almacén Destino | Recibido en la agencia de destino |
| 5 | En Reparto | Salió a distribución final |
| 6 | Entregado | Entregado al destinatario |
| 7 | Devuelto | No se pudo entregar, devuelto a origen |

**Flujo Típico:**
```
Registrado → En Almacén Origen → En Ruta → En Almacén Destino → En Reparto → Entregado
```

---

### 12. Tabla: `envios`

**Propósito:** Tabla central que registra todos los envíos del sistema.

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_envio` | BIGINT | PK, AUTO_INCREMENT | Identificador único |
| `codigo_seguimiento` | VARCHAR(30) | NOT NULL, UNIQUE | Código público de rastreo |
| `id_usuario_remitente` | INT | FK → `usuarios` | Quien envía |
| `id_usuario_destinatario` | INT | FK → `usuarios`, NULL | Quien recibe (persona) |
| `id_empresa_destino` | INT | FK → `empresas_cliente`, NULL | Empresa destinataria |
| `id_agencia_origen` | INT | FK → `agencias` | Agencia donde se registró |
| `id_agencia_destino` | INT | FK → `agencias` | Agencia de destino |
| `fecha_registro` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Cuándo se creó |
| `fecha_estimada_entrega` | DATE | NULL | Fecha estimada de entrega |
| `valor_declarado_total` | DECIMAL(12,2) | DEFAULT 0.00 | Valor de mercancía |
| `costo_envio_total` | DECIMAL(12,2) | DEFAULT 0.00 | Costo del servicio |
| `estado_actual` | TINYINT UNSIGNED | FK → `estados_envio` | Estado actual |
| `fecha_entrega` | DATETIME | NULL | Cuándo se entregó |
| `observaciones_entrega` | TEXT | NULL | Notas de entrega |

**Índices:**
```sql
INDEX ix_envios_codigo (codigo_seguimiento)      -- Búsqueda rápida
INDEX ix_envios_remitente (id_usuario_remitente) -- Historial del cliente
INDEX ix_envios_estado (estado_actual)           -- Filtrar por estado
INDEX ix_envios_agencias (id_agencia_origen, id_agencia_destino) -- Reportes
```

**Ejemplo:**
```sql
INSERT INTO envios (
    codigo_seguimiento, 
    id_usuario_remitente, 
    id_usuario_destinatario,
    id_agencia_origen, 
    id_agencia_destino,
    fecha_estimada_entrega,
    costo_envio_total,
    estado_actual
)
VALUES (
    'PE-TEST-001',
    5,     -- Juan Pérez
    10,    -- María Mendoza
    1,     -- Sede Lima
    2,     -- Base Arequipa
    '2025-01-05',
    120.00,
    1      -- Registrado
);
```

---

### 13. Tabla: `paquetes`

**Propósito:** Detalles de cada paquete dentro de un envío (un envío puede tener múltiples paquetes).

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_paquete` | BIGINT | PK, AUTO_INCREMENT | Identificador único |
| `id_envio` | BIGINT | FK → `envios` | Envío al que pertenece |
| `tipo_paquete` | ENUM | DEFAULT 'caja_chica' | Tipo de paquete |
| `descripcion_contenido` | VARCHAR(255) | NULL | Qué contiene |
| `peso_kg` | DECIMAL(8,3) | DEFAULT 0.00 | Peso en kilogramos |
| `alto_cm` | DECIMAL(8,2) | NULL | Alto en centímetros |
| `ancho_cm` | DECIMAL(8,2) | NULL | Ancho en centímetros |
| `largo_cm` | DECIMAL(8,2) | NULL | Largo en centímetros |
| `fragil` | TINYINT(1) | DEFAULT 0 | 1 si es frágil |
| `valor_declarado` | DECIMAL(12,2) | DEFAULT 0.00 | Valor del contenido |

**Tipos de Paquete:**
- `documento` - Documentos
- `sobre` - Sobres pequeños
- `caja_chica` - Caja pequeña
- `caja_grande` - Caja grande
- `pallet` - Pallet completo
- `otro` - Otro tipo

**Ejemplo:**
```sql
INSERT INTO paquetes (id_envio, tipo_paquete, descripcion_contenido, peso_kg, fragil, valor_declarado)
VALUES (1, 'caja_chica', 'Laptop Dell y accesorios', 2.5, 1, 3500.00);
```

**Índice:**
```sql
INDEX ix_paquetes_envio (id_envio) -- Consultar paquetes de un envío
```

---

### 14. Tabla: `direccion_destino_envio`

**Propósito:** Almacena la dirección exacta de entrega del envío.

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_direccion` | INT | PK, AUTO_INCREMENT | Identificador único |
| `id_envio` | BIGINT | FK → `envios` | Envío asociado |
| `nombre_destinatario` | VARCHAR(200) | NOT NULL | Nombre de quien recibe |
| `telefono` | VARCHAR(30) | NULL | Teléfono de contacto |
| `direccion` | VARCHAR(300) | NULL | Dirección completa |
| `referencia` | VARCHAR(300) | NULL | Referencias de ubicación |
| `id_ubigeo` | CHAR(6) | FK → `ubigeo` | Ubicación geográfica |

**Ejemplo:**
```sql
INSERT INTO direccion_destino_envio (
    id_envio, 
    nombre_destinatario, 
    telefono, 
    direccion, 
    referencia, 
    id_ubigeo
)
VALUES (
    1,
    'María Mendoza',
    '912345678',
    'Calle Yanahuara 500, Arequipa',
    'Casa de dos pisos, portón verde',
    '040101'
);
```

**Nota:** Esta tabla se separa de `envios` para:
- Normalización (evitar redundancia)
- Permitir múltiples direcciones por envío (futuro)
- Historial de direcciones

---

### 15. Tabla: `seguimiento_envio`

**Propósito:** Registra TODOS los eventos en la vida de un envío (trazabilidad completa).

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_evento` | BIGINT | PK, AUTO_INCREMENT | Identificador único |
| `id_envio` | BIGINT | FK → `envios` | Envío rastreado |
| `fecha_hora` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Cuándo ocurrió |
| `id_estado` | TINYINT UNSIGNED | FK → `estados_envio` | Estado en este punto |
| `descripcion_evento` | VARCHAR(500) | NULL | Descripción del evento |
| `id_agencia` | INT | FK → `agencias`, NULL | Agencia donde ocurrió |
| `id_vehiculo` | INT | FK → `vehiculos`, NULL | Vehículo involucrado |
| `id_responsable` | INT | FK → `usuarios`, NULL | Empleado responsable |
| `id_ubigeo` | CHAR(6) | FK → `ubigeo`, NULL | Ubicación exacta |
| `creado_por` | INT | NULL | Usuario que creó el registro |
| `creado_en` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp de creación |

**Índices:**
```sql
INDEX ix_seg_envio (id_envio, fecha_hora)  -- Timeline del envío
INDEX ix_seg_estado (id_estado)            -- Filtrar por estado
```

**Ejemplo de Historial:**
```sql
-- Evento 1: Registro
INSERT INTO seguimiento_envio (id_envio, id_estado, descripcion_evento, id_agencia, id_ubigeo)
VALUES (1, 1, 'Envío registrado en Sede Central Lima', 1, '150101');

-- Evento 2: Recepción en almacén
INSERT INTO seguimiento_envio (id_envio, id_estado, descripcion_evento, id_agencia, id_responsable)
VALUES (1, 2, 'Recibido en almacén, listo para despacho', 1, 3);

-- Evento 3: Salida en ruta
INSERT INTO seguimiento_envio (id_envio, id_estado, descripcion_evento, id_agencia, id_vehiculo)
VALUES (1, 3, 'En ruta hacia Arequipa en camión A1B-100', 1, 1);

-- Evento 4: Llegada a destino
INSERT INTO seguimiento_envio (id_envio, id_estado, descripcion_evento, id_agencia, id_ubigeo)
VALUES (1, 4, 'Llegó a Base Arequipa', 2, '040101');

-- Evento 5: Entrega final
INSERT INTO seguimiento_envio (id_envio, id_estado, descripcion_evento, id_agencia, id_responsable)
VALUES (1, 6, 'Entregado a María Mendoza - Firma recibida', 2, 8);
```

**Características:**
- **Inmutable**: Nunca se elimina, solo se agrega
- **Auditable**: Cada evento tiene timestamp y responsable
- **Completo**: Incluye agencia, vehículo, ubicación exacta

---

## Módulo de Logística

### 16. Tabla: `viajes`

**Propósito:** Gestiona los viajes programados de vehículos en rutas específicas.

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_viaje` | BIGINT | PK, AUTO_INCREMENT | Identificador único |
| `id_ruta` | INT | FK → `rutas` | Ruta asignada |
| `id_vehiculo` | INT | FK → `vehiculos` | Vehículo asignado |
| `fecha_salida` | DATETIME | NULL | Cuándo sale |
| `fecha_llegada_estimada` | DATETIME | NULL | Cuándo debería llegar |
| `fecha_llegada_real` | DATETIME | NULL | Cuándo llegó realmente |
| `estado` | ENUM | DEFAULT 'programado' | Estado del viaje |

**Estados de Viaje:**
- `programado` - Viaje planificado
- `en_transito` - Vehículo en camino
- `completado` - Viaje finalizado
- `cancelado` - Viaje cancelado

**Ejemplo:**
```sql
-- Programar viaje Lima → Arequipa
INSERT INTO viajes (id_ruta, id_vehiculo, fecha_salida, fecha_llegada_estimada, estado)
VALUES (
    1,                              -- Ruta Lima-Arequipa
    1,                              -- Vehículo A1B-100
    '2025-01-01 08:00:00',         -- Sale a las 8am
    '2025-01-02 00:00:00',         -- Llega al día siguiente
    'programado'
);
```

---

### 17. Tabla: `envio_viaje`

**Propósito:** Tabla intermedia que asigna envíos a viajes (relación N:M).

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_envio` | BIGINT | PK, FK → `envios` | Envío |
| `id_viaje` | BIGINT | PK, FK → `viajes` | Viaje |

**Restricciones:**
- `PRIMARY KEY (id_envio, id_viaje)`

**Características:**
- Un envío puede estar en múltiples viajes (transbordos)
- Un viaje puede llevar múltiples envíos

**Ejemplo:**
```sql
-- Asignar 3 envíos al viaje Lima-Arequipa
INSERT INTO envio_viaje (id_envio, id_viaje) VALUES
(1, 1),  -- Envío PE-TEST-001
(2, 1),  -- Envío PE-TEST-002
(3, 1);  -- Envío PE-TEST-003
```

**Consulta de Carga:**
```sql
-- Ver todos los envíos en un viaje
SELECT e.codigo_seguimiento, e.costo_envio_total
FROM envios e
JOIN envio_viaje ev ON e.id_envio = ev.id_envio
WHERE ev.id_viaje = 1;
```

---

## Módulo Financiero

### 18. Tabla: `pagos`

**Propósito:** Registra todos los pagos realizados por envíos.

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_pago` | BIGINT | PK, AUTO_INCREMENT | Identificador único |
| `id_envio` | BIGINT | FK → `envios` | Envío pagado |
| `monto` | DECIMAL(12,2) | NOT NULL | Monto pagado |
| `metodo_pago` | ENUM | DEFAULT 'efectivo' | Método de pago |
| `fecha_pago` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Cuándo se pagó |
| `estado` | ENUM | DEFAULT 'pagado' | Estado del pago |
| `referencia_pago` | VARCHAR(200) | NULL | Número de operación/referencia |

**Métodos de Pago:**
- `efectivo` - Pago en efectivo
- `tarjeta` - Tarjeta de crédito/débito
- `transferencia` - Transferencia bancaria
- `yape` - Yape
- `plin` - Plin
- `credito` - Crédito empresarial

**Estados:**
- `pagado` - Pago confirmado
- `pendiente` - Pago pendiente
- `anulado` - Pago anulado

**Ejemplo:**
```sql
INSERT INTO pagos (id_envio, monto, metodo_pago, estado, referencia_pago)
VALUES (1, 120.00, 'yape', 'pagado', '987654321-20250101-001');
```

**Índice:**
```sql
INDEX ix_pagos_envio (id_envio) -- Historial de pagos por envío
```

**Nota:** Un envío puede tener múltiples pagos (pagos parciales).

---

### 19. Tabla: `facturas`

**Propósito:** Gestiona la emisión de comprobantes electrónicos.

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_factura` | BIGINT | PK, AUTO_INCREMENT | Identificador único |
| `id_envio` | BIGINT | FK → `envios`, NULL | Envío facturado |
| `id_empresa` | INT | FK → `empresas_cliente`, NULL | Empresa (facturación consolidada) |
| `numero_serie` | VARCHAR(10) | NOT NULL | Serie del comprobante |
| `numero_correlativo` | VARCHAR(20) | NOT NULL | Número correlativo |
| `tipo_comprobante` | ENUM | DEFAULT 'boleta' | Tipo de comprobante |
| `fecha_emision` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Cuándo se emitió |
| `ruc_receptor` | VARCHAR(11) | NULL | RUC del cliente |
| `razon_social_receptor` | VARCHAR(200) | NULL | Razón social |
| `direccion_receptor` | VARCHAR(250) | NULL | Dirección |
| `moneda` | CHAR(3) | DEFAULT 'PEN' | PEN, USD |
| `subtotal` | DECIMAL(12,2) | NOT NULL | Base imponible |
| `monto_igv` | DECIMAL(12,2) | NOT NULL | IGV 18% |
| `descuento` | DECIMAL(12,2) | DEFAULT 0.00 | Descuento aplicado |
| `total` | DECIMAL(12,2) | NOT NULL | Total a pagar |
| `estado` | ENUM | DEFAULT 'emitida' | emitida, anulada |
| `url_pdf` | VARCHAR(300) | NULL | URL del PDF |

**Restricciones:**
- `UNIQUE KEY ux_factura_numero (numero_serie, numero_correlativo)` - Previene duplicados

**Tipos de Comprobante:**
- `factura` - Factura (RUC)
- `boleta` - Boleta (persona natural)
- `nota_credito` - Nota de crédito

**Ejemplo:**
```sql
-- Factura para un envío
INSERT INTO facturas (
    id_envio, 
    numero_serie, 
    numero_correlativo, 
    tipo_comprobante,
    ruc_receptor,
    razon_social_receptor,
    subtotal,
    monto_igv,
    total
) VALUES (
    1,
    'F001',
    '00000123',
    'factura',
    '20123456789',
    'Tech Solutions SAC',
    101.69,   -- Subtotal
    18.31,    -- IGV 18%
    120.00    -- Total
);
```

---

## Módulo de Auditoría

### 20. Tabla: `log_acciones`

**Propósito:** Registra todas las acciones importantes en el sistema para auditoría.

**Campos:**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id_log` | BIGINT | PK, AUTO_INCREMENT | Identificador único |
| `id_usuario` | INT | FK → `usuarios`, NULL | Usuario que realizó la acción |
| `accion` | VARCHAR(200) | NOT NULL | Descripción de la acción |
| `tabla_afectada` | VARCHAR(100) | NULL | Tabla modificada |
| `registro_id` | VARCHAR(100) | NULL | ID del registro afectado |
| `detalles` | TEXT | NULL | Detalles adicionales (JSON) |
| `fecha_hora` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Cuándo ocurrió |

**Ejemplo:**
```sql
-- Log de creación de envío
INSERT INTO log_acciones (id_usuario, accion, tabla_afectada, registro_id, detalles)
VALUES (
    5,
    'CREATE_ENVIO',
    'envios',
    '1',
    '{"codigo": "PE-TEST-001", "remitente": "Juan Pérez", "destino": "Arequipa"}'
);

-- Log de cambio de estado
INSERT INTO log_acciones (id_usuario, accion, tabla_afectada, registro_id, detalles)
VALUES (
    3,
    'UPDATE_ESTADO_ENVIO',
    'seguimiento_envio',
    '15',
    '{"envio": "PE-TEST-001", "estado_anterior": "Registrado", "estado_nuevo": "En Ruta"}'
);
```

**Casos de Uso:**
- Auditoría de seguridad
- Rastreo de cambios críticos
- Análisis forense
- Cumplimiento normativo

---

## Relaciones y Flujos de Datos

### Diagrama de Relaciones Principales

```
usuarios ──┬─→ credenciales (1:1)
           ├─→ usuario_roles (1:N) ──→ roles
           ├─→ envios (remitente/destinatario)
           ├─→ seguimiento_envio (responsable)
           └─→ log_acciones

ubigeo ────┬─→ usuarios
           ├─→ agencias
           ├─→ empresas_cliente
           ├─→ direccion_destino_envio
           └─→ seguimiento_envio

agencias ──┬─→ envios (origen/destino)
           ├─→ rutas (origen/destino)
           └─→ seguimiento_envio

envios ────┬─→ paquetes (1:N)
           ├─→ direccion_destino_envio (1:1)
           ├─→ seguimiento_envio (1:N)
           ├─→ envio_viaje (N:M) ──→ viajes
           ├─→ pagos (1:N)
           └─→ facturas (1:1 o 1:N)

viajes ────┬─→ rutas (N:1)
           ├─→ vehiculos (N:1)
           └─→ envio_viaje (N:M)

empresas_cliente ──┬─→ empresa_contactos (1:N)
                   ├─→ envios (destino)
                   └─→ facturas
```

### Flujo 1: Registro de un Envío

**Actores:** Empleado de mostrador, Cliente remitente

**Pasos:**

1. **Cliente llega a agencia**
   ```sql
   -- Buscar o crear cliente en 'usuarios'
   SELECT * FROM usuarios WHERE numero_documento = '10203040';
   ```

2. **Registrar envío**
   ```sql
   INSERT INTO envios (codigo_seguimiento, id_usuario_remitente, id_agencia_origen, ...)
   VALUES ('PE-675-630', 5, 1, ...);
   ```

3. **Agregar detalles de paquete**
   ```sql
   INSERT INTO paquetes (id_envio, tipo_paquete, peso_kg, descripcion_contenido)
   VALUES (1, 'caja_chica', 2.5, 'Laptop Dell');
   ```

4. **Agregar dirección de destino**
   ```sql
   INSERT INTO direccion_destino_envio (id_envio, nombre_destinatario, direccion, id_ubigeo)
   VALUES (1, 'María Mendoza', 'Calle Yanahuara 500', '040101');
   ```

5. **Registrar primer evento de seguimiento**
   ```sql
   INSERT INTO seguimiento_envio (id_envio, id_estado, descripcion_evento, id_agencia)
   VALUES (1, 1, 'Envío registrado en Sede Central Lima', 1);
   ```

6. **Procesar pago**
   ```sql
   INSERT INTO pagos (id_envio, monto, metodo_pago)
   VALUES (1, 120.00, 'efectivo');
   ```

7. **Auditoría**
   ```sql
   INSERT INTO log_acciones (id_usuario, accion, tabla_afectada, registro_id)
   VALUES (3, 'CREATE_ENVIO', 'envios', '1');
   ```

### Flujo 2: Rastreo Público de Envío

**Actor:** Cliente final (sin autenticación)

**Query:**
```sql
SELECT 
    e.codigo_seguimiento,
    est.nombre AS estado_actual,
    ao.nombre AS origen,
    ad.nombre AS destino,
    e.fecha_estimada_entrega,
    e.fecha_entrega
FROM envios e
JOIN estados_envio est ON e.estado_actual = est.id_estado
JOIN agencias ao ON e.id_agencia_origen = ao.id_agencia
JOIN agencias ad ON e.id_agencia_destino = ad.id_agencia
WHERE e.codigo_seguimiento = 'PE-TEST-001';
```

**Historial:**
```sql
SELECT 
    se.fecha_hora,
    est.nombre AS estado,
    se.descripcion_evento,
    a.nombre AS agencia,
    CONCAT(u.departamento, ' - ', u.distrito) AS ubicacion
FROM seguimiento_envio se
JOIN estados_envio est ON se.id_estado = est.id_estado
LEFT JOIN agencias a ON se.id_agencia = a.id_agencia
LEFT JOIN ubigeo u ON se.id_ubigeo = u.id_ubigeo
WHERE se.id_envio = 1
ORDER BY se.fecha_hora ASC;
```

### Flujo 3: Programación de Viaje

**Actor:** Administrador de logística

1. **Crear viaje en ruta**
   ```sql
   INSERT INTO viajes (id_ruta, id_vehiculo, fecha_salida, fecha_llegada_estimada)
   VALUES (1, 1, '2025-01-01 08:00:00', '2025-01-02 00:00:00');
   ```

2. **Asignar envíos al viaje**
   ```sql
   -- Buscar envíos pendientes Lima → Arequipa
   SELECT id_envio, codigo_seguimiento
   FROM envios
   WHERE id_agencia_origen = 1 
     AND id_agencia_destino = 2
     AND estado_actual = 2;  -- En Almacén Origen
   
   -- Asignar al viaje
   INSERT INTO envio_viaje (id_envio, id_viaje) VALUES
   (1, 1),
   (2, 1),
   (3, 1);
   ```

3. **Actualizar estado de envíos**
   ```sql
   -- Marcar como "En Ruta"
   UPDATE envios SET estado_actual = 3 WHERE id_envio IN (1,2,3);
   
   -- Registrar evento
   INSERT INTO seguimiento_envio (id_envio, id_estado, descripcion_evento, id_vehiculo)
   SELECT id_envio, 3, 'Salió en ruta hacia Arequipa', 1
   FROM envio_viaje WHERE id_viaje = 1;
   ```

4. **Actualizar estado del viaje**
   ```sql
   UPDATE viajes SET estado = 'en_transito' WHERE id_viaje = 1;
   ```

### Flujo 4: Facturación Consolidada para Empresa

**Actor:** Personal de facturación

1. **Obtener envíos del mes de una empresa**
   ```sql
   SELECT 
       e.id_envio,
       e.codigo_seguimiento,
       e.costo_envio_total,
       e.fecha_registro
   FROM envios e
   WHERE e.id_empresa_destino = 1
     AND MONTH(e.fecha_registro) = 12
     AND YEAR(e.fecha_registro) = 2025
     AND NOT EXISTS (
         SELECT 1 FROM facturas f WHERE f.id_envio = e.id_envio
     );
   ```

2. **Calcular totales**
   ```sql
   SELECT 
       SUM(costo_envio_total) AS subtotal,
       SUM(costo_envio_total) * 0.18 AS igv,
       SUM(costo_envio_total) * 1.18 AS total
   FROM envios
   WHERE id_empresa_destino = 1
     AND MONTH(fecha_registro) = 12;
   ```

3. **Emitir factura consolidada**
   ```sql
   INSERT INTO facturas (
       id_empresa,
       numero_serie,
       numero_correlativo,
       tipo_comprobante,
       ruc_receptor,
       razon_social_receptor,
       subtotal,
       monto_igv,
       total
   )
   SELECT 
       1,
       'F001',
       '00000150',
       'factura',
       ec.ruc,
       ec.razon_social,
       5000.00,
       900.00,
       5900.00
   FROM empresas_cliente ec
   WHERE ec.id_empresa = 1;
   ```

### Flujo 5: Consulta Analítica con Window Functions

**Top 3 envíos por cliente:**
```sql
SELECT *
FROM (
    SELECT 
        u.nombres,
        u.apellidos,
        e.codigo_seguimiento,
        e.fecha_registro,
        e.costo_envio_total,
        ROW_NUMBER() OVER (
            PARTITION BY e.id_usuario_remitente
            ORDER BY e.fecha_registro DESC
        ) AS numero_envio
    FROM envios e
    JOIN usuarios u ON e.id_usuario_remitente = u.id_usuario
) t
WHERE numero_envio <= 3
ORDER BY nombres, fecha_registro DESC;
```

**Ranking de clientes por volumen:**
```sql
SELECT 
    u.nombres,
    u.apellidos,
    COUNT(*) AS total_envios,
    SUM(e.costo_envio_total) AS monto_total,
    RANK() OVER (ORDER BY COUNT(*) DESC) AS ranking,
    DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) AS ranking_denso
FROM envios e
JOIN usuarios u ON e.id_usuario_remitente = u.id_usuario
GROUP BY u.id_usuario, u.nombres, u.apellidos
ORDER BY total_envios DESC
LIMIT 10;
```

---

## Conclusiones

Esta base de datos implementa un sistema completo de gestión de paquetería con:

✅ **Normalización** - Evita redundancia de datos  
✅ **Integridad Referencial** - Foreign keys garantizan consistencia  
✅ **Seguridad** - Separación de identidad, acceso y roles  
✅ **Trazabilidad Completa** - Historial inmutable de eventos  
✅ **Escalabilidad** - Índices optimizados para consultas frecuentes  
✅ **Flexibilidad** - Soporta clientes individuales y corporativos  
✅ **Auditoría** - Logs de todas las acciones críticas  
✅ **Análisis** - Window functions para reportes avanzados  

**Total de Tablas: 18**  
**Total de Relaciones FK: 27**  
**Total de Índices: 8**

---

*Documentación generada el 31 de Diciembre, 2025*
