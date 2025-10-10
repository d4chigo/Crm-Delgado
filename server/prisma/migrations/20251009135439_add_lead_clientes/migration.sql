-- CreateTable
CREATE TABLE `lead_clientes` (
    `leadId` VARCHAR(191) NOT NULL,
    `clienteId` VARCHAR(191) NOT NULL,
    `asociadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notas` TEXT NULL,
    `estado` VARCHAR(50) NULL,

    INDEX `lead_clientes_leadId_idx`(`leadId`),
    INDEX `lead_clientes_clienteId_idx`(`clienteId`),
    PRIMARY KEY (`leadId`, `clienteId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lead_clientes` ADD CONSTRAINT `lead_clientes_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `contactos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_clientes` ADD CONSTRAINT `lead_clientes_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `contactos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
