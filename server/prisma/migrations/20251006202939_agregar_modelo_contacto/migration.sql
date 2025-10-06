-- CreateTable
CREATE TABLE `contactos` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `correo` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NULL,
    `ciudad` VARCHAR(191) NULL,
    `dni` VARCHAR(191) NULL,
    `sexo` ENUM('MASCULINO', 'FEMENINO', 'OTRO') NULL,
    `fechaNacimiento` DATETIME(3) NULL,
    `tipo` ENUM('CONTACTO', 'LEAD', 'CLIENTE') NOT NULL DEFAULT 'CONTACTO',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `contactos_correo_key`(`correo`),
    UNIQUE INDEX `contactos_dni_key`(`dni`),
    INDEX `contactos_usuarioId_idx`(`usuarioId`),
    INDEX `contactos_tipo_idx`(`tipo`),
    INDEX `contactos_correo_idx`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contactos` ADD CONSTRAINT `contactos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
