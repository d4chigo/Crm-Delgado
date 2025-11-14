-- Migración: Convertir todos los CONTACTO a LEAD
-- Descripción: Elimina el tipo CONTACTO y convierte todos los contactos existentes a LEAD

-- Actualizar todos los contactos de tipo CONTACTO a LEAD
UPDATE `contactos` 
SET `tipo` = 'LEAD'
WHERE `tipo` = 'CONTACTO';

-- Verificar la conversión
-- SELECT COUNT(*) as total_leads FROM `contactos` WHERE `tipo` = 'LEAD';
-- SELECT COUNT(*) as total_clientes FROM `contactos` WHERE `tipo` = 'CLIENTE';
