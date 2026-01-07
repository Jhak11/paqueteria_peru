# 📦 Paquetería Perú - Sistema Integral de Gestión Logística

![Estado del Proyecto](https://img.shields.io/badge/Estado-En_Desarrollo-green?style=for-the-badge)
![Versión](https://img.shields.io/badge/Versión-1.0.0-blue?style=for-the-badge)
![Licencia](https://img.shields.io/badge/Licencia-MIT-orange?style=for-the-badge)

## 📑 Resumen Ejecutivo

**Paquetería Perú** es un sistema integral de gestión de envíos a nivel nacional que permite administrar todo el ciclo de vida de los paquetes, desde su registro hasta su entrega final. El proyecto combina una base de datos relacional robusta con una aplicación web moderna construida con **Next.js 14**, ofreciendo portales especializados para diferentes tipos de usuarios: administradores, clientes, empleados y conductores.

### 🚀 Características Principales
*   🔐 **Seguridad RBAC**: Sistema de autenticación y autorización basado en roles.
*   📦 **Gestión de Envíos**: Control total con código de seguimiento único.
*   �️ **Rastreo en Tiempo Real**: Historial detallado de movimientos.
*   🏢 **Infraestructura**: Gestión de agencias, rutas y vehículos.
*   💰 **Finanzas**: Sistema de cotización dinámico y facturación.
*   � **Clientes B2B/B2C**: Gestión de empresas y usuarios particulares.

---

## 🏗️ Arquitectura del Sistema

### Estructura del Proyecto
```bash
paqueteria_peru/
├── paqueteria_peru_bd/          # 🗄️ Scripts y Datos de Base de Datos
│   ├── creacion.sql             # Esquema DDL
│   ├── carga_de_datos.sql       # Datos semilla
│   ├── operaciones.sql          # Stored Procedures
│   └── ubigeo.csv               # Datos geográficos (INEI)
│
└── web-app/                     # 💻 Aplicación Web Next.js
    ├── app/                     # App Router
    │   ├── (public)/            # Landing y Tracking
    │   ├── (admin)/             # Portal Administrativo
    │   ├── (client)/            # Portal de Clientes
    │   ├── (conductor)/         # Portal de Conductores
    │   ├── (counter)/           # Portal de Ventanilla
    │   └── api/                 # Endpoints Backend
    └── lib/                     # Utilidades y configuración DB
```

### 🛠️ Stack Tecnológico

| Frontend | Backend | DevOps |
|----------|---------|--------|
| ![Next.js](https://img.shields.io/badge/Next.js-14-black) | ![Node.js](https://img.shields.io/badge/Node.js-20-green) | ![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=white) |
| ![React](https://img.shields.io/badge/React-18-blue) | ![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1) | ![NPM](https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=white) |
| ![Tailwind](https://img.shields.io/badge/Tailwind-3.3-38B2AC) | ![JWT](https://img.shields.io/badge/JWT-Auth-000000) | |

---

## 🗄️ Modelo de Base de Datos

El sistema utiliza un esquema relacional normalizado con **18 tablas** organizadas en **9 módulos funcionales**.

### 1. Módulo de Seguridad y Accesos 🛡️
| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Perfil de identidad (DNI, nombre, dirección). |
| `credenciales` | Accesos (correo, hash contraseña). |
| `roles` | Catálogo: Admin, Cliente, Empleado, Conductor. |
| `usuario_roles` | Asignación de permisos (N:M). |

### 2. Módulo Geográfico 🗺️
| Tabla | Descripción |
|-------|-------------|
| `ubigeo` | Catálogo oficial INEI de departamentos, provincias y distritos (1,874 registros). |

### 3. Módulo de Infraestructura 🏢
| Tabla | Descripción |
|-------|-------------|
| `agencias` | Sedes operativas (Origen, Destino, Mixta). |
| `vehiculos` | Flota de transporte (Motos, Furgonetas, Camiones). |
| `rutas` | Conexiones logísticas entre agencias. |

### 4. Módulo de Clientes 🤝
| Tabla | Descripción |
|-------|-------------|
| `empresas_cliente` | Clientes corporativos B2B con línea de crédito. |
| `empresa_contactos` | Representantes autorizados de empresas. |

### 5. Módulo de Envíos 📦
| Tabla | Descripción |
|-------|-------------|
| `envios` | Tabla principal de operaciones. |
| `paquetes` | Detalles físicos (peso, dimensiones, contenido). |
| `estados_envio` | Flujo: Registrado → En Ruta → Entregado. |
| `seguimiento_envio` | Bitácora de trazabilidad (Tracking). |
| `direccion_destino` | Datos detallados de entrega. |

### 6. Módulo Financiero y Otros 💰
*   **Finanzas**: `pagos`, `facturas`.
*   **Logística**: `envio_viaje` (Asignación a rutas), `viajes`.
*   **Auditoría**: `log_acciones` (Historial de seguridad).

---

## � Aplicación Web

### Portales Disponibles

#### 🌍 Página Pública & Tracking
*   **Rastreo**: Búsqueda inmediata por código de envío.
*   **UI/UX**: Diseño responsive y moderno.
*   **Timeline**: Visualización gráfica del estado del paquete.

#### 👨‍💼 Portal Administrativo (`/admin`)
Control total del sistema:
*   Dashboard de métricas.
*   Gestión CRUD de agencias, usuarios y vehículos.
*   Supervisión de envíos y auditoría.

#### 🏪 Portal de Mostrador (`/counter`)
Optimizado para rapidez en agencia:
*   **Cotizador Rápido**: Cálculo automático de tarifas.
*   **Registro Express**: Alta de envíos y clientes en segundos.
*   **Etiquetado**: Generación de guías de remisión.

#### 👤 Portal de Cliente (`/cliente`)
*   Historial de envíos realizados.
*   Agenda de direcciones frecuentes.
*   Facturación y pagos.

#### 🚚 Portal de Conductor (`/conductor`)
*   Hoja de ruta digital.
*   Actualización de estados en tiempo real (móvil).
*   Confirmación de entregas.

---

## � APIs del Sistema

La aplicación expone una API RESTful para la integración de servicios:

*   **Autenticación**:
    *   `POST /api/auth/login`: Validación y emisión de JWT.
    *   `POST /api/auth/register`: Registro de nuevos usuarios.
*   **Tracking**:
    *   `GET /api/tracking/[codigo]`: Consulta pública de estado.
*   **Cotización**:
    *   `POST /api/cotizacion`: Motor de cálculo de tarifas basado en peso y ruta.
*   **Operaciones**:
    *   Endpoints para gestión de clientes, ubigeos y manifiestos.

---

## 🚀 Instalación y Despliegue

1.  **Clonar repositorio**:
    ```bash
    git clone https://github.com/Jhak11/paqueteria_peru.git
    cd paqueteria_peru
    ```

2.  **Base de Datos**:
    *   Ejecutar scripts en orden:
        1.  `creacion.sql`
        2.  `carga_catos.sql` (o `carga_datos_fixed.sql`)
        3.  `operaciones.sql`

3.  **Variables de Entorno**:
    Crear archivo `.env` en `web-app/`:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=paqueteria_peru
    ```

4.  **Iniciar Aplicación**:
    ```bash
    cd web-app
    npm install
    npm run dev
    ```

---
*Generado automáticamente basado en la documentación del proyecto.*
