/*
  Warnings:

  - You are about to drop the column `contactoId` on the `cotizaciones` table. All the data in the column will be lost.
  - You are about to alter the column `etapa` on the `oportunidades_clientes` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(9))` to `VarChar(191)`.
  - You are about to drop the `contacto_etiquetas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contactos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lead_clientes` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `clienteId` to the `cotizaciones` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `contacto_etiquetas` DROP FOREIGN KEY `contacto_etiquetas_contactoId_fkey`;

-- DropForeignKey
ALTER TABLE `contacto_etiquetas` DROP FOREIGN KEY `contacto_etiquetas_etiquetaId_fkey`;

-- DropForeignKey
ALTER TABLE `contactos` DROP FOREIGN KEY `contactos_usuarioId_fkey`;

-- DropForeignKey
ALTER TABLE `cotizaciones` DROP FOREIGN KEY `cotizaciones_contactoId_fkey`;

-- DropForeignKey
ALTER TABLE `lead_clientes` DROP FOREIGN KEY `lead_clientes_clienteId_fkey`;

-- DropForeignKey
ALTER TABLE `lead_clientes` DROP FOREIGN KEY `lead_clientes_leadId_fkey`;

-- DropForeignKey
ALTER TABLE `oportunidades_clientes` DROP FOREIGN KEY `oportunidades_clientes_clienteId_fkey`;

-- DropForeignKey
ALTER TABLE `proyecto_clientes` DROP FOREIGN KEY `proyecto_clientes_clienteId_fkey`;

-- DropIndex
DROP INDEX `cotizaciones_contactoId_idx` ON `cotizaciones`;

-- AlterTable
ALTER TABLE `cotizaciones` DROP COLUMN `contactoId`,
    ADD COLUMN `clienteId` VARCHAR(191) NOT NULL,
    MODIFY `descripcion` VARCHAR(191) NULL,
    MODIFY `notas` VARCHAR(191) NULL,
    MODIFY `observaciones` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `historial_pipeline_leads` MODIFY `notas` TEXT NULL;

-- AlterTable
ALTER TABLE `oportunidades_clientes` ADD COLUMN `leadId` VARCHAR(191) NULL,
    MODIFY `clienteId` VARCHAR(191) NULL,
    MODIFY `notas` VARCHAR(191) NULL,
    MODIFY `etapa` VARCHAR(191) NOT NULL DEFAULT 'CONTACTO_INICIAL';

-- AlterTable
ALTER TABLE `otros_servicios` ADD COLUMN `caracteristicas` LONGTEXT NULL,
    ADD COLUMN `imagenes` LONGTEXT NULL,
    MODIFY `descripcion` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `paginas_servicios` MODIFY `descripcion_corta` VARCHAR(191) NULL,
    MODIFY `descripcion_larga` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `proyectos` ADD COLUMN `latitud` DOUBLE NULL,
    ADD COLUMN `longitud` DOUBLE NULL,
    MODIFY `descripcion` TEXT NULL;

-- AlterTable
ALTER TABLE `testimonials` MODIFY `testimonio` TEXT NOT NULL;

-- DropTable
DROP TABLE `contacto_etiquetas`;

-- DropTable
DROP TABLE `contactos`;

-- DropTable
DROP TABLE `lead_clientes`;

-- CreateTable
CREATE TABLE `leads` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NULL,
    `correo` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NULL,
    `ciudad` VARCHAR(191) NULL,
    `dni` VARCHAR(191) NULL,
    `sexo` ENUM('MASCULINO', 'FEMENINO') NULL,
    `fechaNacimiento` DATETIME(3) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `cargo` VARCHAR(191) NULL,
    `departamento` VARCHAR(191) NULL,
    `distrito` VARCHAR(191) NULL,
    `empresa` VARCHAR(191) NULL,
    `estado` ENUM('NUEVO', 'CONTACTADO', 'CALIFICADO', 'NEGOCIACION', 'PROPUESTA', 'GANADO', 'PERDIDO', 'EN_ESPERA') NULL DEFAULT 'NUEVO',
    `fechaSeguimiento` DATETIME(3) NULL,
    `fuente` VARCHAR(191) NULL,
    `etiquetas` VARCHAR(191) NULL,
    `notas` VARCHAR(191) NULL,
    `presupuesto` DOUBLE NULL,
    `prioridad` ENUM('BAJA', 'MEDIA', 'ALTA', 'URGENTE') NOT NULL DEFAULT 'MEDIA',
    `probabilidad` INTEGER NULL,
    `provincia` VARCHAR(191) NULL,

    INDEX `leads_usuarioId_idx`(`usuarioId`),
    INDEX `leads_correo_idx`(`correo`),
    INDEX `leads_creadoEn_idx`(`creadoEn`),
    INDEX `leads_departamento_idx`(`departamento`),
    INDEX `leads_estado_idx`(`estado`),
    INDEX `leads_prioridad_idx`(`prioridad`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientes` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NULL,
    `correo` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NULL,
    `ciudad` VARCHAR(191) NULL,
    `dni` VARCHAR(191) NULL,
    `sexo` ENUM('MASCULINO', 'FEMENINO') NULL,
    `fechaNacimiento` DATETIME(3) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `cargo` VARCHAR(191) NULL,
    `departamento` VARCHAR(191) NULL,
    `distrito` VARCHAR(191) NULL,
    `empresa` VARCHAR(191) NULL,
    `fechaConversion` DATETIME(3) NULL,
    `fechaSeguimiento` DATETIME(3) NULL,
    `notas` VARCHAR(191) NULL,
    `presupuesto` DOUBLE NULL,
    `prioridad` ENUM('BAJA', 'MEDIA', 'ALTA', 'URGENTE') NOT NULL DEFAULT 'MEDIA',
    `probabilidad` INTEGER NULL,
    `provincia` VARCHAR(191) NULL,

    INDEX `clientes_usuarioId_idx`(`usuarioId`),
    INDEX `clientes_correo_idx`(`correo`),
    INDEX `clientes_creadoEn_idx`(`creadoEn`),
    INDEX `clientes_departamento_idx`(`departamento`),
    INDEX `clientes_prioridad_idx`(`prioridad`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_etiquetas` (
    `leadId` VARCHAR(191) NOT NULL,
    `etiquetaId` VARCHAR(191) NOT NULL,
    `asignadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lead_etiquetas_leadId_idx`(`leadId`),
    INDEX `lead_etiquetas_etiquetaId_idx`(`etiquetaId`),
    PRIMARY KEY (`leadId`, `etiquetaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cliente_etiquetas` (
    `clienteId` VARCHAR(191) NOT NULL,
    `etiquetaId` VARCHAR(191) NOT NULL,
    `asignadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cliente_etiquetas_clienteId_idx`(`clienteId`),
    INDEX `cliente_etiquetas_etiquetaId_idx`(`etiquetaId`),
    PRIMARY KEY (`clienteId`, `etiquetaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_cliente_asociaciones` (
    `leadId` VARCHAR(191) NOT NULL,
    `clienteId` VARCHAR(191) NOT NULL,
    `asociadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notas` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NULL,

    INDEX `lead_cliente_asociaciones_leadId_idx`(`leadId`),
    INDEX `lead_cliente_asociaciones_clienteId_idx`(`clienteId`),
    PRIMARY KEY (`leadId`, `clienteId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificaciones` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'INFO',
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `usuarioId` VARCHAR(191) NULL,
    `contactoId` VARCHAR(191) NULL,
    `referencia` VARCHAR(191) NULL,
    `tipoReferencia` VARCHAR(191) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leidaEn` DATETIME(3) NULL,

    INDEX `notificaciones_usuarioId_idx`(`usuarioId`),
    INDEX `notificaciones_contactoId_idx`(`contactoId`),
    INDEX `notificaciones_leida_idx`(`leida`),
    INDEX `notificaciones_creadoEn_idx`(`creadoEn`),
    INDEX `notificaciones_tipoReferencia_idx`(`tipoReferencia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alertas_leads` (
    `id` VARCHAR(191) NOT NULL,
    `leadId` VARCHAR(191) NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `fechaCreada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaLimite` DATETIME(3) NOT NULL,
    `completada` BOOLEAN NOT NULL DEFAULT false,
    `completadaEn` DATETIME(3) NULL,
    `notas` TEXT NULL,

    INDEX `alertas_leads_usuarioId_idx`(`usuarioId`),
    INDEX `alertas_leads_leadId_idx`(`leadId`),
    INDEX `alertas_leads_completada_idx`(`completada`),
    INDEX `alertas_leads_fechaLimite_idx`(`fechaLimite`),
    INDEX `alertas_leads_fechaCreada_idx`(`fechaCreada`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `cotizaciones_clienteId_idx` ON `cotizaciones`(`clienteId`);

-- CreateIndex
CREATE INDEX `historial_pipeline_leads_etapaNueva_idx` ON `historial_pipeline_leads`(`etapaNueva`);

-- CreateIndex
CREATE INDEX `oportunidades_clientes_leadId_idx` ON `oportunidades_clientes`(`leadId`);

-- CreateIndex
CREATE INDEX `oportunidades_clientes_etapa_idx` ON `oportunidades_clientes`(`etapa`);

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clientes` ADD CONSTRAINT `clientes_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_etiquetas` ADD CONSTRAINT `lead_etiquetas_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_etiquetas` ADD CONSTRAINT `lead_etiquetas_etiquetaId_fkey` FOREIGN KEY (`etiquetaId`) REFERENCES `etiquetas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente_etiquetas` ADD CONSTRAINT `cliente_etiquetas_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente_etiquetas` ADD CONSTRAINT `cliente_etiquetas_etiquetaId_fkey` FOREIGN KEY (`etiquetaId`) REFERENCES `etiquetas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_cliente_asociaciones` ADD CONSTRAINT `lead_cliente_asociaciones_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_cliente_asociaciones` ADD CONSTRAINT `lead_cliente_asociaciones_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oportunidades_clientes` ADD CONSTRAINT `oportunidades_clientes_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oportunidades_clientes` ADD CONSTRAINT `oportunidades_clientes_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyecto_clientes` ADD CONSTRAINT `proyecto_clientes_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alertas_leads` ADD CONSTRAINT `alertas_leads_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alertas_leads` ADD CONSTRAINT `alertas_leads_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
