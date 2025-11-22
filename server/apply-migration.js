const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'crm_user',
  password: 'crm_pass_dev_2025',
  database: 'crm_delgado',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function runMigration() {
  const connection = await pool.getConnection();
  try {
    // Alternar tabla cotizaciones para agregar leadId
    console.log('Ejecutando: ALTER TABLE cotizaciones MODIFY clienteId VARCHAR(191) NULL');
    await connection.query('ALTER TABLE `cotizaciones` MODIFY `clienteId` VARCHAR(191) NULL');

    console.log('Ejecutando: ALTER TABLE cotizaciones ADD COLUMN leadId VARCHAR(191) NULL');
    await connection.query('ALTER TABLE `cotizaciones` ADD COLUMN `leadId` VARCHAR(191) NULL');

    console.log('Ejecutando: ALTER TABLE cotizaciones ADD FOREIGN KEY (leadId)');
    // Primero verificar si ya existe
    const result = await connection.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_NAME = 'cotizaciones' AND COLUMN_NAME = 'leadId' AND REFERENCED_TABLE_NAME IS NOT NULL`
    );
    
    if (result[0].length === 0) {
      await connection.query(
        'ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE'
      );
    }

    console.log('Ejecutando: CREATE INDEX cotizaciones_leadId_idx');
    const indexResult = await connection.query(
      `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
       WHERE TABLE_NAME = 'cotizaciones' AND COLUMN_NAME = 'leadId' AND INDEX_NAME = 'cotizaciones_leadId_idx'`
    );

    if (indexResult[0].length === 0) {
      await connection.query('CREATE INDEX `cotizaciones_leadId_idx` ON `cotizaciones`(`leadId`)');
    }

    console.log('✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
  } finally {
    await connection.release();
    await pool.end();
  }
}

runMigration();
