# Base de Datos – Sistema de Paquetería Perú

## 1. Descripción
Este proyecto implementa una base de datos relacional para un sistema de paquetería a nivel nacional.
La base de datos permite gestionar usuarios, agencias, envíos, paquetes, pagos, vehículos y la trazabilidad completa de los envíos.

## 2. Estructura del proyecto
El proyecto está compuesto por los siguientes archivos:

- creacion.sql  
  Crea la base de datos y todas las tablas con sus claves primarias, foráneas e índices.

- carga_de_datos.sql  
  Inserta los datos iniciales del sistema, carga información real de ubigeos desde un archivo CSV
  y genera datos simulados (más de 2000 registros) mediante procedimientos almacenados.

- operaciones.sql  
  Contiene consultas avanzadas y procedimientos que demuestran el uso de los temas vistos en clase,
  como procedimientos almacenados, window functions, transacciones e índices.

- ubigeo.csv  
  Archivo CSV con información real de ubigeos del Perú, utilizado para la carga masiva de datos.

## 3. Orden de ejecución
Para ejecutar correctamente el proyecto, los archivos deben ejecutarse en el siguiente orden:

1. creacion.sql  
2. carga_de_datos.sql  
3. operaciones.sql  

## 4. Datos simulados
El sistema genera más de 2000 registros simulados para usuarios y envíos.
Estos datos permiten probar consultas analíticas, rendimiento e índices sobre grandes volúmenes de información.

## 5. Tecnologías utilizadas
- MySQL 8.x
- SQL estándar
- Carga masiva de datos mediante CSV (LOAD DATA)

## 6. Observaciones
Para la carga del archivo `ubigeo.csv` es necesario que el servidor MySQL tenga habilitada la opción
`local_infile`.
La ruta del archivo CSV puede variar según el equipo donde se ejecute el proyecto.
