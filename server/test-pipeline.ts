import prisma from './src/config/database';

async function main() {
  try {
    // Buscar o crear usuario
    let usuario = await prisma.usuario.findFirst({
      where: { email: 'test@example.com' }
    });
    
    if (!usuario) {
      usuario = await prisma.usuario.create({
        data: {
          nombre: 'Test User',
          email: 'test@example.com',
          password: 'test123',
          rol: 'AGENTE'
        }
      });
      console.log('✅ Usuario creado:', usuario.id);
    } else {
      console.log('✅ Usuario encontrado:', usuario.id);
    }

    // Buscar o crear lead
    let contacto = await prisma.contacto.findFirst({
      where: { correo: 'carlos@example.com' }
    });
    
    if (!contacto) {
      contacto = await prisma.contacto.create({
        data: {
          nombre: 'Carlos',
          apellido: 'García',
          correo: 'carlos@example.com',
          telefono: '555-1234',
          tipo: 'LEAD',
          usuarioId: usuario.id
        }
      });
      console.log('✅ Lead creado:', contacto.id);
    } else {
      console.log('✅ Lead encontrado:', contacto.id);
    }

    // Crear una oportunidad
    const oportunidad = await prisma.oportunidadCliente.create({
      data: {
        clienteId: contacto.id,
        usuarioId: usuario.id,
        titulo: 'Oportunidad - ' + contacto.nombre,
        etapa: 'CONTACTO_INICIAL',
        probabilidad: 25,
        proximaAccion: 'Hacer llamada'
      }
    });
    console.log('✅ Oportunidad creada:', oportunidad.id);
    console.log('   Etapa:', oportunidad.etapa);
    console.log('   Probabilidad:', oportunidad.probabilidad);

    // Cambiar a siguiente etapa
    const oportunidad2 = await prisma.oportunidadCliente.update({
      where: { id: oportunidad.id },
      data: { etapa: 'AGENDAMIENTO', probabilidad: 40 }
    });
    console.log('\n✅ Oportunidad actualizada a:', oportunidad2.etapa);
    console.log('   Nueva probabilidad:', oportunidad2.probabilidad);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
