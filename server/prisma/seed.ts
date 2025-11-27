import prisma from '../src/config/database';
import { hashearPassword } from '../src/utils/password.util';

async function seed() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // Verificar si ya existe un usuario admin
    const adminExistente = await prisma.usuario.findFirst({
      where: { rol: 'ADMIN' }
    });

    if (!adminExistente) {
      // Crear usuario administrador solo si no existe
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
            color: '#10B981', // Verde
            descripcion: 'Programa Techo Propio del Estado',
            icono: '🏠',
            orden: 1
          },
          {
            nombre: 'Crédito Mi Vivienda',
            color: '#3B82F6', // Azul
            descripcion: 'Crédito Mi Vivienda - Fondo MiVivienda',
            icono: '🏡',
            orden: 2
          },
          {
            nombre: 'Compra',
            color: '#8B5CF6', // Púrpura
            descripcion: 'Interesado en comprar propiedad',
            icono: '🛒',
            orden: 3
          },
          {
            nombre: 'Venta',
            color: '#F59E0B', // Naranja
            descripcion: 'Interesado en vender propiedad',
            icono: '💰',
            orden: 4
          },
          {
            nombre: 'Alquiler',
            color: '#06B6D4', // Cyan
            descripcion: 'Interesado en alquilar',
            icono: '🔑',
            orden: 5
          },
          {
            nombre: 'Inversión',
            color: '#EC4899', // Rosa
            descripcion: 'Inversionista inmobiliario',
            icono: '📈',
            orden: 6
          },
          {
            nombre: 'Crédito Hipotecario',
            color: '#6366F1', // Índigo
            descripcion: 'Crédito hipotecario bancario',
            icono: '🏦',
            orden: 7
          },
          {
            nombre: 'Primera Vivienda',
            color: '#14B8A6', // Teal
            descripcion: 'Primera vez comprando vivienda',
            icono: '🎉',
            orden: 8
          },
          {
            nombre: 'Nuevo',
            color: '#84CC16', // Lima
            descripcion: 'Propiedad nueva',
            icono: '✨',
            orden: 9
          },
          {
            nombre: 'Usado',
            color: '#64748B', // Slate
            descripcion: 'Propiedad usada/segunda mano',
            icono: '🏘️',
            orden: 10
          },
          {
            nombre: 'Habilitaciones',
            color: '#F97316', // Naranja oscuro
            descripcion: 'Proyectos de habilitaciones urbanas',
            icono: '🏗️',
            orden: 11
          },
          {
            nombre: 'Construcción',
            color: '#DC2626', // Rojo
            descripcion: 'Proyecto en fase de construcción',
            icono: '🏢',
            orden: 12
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
            color: '#F97316', // Naranja oscuro
            descripcion: 'Proyectos de habilitaciones urbanas',
            icono: '🏗️',
            orden: 11
          }
        });
        console.log('✅ Etiqueta "Habilitaciones" creada exitosamente');
      } else {
        console.log('ℹ️  La etiqueta "Habilitaciones" ya existe');
      }

      // Verificar si la etiqueta "Construcción" existe
      const construccionExiste = await prisma.etiqueta.findFirst({
        where: { nombre: 'Construcción' }
      });
      
      if (!construccionExiste) {
        await prisma.etiqueta.create({
          data: {
            nombre: 'Construcción',
            color: '#DC2626', // Rojo
            descripcion: 'Proyecto en fase de construcción',
            icono: '🏢',
            orden: 12
          }
        });
        console.log('✅ Etiqueta "Construcción" creada exitosamente');
      } else {
        console.log('ℹ️  La etiqueta "Construcción" ya existe');
      }
    }



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
