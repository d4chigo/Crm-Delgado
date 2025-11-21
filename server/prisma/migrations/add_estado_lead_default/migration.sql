-- Establecer estado por defecto para leads existentes sin estado
UPDATE `leads`
SET `estado` = 'NUEVO'
WHERE `estado` IS NULL;

-- Crear índice para búsquedas rápidas por estado
CREATE INDEX `idx_estado_leads` ON `leads`(`estado`);
