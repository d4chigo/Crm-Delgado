-- CreateTable
CREATE TABLE `etiquetas` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `icono` VARCHAR(191) NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `etiquetas_nombre_key`(`nombre`),
    INDEX `etiquetas_activa_idx`(`activa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contacto_etiquetas` (
    `contactoId` VARCHAR(191) NOT NULL,
    `etiquetaId` VARCHAR(191) NOT NULL,
    `asignadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `contacto_etiquetas_contactoId_idx`(`contactoId`),
    INDEX `contacto_etiquetas_etiquetaId_idx`(`etiquetaId`),
    PRIMARY KEY (`contactoId`, `etiquetaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contacto_etiquetas` ADD CONSTRAINT `contacto_etiquetas_contactoId_fkey` FOREIGN KEY (`contactoId`) REFERENCES `contactos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contacto_etiquetas` ADD CONSTRAINT `contacto_etiquetas_etiquetaId_fkey` FOREIGN KEY (`etiquetaId`) REFERENCES `etiquetas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
