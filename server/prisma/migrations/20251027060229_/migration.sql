/*
  Warnings:

  - The values [OTRO] on the enum `contactos_sexo` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `contactos` MODIFY `sexo` ENUM('MASCULINO', 'FEMENINO') NULL;

-- CreateTable
CREATE TABLE `cotizaciones` (
    `id` VARCHAR(191) NOT NULL,
    `contactoId` VARCHAR(191) NOT NULL,
    `numeroReferencia` VARCHAR(191) NOT NULL,
    `nombreProyecto` VARCHAR(191) NOT NULL,
    `tipoInmueble` VARCHAR(191) NULL,
    `descripcion` TEXT NULL,
    `precioInmueble` DECIMAL(12, 2) NOT NULL,
    `cuotaInicial` DECIMAL(12, 2) NOT NULL,
    `porcentajeCuotaInicial` DECIMAL(5, 2) NOT NULL,
    `montoFinanciar` DECIMAL(12, 2) NOT NULL,
    `plazoMeses` INTEGER NOT NULL,
    `tipoCuota` ENUM('FIJA', 'FLEXIBLE', 'FLEXIBLE_ESPECIAL') NOT NULL DEFAULT 'FIJA',
    `tasaInteresAnual` DECIMAL(5, 2) NOT NULL,
    `permitePostergar` BOOLEAN NOT NULL DEFAULT false,
    `cuotasPostergables` INTEGER NULL,
    `permiteDoble` BOOLEAN NOT NULL DEFAULT false,
    `cuotasDoblesAnuales` INTEGER NULL,
    `permiteCambioFecha` BOOLEAN NOT NULL DEFAULT false,
    `montoCuotaManual` DECIMAL(12, 2) NULL,
    `cuotaMensualEstimada` DECIMAL(12, 2) NOT NULL,
    `totalIntereses` DECIMAL(12, 2) NOT NULL,
    `totalPagar` DECIMAL(12, 2) NOT NULL,
    `estado` ENUM('BORRADOR', 'ENVIADA', 'ACEPTADA', 'RECHAZADA', 'VENCIDA') NOT NULL DEFAULT 'BORRADOR',
    `notas` TEXT NULL,
    `observaciones` TEXT NULL,
    `fechaValidez` DATETIME(3) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cotizaciones_numeroReferencia_key`(`numeroReferencia`),
    INDEX `cotizaciones_contactoId_idx`(`contactoId`),
    INDEX `cotizaciones_estado_idx`(`estado`),
    INDEX `cotizaciones_tipoCuota_idx`(`tipoCuota`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reportes` (
    `id` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `parametros` JSON NULL,
    `resultadosResumen` JSON NULL,
    `generadoPor` VARCHAR(191) NULL,
    `generadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `reportes_generadoPor_idx`(`generadoPor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_contactoId_fkey` FOREIGN KEY (`contactoId`) REFERENCES `contactos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reportes` ADD CONSTRAINT `reportes_generadoPor_fkey` FOREIGN KEY (`generadoPor`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
