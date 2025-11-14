-- Establecer estado por defecto para leads existentes sin estado
UPDATE `contactos`
SET `estadoLead` = 'NUEVO'
WHERE `estadoLead` IS NULL AND `tipo` = 'LEAD';

-- Crear índice para búsquedas rápidas por estado
CREATE INDEX `idx_estadoLead_tipo` ON `contactos`(`estadoLead`, `tipo`);
