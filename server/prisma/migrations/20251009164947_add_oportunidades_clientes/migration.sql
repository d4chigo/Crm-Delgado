-- CreateEnum: Etapas del Pipeline
CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
    `id` VARCHAR(36) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: Oportunidades de Clientes
CREATE TABLE `oportunidades_clientes` (
    `id` VARCHAR(191) NOT NULL,
    `clienteId` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `proyecto` VARCHAR(191) NULL,
    `propiedad` VARCHAR(191) NULL,
    `etapa` ENUM('LEAD', 'CONTACTO', 'VISITA', 'NEGOCIACION', 'CIERRE', 'GANADO', 'PERDIDO') NOT NULL DEFAULT 'LEAD',
    `valor` DECIMAL(12, 2) NULL,
    `probabilidad` INTEGER NULL DEFAULT 25,
    `proximaAccion` TEXT NULL,
    `ultimaActividad` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notas` TEXT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,

    INDEX `oportunidades_clientes_clienteId_idx`(`clienteId`),
    INDEX `oportunidades_clientes_usuarioId_idx`(`usuarioId`),
    INDEX `oportunidades_clientes_etapa_idx`(`etapa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `oportunidades_clientes` ADD CONSTRAINT `oportunidades_clientes_clienteId_fkey` 
FOREIGN KEY (`clienteId`) REFERENCES `contactos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oportunidades_clientes` ADD CONSTRAINT `oportunidades_clientes_usuarioId_fkey` 
FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
