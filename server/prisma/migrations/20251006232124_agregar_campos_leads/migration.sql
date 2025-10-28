-- AlterTable
ALTER TABLE `contactos` ADD COLUMN `cargo` VARCHAR(191) NULL,
    ADD COLUMN `departamento` VARCHAR(191) NULL,
    ADD COLUMN `distrito` VARCHAR(191) NULL,
    ADD COLUMN `empresa` VARCHAR(191) NULL,
    ADD COLUMN `estadoLead` ENUM('NUEVO', 'CONTACTADO', 'CALIFICADO', 'NEGOCIACION', 'PROPUESTA', 'GANADO', 'PERDIDO', 'EN_ESPERA') NULL,
    ADD COLUMN `fechaConversion` DATETIME(3) NULL,
    ADD COLUMN `fechaSeguimiento` DATETIME(3) NULL,
    ADD COLUMN `fuente` VARCHAR(191) NULL,
    ADD COLUMN `intereses` TEXT NULL,
    ADD COLUMN `notas` TEXT NULL,
    ADD COLUMN `presupuesto` DECIMAL(10, 2) NULL,
    ADD COLUMN `prioridad` ENUM('BAJA', 'MEDIA', 'ALTA', 'URGENTE') NOT NULL DEFAULT 'MEDIA',
    ADD COLUMN `probabilidad` INTEGER NULL,
    ADD COLUMN `provincia` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `contactos_estadoLead_idx` ON `contactos`(`estadoLead`);

-- CreateIndex
CREATE INDEX `contactos_prioridad_idx` ON `contactos`(`prioridad`);
