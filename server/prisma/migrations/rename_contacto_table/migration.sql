-- Migración: Renombrar tabla Contacto a Lead (conceptualmente)
-- Nota: En la BD seguirá siendo `contactos` pero solo contendrá LEAD y CLIENTE

-- Asegurar que no hay registros de tipo CONTACTO
UPDATE `contactos` 
SET `tipo` = 'LEAD'
WHERE `tipo` = 'CONTACTO';

-- Verificar que todos los registros son LEAD o CLIENTE
-- SELECT DISTINCT `tipo` FROM `contactos`;
