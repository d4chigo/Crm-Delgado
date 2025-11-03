import { Router, Request, Response } from 'express';
import prisma from '@/config/database';
import bcrypt from 'bcrypt';

const router = Router();

/**
 * GET /api/test/portal-passwords
 * Ver qué clientes tienen passwords configurados
 */
router.get('/portal-passwords', async (req: Request, res: Response) => {
  try {
    // Obtener todos los clientes
    const clientes = await prisma.contacto.findMany({
      where: { tipo: 'CLIENTE' },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo: true
      }
    });

    // Verificar cuáles tienen password
    const resultado = [];
    for (const cliente of clientes) {
      const password = await prisma.$queryRaw<any[]>`
        SELECT contacto_id FROM cliente_passwords WHERE contacto_id = ${cliente.id}
      `;
      
      resultado.push({
        id: cliente.id,
        nombre: `${cliente.nombre} ${cliente.apellido || ''}`,
        correo: cliente.correo,
        tienePassword: password.length > 0
      });
    }

    res.json({
      success: true,
      data: resultado
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/test/crear-password
 * Crear password para un cliente
 * Body: { contactoId: string, password: string }
 */
router.post('/crear-password', async (req: Request, res: Response) => {
  try {
    const { contactoId, password } = req.body;

    if (!contactoId || !password) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere contactoId y password'
      });
    }

    // Verificar que el contacto existe y es un CLIENTE
    const cliente = await prisma.contacto.findFirst({
      where: { 
        id: contactoId,
        tipo: 'CLIENTE'
      }
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    // Encriptar password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear o actualizar password
    await prisma.$executeRaw`
      INSERT INTO cliente_passwords (contacto_id, password_web, created_at, updated_at)
      VALUES (${contactoId}, ${hashedPassword}, NOW(), NOW())
      ON DUPLICATE KEY UPDATE password_web = ${hashedPassword}, updated_at = NOW()
    `;

    res.json({
      success: true,
      message: `Password creado para ${cliente.nombre} ${cliente.apellido || ''}`,
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        correo: cliente.correo
      }
    });

  } catch (error: any) {
    console.error('Error al crear password:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
