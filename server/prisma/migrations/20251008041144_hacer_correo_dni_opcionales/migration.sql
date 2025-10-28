-- DropIndex
DROP INDEX `contactos_correo_key` ON `contactos`;

-- DropIndex
DROP INDEX `contactos_dni_key` ON `contactos`;

-- AlterTable
ALTER TABLE `contactos` MODIFY `apellido` VARCHAR(191) NULL,
    MODIFY `correo` VARCHAR(191) NULL;
