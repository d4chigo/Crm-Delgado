-- CreateTable
CREATE TABLE `proyectos` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `imagen` VARCHAR(191) NULL,
    `precio` DECIMAL(12, 2) NULL,
    `ubicacion` VARCHAR(191) NULL,
    `estado` ENUM('DISPONIBLE', 'RESERVADO', 'VENDIDO', 'CONSTRUCCION', 'FINALIZADO') NOT NULL DEFAULT 'DISPONIBLE',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,

    INDEX `proyectos_usuarioId_idx`(`usuarioId`),
    INDEX `proyectos_estado_idx`(`estado`),
    INDEX `proyectos_activo_idx`(`activo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proyecto_etiquetas` (
    `proyectoId` VARCHAR(191) NOT NULL,
    `etiquetaId` VARCHAR(191) NOT NULL,
    `asignadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `proyecto_etiquetas_proyectoId_idx`(`proyectoId`),
    INDEX `proyecto_etiquetas_etiquetaId_idx`(`etiquetaId`),
    PRIMARY KEY (`proyectoId`, `etiquetaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proyecto_clientes` (
    `proyectoId` VARCHAR(191) NOT NULL,
    `clienteId` VARCHAR(191) NOT NULL,
    `asociadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notas` TEXT NULL,

    INDEX `proyecto_clientes_proyectoId_idx`(`proyectoId`),
    INDEX `proyecto_clientes_clienteId_idx`(`clienteId`),
    PRIMARY KEY (`proyectoId`, `clienteId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `proyectos` ADD CONSTRAINT `proyectos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyecto_etiquetas` ADD CONSTRAINT `proyecto_etiquetas_proyectoId_fkey` FOREIGN KEY (`proyectoId`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyecto_etiquetas` ADD CONSTRAINT `proyecto_etiquetas_etiquetaId_fkey` FOREIGN KEY (`etiquetaId`) REFERENCES `etiquetas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyecto_clientes` ADD CONSTRAINT `proyecto_clientes_proyectoId_fkey` FOREIGN KEY (`proyectoId`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyecto_clientes` ADD CONSTRAINT `proyecto_clientes_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `contactos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
