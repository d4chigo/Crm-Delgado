import { Request, Response } from 'express';
import prisma from '@/config/database';

class ClientAuthController {
  /**
   * POST /api/portal-cliente/validate-token
   * Valida un token JWT y retorna info del cliente
   */
  async validateToken(req: Request, res: Response) {
    try {
      // El middleware autenticar ya verificó el token
      const usuarioId = (req as any).usuario?.usuarioId;

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          error: 'Token no válido'
        });
      }

      // Obtener info del cliente
      const cliente = await prisma.contacto.findFirst({
        where: {
          id: usuarioId,
          tipo: 'CLIENTE'
        },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
          telefono: true
        }
      });

      if (!cliente) {
        return res.status(404).json({
          success: false,
          error: 'Cliente no encontrado'
        });
      }

      res.json({
        success: true,
        data: cliente
      });
    } catch (error) {
      console.error('Error validando token:', error);
      res.status(500).json({
        success: false,
        error: 'Error al validar token'
      });
    }
  }
}

export default new ClientAuthController();
