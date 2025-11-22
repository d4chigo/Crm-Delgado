-- AlterTable
ALTER TABLE `cotizaciones` MODIFY `clienteId` VARCHAR(191) NULL,
ADD COLUMN `leadId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- ModifyForeignKey (make clienteId optional in existing FK)
ALTER TABLE `cotizaciones` DROP FOREIGN KEY `cotizaciones_clienteId_fkey`;
ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX `cotizaciones_leadId_idx` ON `cotizaciones`(`leadId`);
