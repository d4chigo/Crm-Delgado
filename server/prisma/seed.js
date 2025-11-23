const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // Verificar si ya existe un usuario admin
    const adminExistente = await prisma.usuario.findFirst({
      where: { rol: 'ADMIN' }
    });

    if (!adminExistente) {
      // Crear usuario administrador solo si no existe
      const passwordHasheada = await bcrypt.hash('admin123', 10);

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
    } else {
      console.log('ℹ️  Ya existe un usuario administrador');
    }

    // Crear etiquetas predefinidas para programas inmobiliarios
    const etiquetasExistentes = await prisma.etiqueta.count();
    
    if (etiquetasExistentes === 0) {
      const etiquetas = await prisma.etiqueta.createMany({
        data: [
          {
            nombre: 'Techo Propio',
            color: '#10B981',
            descripcion: 'Programa Techo Propio del Estado',
            icono: '🏠',
            orden: 1
          },
          {
            nombre: 'Crédito Mi Vivienda',
            color: '#3B82F6',
            descripcion: 'Crédito Mi Vivienda - Fondo MiVivienda',
            icono: '🏡',
            orden: 2
          },
          {
            nombre: 'Compra',
            color: '#8B5CF6',
            descripcion: 'Interesado en comprar propiedad',
            icono: '🛒',
            orden: 3
          },
          {
            nombre: 'Venta',
            color: '#F59E0B',
            descripcion: 'Interesado en vender propiedad',
            icono: '💰',
            orden: 4
          },
          {
            nombre: 'Alquiler',
            color: '#06B6D4',
            descripcion: 'Interesado en alquilar',
            icono: '🔑',
            orden: 5
          }
        ]
      });

      console.log(`✅ ${etiquetas.count} etiquetas predefinidas creadas`);
    } else {
      console.log('ℹ️  Ya existen etiquetas en la base de datos');
      
      // Verificar si la etiqueta "Habilitaciones" existe
      const habilitacionesExiste = await prisma.etiqueta.findFirst({
        where: { nombre: 'Habilitaciones' }
      });
      
      if (!habilitacionesExiste) {
        await prisma.etiqueta.create({
          data: {
            nombre: 'Habilitaciones',
            color: '#F97316',
            descripcion: 'Proyectos de habilitaciones urbanas',
            icono: '🏗️',
            orden: 11
          }
        });
        console.log('✅ Etiqueta "Habilitaciones" creada exitosamente');
      } else {
        console.log('ℹ️  La etiqueta "Habilitaciones" ya existe');
      }
    }

    console.log('\n✨ Seed completado exitosamente');

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
