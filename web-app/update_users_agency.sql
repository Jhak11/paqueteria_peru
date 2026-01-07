-- 1. Agregar columna id_agencia_trabajo
ALTER TABLE usuarios
ADD COLUMN id_agencia_trabajo INT NULL AFTER id_ubigeo,
ADD CONSTRAINT fk_usuario_agencia 
    FOREIGN KEY (id_agencia_trabajo) REFERENCES agencias(id_agencia);

-- 2. Asignar Agencia 1 (Sede Central) a los empleados existentes (Admin, Counter, Choferes)
-- Asumimos que los usuarios con roles de empleado tienen IDs específicos o ajustamos todos los que no son clientes ruc/dni 'externos'
-- Por seguridad y simplicidad en este entorno dev, asignamos Sede 1 a todos los usuarios que NO sean clientes puros (si existiera distinción clara)
-- O mejor, asignamos Sede 1 a los usuarios conocidos del seed data (id 1, 2, 3...)

UPDATE usuarios SET id_agencia_trabajo = 1 WHERE id_usuario IN (1, 2, 3); 
-- Ajustar según seed data: Admin, Juan Perez (Counter), Chofer

-- Verificar
SELECT id_usuario, nombres, id_agencia_trabajo FROM usuarios;
