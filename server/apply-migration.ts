import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('Ejecutando: ALTER TABLE cotizaciones MODIFY clienteId NULL');
    await prisma.$executeRawUnsafe('ALTER TABLE `cotizaciones` MODIFY `clienteId` VARCHAR(191) NULL');

    console.log('Ejecutando: ALTER TABLE cotizaciones ADD COLUMN leadId NULL');
    await prisma.$executeRawUnsafe('ALTER TABLE `cotizaciones` ADD COLUMN `leadId` VARCHAR(191) NULL');

    console.log('Ejecutando: ALTER TABLE cotizaciones ADD FOREIGN KEY leadId');
    try {
      await prisma.$executeRawUnsafe(
        'ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE'
      );
    } catch (e) {
      console.log('FK quizás ya existe:', e.message);
    }

    console.log('Ejecutando: CREATE INDEX cotizaciones_leadId_idx');
    try {
      await prisma.$executeRawUnsafe('CREATE INDEX `cotizaciones_leadId_idx` ON `cotizaciones`(`leadId`)');
    } catch (e) {
      console.log('Índice quizás ya existe:', e.message);
    }

    console.log('✅ Migración completada');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
