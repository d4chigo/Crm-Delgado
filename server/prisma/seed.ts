import prisma from '../src/config/database';
import { hashearPassword } from '../src/utils/password.util';

async function seed() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // Verificar si ya existe un usuario admin
    const adminExistente = await prisma.usuario.findFirst({
      where: { rol: 'ADMIN' }
    });

    if (adminExistente) {
      console.log('ℹ️  Ya existe un usuario administrador');
      return;
    }

    // Crear usuario administrador
    const passwordHasheada = await hashearPassword('admin123');

    const admin = await prisma.usuario.create({
      data: {
        nombre: 'Administrador',
        email: 'admin@crm-delgado.com',
        password: passwordHasheada,
        rol: 'ADMIN',
        telefono: '1234567890'
      }
    });

    console.log('✅ Usuario administrador creado exitosamente');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: admin123');
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');

  } catch (error) {
    console.error('❌ Error al ejecutar seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
