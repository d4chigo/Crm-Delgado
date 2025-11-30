-- AlterTable
ALTER TABLE `alertas_leads` MODIFY `notas` TEXT NULL;

-- AlterTable
ALTER TABLE `historial_etapas_leads` MODIFY `notas` TEXT NULL;

-- AlterTable
ALTER TABLE `notificaciones` MODIFY `descripcion` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `proyectos` MODIFY `descripcion` TEXT NULL;

-- AlterTable
ALTER TABLE `testimonios` MODIFY `testimonio` TEXT NOT NULL;
