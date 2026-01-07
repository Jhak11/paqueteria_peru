-- Script para agregar el campo DNI a direccion_destino_envio
USE paqueteria_peru;

ALTER TABLE direccion_destino_envio 
ADD COLUMN dni VARCHAR(20) AFTER nombre_destinatario;

-- Verificar que se agregó correctamente
DESCRIBE direccion_destino_envio;
