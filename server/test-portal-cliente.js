require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPortalCliente() {
  console.log('🔍 Diagnosticando Portal de Cliente...\n');

  try {
    // 1. Verificar conexión a la base de datos
    console.log('1️⃣  Verificando conexión a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa\n');

    // 2. Contar contactos tipo CLIENTE
    console.log('2️⃣  Verificando contactos tipo CLIENTE...');
    const totalClientes = await prisma.contacto.count({
      where: { tipo: 'CLIENTE' }
    });
    console.log(`✅ Total de clientes: ${totalClientes}\n`);

    // 3. Listar algunos clientes
    console.log('3️⃣  Listando primeros 5 clientes...');
    const clientes = await prisma.contacto.findMany({
      where: { tipo: 'CLIENTE' },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo: true,
        telefono: true,
        usuarioId: true
      },
      take: 5
    });

    if (clientes.length === 0) {
      console.log('⚠️  No hay clientes en la base de datos\n');
    } else {
      clientes.forEach((cliente, index) => {
        console.log(`   ${index + 1}. ${cliente.nombre} ${cliente.apellido || ''}`);
        console.log(`      Email: ${cliente.correo || 'Sin email'}`);
        console.log(`      ID: ${cliente.id}`);
        console.log(`      Usuario asignado: ${cliente.usuarioId}\n`);
      });
    }

    // 4. Verificar passwords de clientes
    console.log('4️⃣  Verificando passwords de clientes...');
    const passwordsCount = await prisma.$queryRaw`
      SELECT COUNT(*) as total FROM cliente_passwords
    `;
    console.log(`✅ Total de passwords configurados: ${passwordsCount[0]?.total || 0}\n`);

    // 5. Verificar oportunidades de clientes
    console.log('5️⃣  Verificando oportunidades...');
    const totalOportunidades = await prisma.oportunidadCliente.count();
    console.log(`✅ Total de oportunidades: ${totalOportunidades}\n`);

    // 6. Verificar cotizaciones
    console.log('6️⃣  Verificando cotizaciones...');
    const totalCotizaciones = await prisma.cotizacion.count();
    console.log(`✅ Total de cotizaciones: ${totalCotizaciones}\n`);

    // 7. Verificar documentos subidos
    console.log('7️⃣  Verificando documentos...');
    const totalDocumentos = await prisma.clienteDocumento.count();
    console.log(`✅ Total de documentos: ${totalDocumentos}\n`);

    // 8. Test de un cliente específico si existe
    if (clientes.length > 0) {
      const clientePrueba = clientes[0];
      console.log(`8️⃣  Probando datos del cliente: ${clientePrueba.nombre}`);
      
      // Oportunidades del cliente
      const oportunidades = await prisma.oportunidadCliente.findMany({
        where: { clienteId: clientePrueba.id },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          }
        }
      });
      console.log(`   - Oportunidades: ${oportunidades.length}`);

      // Cotizaciones del cliente
      const cotizaciones = await prisma.cotizacion.findMany({
        where: { contactoId: clientePrueba.id }
      });
      console.log(`   - Cotizaciones: ${cotizaciones.length}`);

      // Documentos del cliente
      const documentos = await prisma.clienteDocumento.findMany({
        where: { contactoId: clientePrueba.id }
      });
      console.log(`   - Documentos: ${documentos.length}`);

      // Asesor asignado
      const usuario = await prisma.usuario.findUnique({
        where: { id: clientePrueba.usuarioId },
        select: {
          id: true,
          nombre: true,
          email: true,
          telefono: true
        }
      });
      console.log(`   - Asesor asignado: ${usuario?.nombre || 'Sin asesor'}\n`);
    }

    console.log('✅ Diagnóstico completado exitosamente');

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPortalCliente();
