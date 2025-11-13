import { Router, Request, Response } from 'express';
import { verificarToken } from '@/utils/jwt.util';

const router = Router();

/**
 * POST /api/test/verify-jwt
 * Verificar un token JWT desde PHP
 */
router.post('/verify-jwt', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token requerido'
      });
    }

    // Intentar verificar el token
    try {
      const payload = verificarToken(token);
      
      return res.json({
        success: true,
        message: 'Token válido',
        payload,
        jwt_secret_length: process.env.JWT_SECRET?.length || 0,
        jwt_secret_first_10: process.env.JWT_SECRET?.substring(0, 10) || 'NOT SET'
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
        details: error.message,
        jwt_secret_length: process.env.JWT_SECRET?.length || 0,
        jwt_secret_first_10: process.env.JWT_SECRET?.substring(0, 10) || 'NOT SET'
      });
    }

  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
