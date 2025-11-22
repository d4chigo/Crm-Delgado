-- Rename contactoId to leadId (treating old contacts as leads for now)
ALTER TABLE `cotizaciones` CHANGE COLUMN `contactoId` `leadId` VARCHAR(191) NULL;

-- Add clienteId column as NULL
ALTER TABLE `cotizaciones` ADD COLUMN `clienteId` VARCHAR(191) NULL;

-- Add foreign key for leadId
ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign key for clienteId
ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indices
CREATE INDEX `cotizaciones_leadId_idx` ON `cotizaciones`(`leadId`);
CREATE INDEX `cotizaciones_clienteId_idx` ON `cotizaciones`(`clienteId`);
