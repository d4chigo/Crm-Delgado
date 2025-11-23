import { PrismaClient } from '@prisma/client';
import oportunidadService from './src/services/oportunidad.service';

const prisma = new PrismaClient();

async function testConversionVerdadera() {
  try {
    console.log('\n=== TEST CONVERSIÓN: LEAD → CLIENTE (CON SERVICIO) ===\n');

    // 1. Buscar o crear usuario
    let usuario = await prisma.usuario.findFirst({
      where: { email: 'testconv@test.com' }
    });

    if (!usuario) {
      console.log('📝 Creando usuario...');
      usuario = await prisma.usuario.create({
        data: {
          email: 'testconv@test.com',
          nombre: 'Test Conversion',
          password: 'test123456',
          rol: 'AGENTE'
        }
      });
      console.log(`✅ Usuario creado: ${usuario.id}`);
    } else {
      console.log(`✅ Usuario encontrado: ${usuario.id}`);
    }

    // 2. Crear lead
    console.log('\n📝 Creando lead...');
    const lead = await prisma.lead.create({
      data: {
        nombre: 'Juan',
        apellido: 'Test',
        correo: `juan-${Date.now()}@test.com`,
        telefono: '987654321',
        empresa: 'Test Company',
        estado: 'NUEVO',
        usuarioId: usuario.id,
        prioridad: 'ALTA'
      }
    });
    console.log(`✅ Lead creado: ${lead.id}`);
    console.log(`   - Estado: ${lead.estado}`);

    // 3. Crear oportunidad
    console.log('\n📝 Creando oportunidad...');
    const oportunidad = await prisma.oportunidadCliente.create({
      data: {
        titulo: 'Oportunidad Test Conversion',
        etapa: 'PROSPECCIÓN',
        probabilidad: 10,
        valor: 10000,
        leadId: lead.id,
        usuarioId: usuario.id
      },
      include: {
        lead: true,
        cliente: true
      }
    });
    console.log(`✅ Oportunidad creada: ${oportunidad.id}`);
    console.log(`   - Etapa: ${oportunidad.etapa}`);
    console.log(`   - Lead: ${oportunidad.leadId}`);
    console.log(`   - Cliente: ${oportunidad.clienteId}`);

    // 4. TRANSICIONES HASTA FIDELIZACIÓN
    const etapas = ['CALIFICACIÓN', 'PROPUESTA', 'NEGOCIACIÓN', 'CIERRE_GANADO', 'FIDELIZACIÓN'];
    
    for (const etapa of etapas) {
      console.log(`\n🔄 CAMBIANDO A: ${etapa}`);
      
      const opp = await oportunidadService.cambiarEtapa(
        oportunidad.id,
        usuario.id,
        etapa,
        `Cambio a ${etapa}`
      );

      console.log(`✅ Etapa actualizada a: ${opp?.etapa}`);
      console.log(`   - Lead vinculado: ${opp?.leadId}`);
      console.log(`   - Cliente vinculado: ${opp?.clienteId}`);

      if (etapa === 'FIDELIZACIÓN') {
        console.log('\n⭐ RESULTADO DE CONVERSIÓN:');
        if (opp?.clienteId && !opp?.leadId) {
          console.log('   ✅ CONVERSIÓN EXITOSA');
          console.log(`   - Cliente creado: ${opp.clienteId}`);
          console.log(`   - Lead desvinculado`);

          // Verificar datos del cliente
          const cliente = await prisma.cliente.findUnique({
            where: { id: opp.clienteId }
          });
          console.log(`   - Nombre del cliente: ${cliente?.nombre} ${cliente?.apellido}`);
          console.log(`   - Correo: ${cliente?.correo}`);
          console.log(`   - Empresa: ${cliente?.empresa}`);
        } else {
          console.log('   ❌ CONVERSIÓN FALLÓ');
          console.log(`   - Cliente: ${opp?.clienteId}`);
          console.log(`   - Lead: ${opp?.leadId}`);
        }
      }
    }

    console.log('\n✅ TEST COMPLETADO\n');

  } catch (error) {
    console.error('\n❌ Error en test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConversionVerdadera();
