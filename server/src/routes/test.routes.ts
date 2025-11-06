import { Router, Request, Response } from 'express';
import prisma from '@/config/database';

const router = Router();

/**
 * GET /api/test/portal-cliente-diagnostic
 * Endpoint de diagnóstico para el portal de clientes
 */
router.get('/portal-cliente-diagnostic', async (req: Request, res: Response) => {
  try {
    const diagnostico: any = {
      timestamp: new Date().toISOString(),
      resultados: {}
    };

    // 1. Contar contactos tipo CLIENTE
    const totalClientes = await prisma.contacto.count({
      where: { tipo: 'CLIENTE' }
    });
    diagnostico.resultados.totalClientes = totalClientes;

    // 2. Listar algunos clientes
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
    diagnostico.resultados.clientesEjemplo = clientes;

    // 3. Verificar passwords
    const passwordsCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as total FROM cliente_passwords
    `;
    diagnostico.resultados.totalPasswords = Number(passwordsCount[0]?.total || 0);

    // 4. Verificar oportunidades
    const totalOportunidades = await prisma.oportunidadCliente.count();
    diagnostico.resultados.totalOportunidades = totalOportunidades;

    // 5. Verificar cotizaciones
    const totalCotizaciones = await prisma.cotizacion.count();
    diagnostico.resultados.totalCotizaciones = totalCotizaciones;

    // 6. Verificar documentos
    const totalDocumentos = await prisma.clienteDocumento.count();
    diagnostico.resultados.totalDocumentos = totalDocumentos;

    // 7. Test de un cliente específico si existe
    if (clientes.length > 0) {
      const clientePrueba = clientes[0];
      
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

      const cotizaciones = await prisma.cotizacion.findMany({
        where: { contactoId: clientePrueba.id }
      });

      const documentos = await prisma.clienteDocumento.findMany({
        where: { contactoId: clientePrueba.id }
      });

      const usuario = await prisma.usuario.findUnique({
        where: { id: clientePrueba.usuarioId },
        select: {
          id: true,
          nombre: true,
          email: true,
          telefono: true
        }
      });

      diagnostico.resultados.ejemploCliente = {
        cliente: clientePrueba,
        oportunidades: oportunidades.length,
        cotizaciones: cotizaciones.length,
        documentos: documentos.length,
        asesor: usuario
      };
    }

    res.json({
      success: true,
      message: 'Diagnóstico completado',
      data: diagnostico
    });

  } catch (error: any) {
    console.error('Error en diagnóstico:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;
