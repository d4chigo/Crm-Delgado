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
    }

    // --------------------------------------------------
    // Datos DEMO para pruebas en Reportes (eliminables)
    // --------------------------------------------------
    const admin = await prisma.usuario.findFirst({ where: { rol: 'ADMIN' } });
    if (admin) {
      // Evitar duplicados si ya existen contactos DEMO
      const existentes = await prisma.contacto.count({ where: { nombre: { contains: 'DEMO_' } } });
      if (existentes === 0) {
        const ahora = new Date();
        const clientesDemo = [];

        // Crear 5 contactos DEMO con diferentes fuentes/departamentos
        const contactosPayload = [
          { nombre: 'DEMO_Claudia', apellido: 'Rojas', tipo: 'LEAD', fuente: 'Facebook', departamento: 'Lima', correo: 'claudia.demo@demo.com', telefono: '999111222', usuarioId: admin.id, creadoEn: ahora },
          { nombre: 'DEMO_Carlos', apellido: 'Vega', tipo: 'LEAD', fuente: 'Instagram', departamento: 'Arequipa', correo: 'carlos.demo@demo.com', telefono: '999222333', usuarioId: admin.id, creadoEn: ahora },
          { nombre: 'DEMO_Maria', apellido: 'Lopez', tipo: 'CLIENTE', fuente: 'Referido', departamento: 'Cusco', correo: 'maria.demo@demo.com', telefono: '999333444', usuarioId: admin.id, creadoEn: ahora },
          { nombre: 'DEMO_Juan', apellido: 'Perez', tipo: 'LEAD', fuente: 'Google Ads', departamento: 'La Libertad', correo: 'juan.demo@demo.com', telefono: '999444555', usuarioId: admin.id, creadoEn: ahora },
          { nombre: 'DEMO_Ana', apellido: 'Salas', tipo: 'CLIENTE', fuente: 'Web', departamento: 'Piura', correo: 'ana.demo@demo.com', telefono: '999555666', usuarioId: admin.id, creadoEn: ahora },
        ];

        for (const c of contactosPayload) {
          // Asignar fechaNacimiento (entre 25 y 55 años) para gráficos de edades
          const yearsAgo = 25 + Math.floor(Math.random() * 30);
          const fn = new Date();
          fn.setFullYear(fn.getFullYear() - yearsAgo);
          const creado = await prisma.contacto.create({ data: { ...c, fechaNacimiento: fn } });
          clientesDemo.push(creado);
        }

        // Crear oportunidades para algunos contactos DEMO
        const etapas = ['LEAD', 'CONTACTO', 'NEGOCIACION', 'CIERRE'];
        const valores = [15000, 30000, 45000, 60000];
        const probas = [10, 25, 50, 75];

        for (let i = 0; i < clientesDemo.length; i++) {
          const cliente = clientesDemo[i];
          // 3 oportunidades DEMO (incluimos una GANADO para métricas/conversión)
          if (i < 3) {
            await prisma.oportunidadCliente.create({
              data: {
                clienteId: cliente.id,
                usuarioId: admin.id,
                titulo: `DEMO_Oportunidad_${i + 1}`,
                proyecto: i % 2 === 0 ? 'Proyecto DEMO A' : 'Proyecto DEMO B',
                propiedad: `Unidad DEMO ${100 + i}`,
                etapa: i === 0 ? 'GANADO' : etapas[i % etapas.length],
                valor: valores[i % valores.length],
                probabilidad: probas[i % probas.length],
                proximaAccion: 'Llamar al cliente (DEMO)',
                notas: 'Registro de prueba DEMO para reportes',
              },
            });
          }
        }

        console.log(`✅ Contactos DEMO creados: ${clientesDemo.length}`);
      } else {
        console.log('ℹ️  Datos DEMO ya existen, actualizando para asegurar edades y GANADO...');
        const demoContactos = await prisma.contacto.findMany({
          where: { nombre: { contains: 'DEMO_' } },
          take: 5,
          orderBy: { creadoEn: 'asc' },
        });
        for (let i = 0; i < demoContactos.length; i++) {
          const c = demoContactos[i];
          // Asegurar fechaNacimiento
          if (!c.fechaNacimiento) {
            const yearsAgo = 25 + Math.floor(Math.random() * 30);
            const fn = new Date();
            fn.setFullYear(fn.getFullYear() - yearsAgo);
            await prisma.contacto.update({ where: { id: c.id }, data: { fechaNacimiento: fn } });
          }
          // Asegurar al menos una oportunidad GANADO en los primeros 2 contactos
          if (i < 2) {
            const yaGanado = await prisma.oportunidadCliente.count({ where: { clienteId: c.id, etapa: 'GANADO' } });
            if (yaGanado === 0) {
              await prisma.oportunidadCliente.create({
                data: {
                  clienteId: c.id,
                  usuarioId: admin.id,
                  titulo: `DEMO_Oportunidad_GANADO_${i + 1}`,
                  proyecto: i % 2 === 0 ? 'Proyecto DEMO A' : 'Proyecto DEMO B',
                  propiedad: `Unidad DEMO ${200 + i}`,
                  etapa: 'GANADO',
                  valor: 25000 + i * 5000,
                  probabilidad: 100,
                  notas: 'Registro GANADO demo para reportes',
                },
              });
            }
          }
        }
        console.log('✅ DEMO actualizado: edades y oportunidades GANADO listas');
      }
    } else {
      console.log('⚠️  No se encontró usuario ADMIN. Se omite creación de DEMO.');
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
