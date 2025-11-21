-- UpdateEnum - Replace EtapaPipeline with new values
-- MySQL doesn't allow direct enum modification, so we:
-- 1. Create a temporary column with the new enum
-- 2. Copy and transform data
-- 3. Drop old column
-- 4. Rename temporary column

-- Add temporary column with new enum
ALTER TABLE `oportunidades_clientes` 
ADD COLUMN `etapa_temp` ENUM('CONTACTO_INICIAL','AGENDAMIENTO','SEPARACION','CIERRE_GANADO','CIERRE_PERDIDO','FIDELIZACION') NOT NULL DEFAULT 'CONTACTO_INICIAL';

-- Map old values to new values
UPDATE `oportunidades_clientes` SET `etapa_temp` = 'CONTACTO_INICIAL' WHERE `etapa` IN ('LEAD', 'CONTACTO');
UPDATE `oportunidades_clientes` SET `etapa_temp` = 'AGENDAMIENTO' WHERE `etapa` = 'VISITA';
UPDATE `oportunidades_clientes` SET `etapa_temp` = 'SEPARACION' WHERE `etapa` = 'NEGOCIACION';
UPDATE `oportunidades_clientes` SET `etapa_temp` = 'CIERRE_GANADO' WHERE `etapa` IN ('GANADO', 'CIERRE');
UPDATE `oportunidades_clientes` SET `etapa_temp` = 'CIERRE_PERDIDO' WHERE `etapa` = 'PERDIDO';
UPDATE `oportunidades_clientes` SET `etapa_temp` = 'CONTACTO_INICIAL' WHERE `etapa_temp` NOT IN ('CONTACTO_INICIAL','AGENDAMIENTO','SEPARACION','CIERRE_GANADO','CIERRE_PERDIDO','FIDELIZACION');

-- Drop old column
ALTER TABLE `oportunidades_clientes` DROP COLUMN `etapa`;

-- Rename temp column to original name
ALTER TABLE `oportunidades_clientes` CHANGE COLUMN `etapa_temp` `etapa` ENUM('CONTACTO_INICIAL','AGENDAMIENTO','SEPARACION','CIERRE_GANADO','CIERRE_PERDIDO','FIDELIZACION') NOT NULL DEFAULT 'CONTACTO_INICIAL';

-- Update historial_pipeline_leads similarly
ALTER TABLE `historial_pipeline_leads` 
ADD COLUMN `etapaAnterior_temp` VARCHAR(191);

ALTER TABLE `historial_pipeline_leads` 
ADD COLUMN `etapaNueva_temp` VARCHAR(191);

-- Map old values in etapaAnterior
UPDATE `historial_pipeline_leads` SET `etapaAnterior_temp` = 'CONTACTO_INICIAL' WHERE `etapaAnterior` IN ('LEAD', 'CONTACTO');
UPDATE `historial_pipeline_leads` SET `etapaAnterior_temp` = 'AGENDAMIENTO' WHERE `etapaAnterior` = 'VISITA';
UPDATE `historial_pipeline_leads` SET `etapaAnterior_temp` = 'SEPARACION' WHERE `etapaAnterior` = 'NEGOCIACION';
UPDATE `historial_pipeline_leads` SET `etapaAnterior_temp` = 'CIERRE_GANADO' WHERE `etapaAnterior` IN ('GANADO', 'CIERRE');
UPDATE `historial_pipeline_leads` SET `etapaAnterior_temp` = 'CIERRE_PERDIDO' WHERE `etapaAnterior` = 'PERDIDO';
UPDATE `historial_pipeline_leads` SET `etapaAnterior_temp` = `etapaAnterior` WHERE `etapaAnterior_temp` IS NULL;

-- Map old values in etapaNueva
UPDATE `historial_pipeline_leads` SET `etapaNueva_temp` = 'CONTACTO_INICIAL' WHERE `etapaNueva` IN ('LEAD', 'CONTACTO');
UPDATE `historial_pipeline_leads` SET `etapaNueva_temp` = 'AGENDAMIENTO' WHERE `etapaNueva` = 'VISITA';
UPDATE `historial_pipeline_leads` SET `etapaNueva_temp` = 'SEPARACION' WHERE `etapaNueva` = 'NEGOCIACION';
UPDATE `historial_pipeline_leads` SET `etapaNueva_temp` = 'CIERRE_GANADO' WHERE `etapaNueva` IN ('GANADO', 'CIERRE');
UPDATE `historial_pipeline_leads` SET `etapaNueva_temp` = 'CIERRE_PERDIDO' WHERE `etapaNueva` = 'PERDIDO';
UPDATE `historial_pipeline_leads` SET `etapaNueva_temp` = `etapaNueva` WHERE `etapaNueva_temp` IS NULL;

-- Drop old columns
ALTER TABLE `historial_pipeline_leads` DROP COLUMN `etapaAnterior`;
ALTER TABLE `historial_pipeline_leads` DROP COLUMN `etapaNueva`;

-- Rename temp columns
ALTER TABLE `historial_pipeline_leads` CHANGE COLUMN `etapaAnterior_temp` `etapaAnterior` VARCHAR(191) NOT NULL;
ALTER TABLE `historial_pipeline_leads` CHANGE COLUMN `etapaNueva_temp` `etapaNueva` VARCHAR(191) NOT NULL;
