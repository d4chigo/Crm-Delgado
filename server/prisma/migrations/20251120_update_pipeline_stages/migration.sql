-- AlterEnum - Update EtapaPipeline values
-- First, we need to change the column to VARCHAR temporarily to handle the transition
ALTER TABLE `oportunidades_clientes` MODIFY `etapa` VARCHAR(191) NOT NULL;

-- Update existing values to new ones (mapping old to new)
UPDATE `oportunidades_clientes` SET `etapa` = 'CONTACTO_INICIAL' WHERE `etapa` IN ('LEAD', 'CONTACTO');
UPDATE `oportunidades_clientes` SET `etapa` = 'AGENDAMIENTO' WHERE `etapa` = 'VISITA';
UPDATE `oportunidades_clientes` SET `etapa` = 'SEPARACION' WHERE `etapa` = 'NEGOCIACION';
UPDATE `oportunidades_clientes` SET `etapa` = 'CIERRE_GANADO' WHERE `etapa` = 'GANADO';
UPDATE `oportunidades_clientes` SET `etapa` = 'CIERRE_PERDIDO' WHERE `etapa` = 'PERDIDO';

-- Handle CIERRE - map to CIERRE_GANADO by default (can be adjusted)
UPDATE `oportunidades_clientes` SET `etapa` = 'CIERRE_GANADO' WHERE `etapa` = 'CIERRE';

-- Now verify no unknown values exist
UPDATE `oportunidades_clientes` SET `etapa` = 'CONTACTO_INICIAL' WHERE `etapa` NOT IN ('CONTACTO_INICIAL', 'AGENDAMIENTO', 'SEPARACION', 'CIERRE_GANADO', 'CIERRE_PERDIDO', 'FIDELIZACION');

-- Update historial_pipeline_leads table if it exists
ALTER TABLE `historial_pipeline_leads` MODIFY `etapaAnterior` VARCHAR(191) NOT NULL;
ALTER TABLE `historial_pipeline_leads` MODIFY `etapaNueva` VARCHAR(191) NOT NULL;

UPDATE `historial_pipeline_leads` SET `etapaAnterior` = 'CONTACTO_INICIAL' WHERE `etapaAnterior` IN ('LEAD', 'CONTACTO');
UPDATE `historial_pipeline_leads` SET `etapaNueva` = 'CONTACTO_INICIAL' WHERE `etapaNueva` IN ('LEAD', 'CONTACTO');
UPDATE `historial_pipeline_leads` SET `etapaAnterior` = 'AGENDAMIENTO' WHERE `etapaAnterior` = 'VISITA';
UPDATE `historial_pipeline_leads` SET `etapaNueva` = 'AGENDAMIENTO' WHERE `etapaNueva` = 'VISITA';
UPDATE `historial_pipeline_leads` SET `etapaAnterior` = 'SEPARACION' WHERE `etapaAnterior` = 'NEGOCIACION';
UPDATE `historial_pipeline_leads` SET `etapaNueva` = 'SEPARACION' WHERE `etapaNueva` = 'NEGOCIACION';
UPDATE `historial_pipeline_leads` SET `etapaAnterior` = 'CIERRE_GANADO' WHERE `etapaAnterior` IN ('CIERRE', 'GANADO');
UPDATE `historial_pipeline_leads` SET `etapaNueva` = 'CIERRE_GANADO' WHERE `etapaNueva` IN ('CIERRE', 'GANADO');
UPDATE `historial_pipeline_leads` SET `etapaAnterior` = 'CIERRE_PERDIDO' WHERE `etapaAnterior` = 'PERDIDO';
UPDATE `historial_pipeline_leads` SET `etapaNueva` = 'CIERRE_PERDIDO' WHERE `etapaNueva` = 'PERDIDO';
