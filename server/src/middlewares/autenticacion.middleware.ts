import { Request, Response, NextFunction } from 'express';
import { verificarToken } from '@/utils/jwt.util';
import { respuestaError } from '@/utils/respuesta.util';

export const autenticar = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('[AUTH] Headers recibidos:', {
      authorization: authHeader ? `${authHeader.substring(0, 30)}...` : 'No presente',
      url: req.url,
      method: req.method
    });

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[AUTH] Token no proporcionado en header Authorization');
      respuestaError(res, 'Token no proporcionado', 401, null, 'TOKEN_NO_ENCONTRADO');
      return;
    }

    const token = authHeader.substring(7);

    try {
      const payload = verificarToken(token);
      req.usuario = payload;
      next();
    } catch (error: any) {
      console.error('[AUTH] Error verificando token:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        respuestaError(res, 'Token expirado', 401, null, 'TOKEN_EXPIRADO');
        return;
      }
      
      if (error.name === 'JsonWebTokenError') {
        respuestaError(res, 'Token inválido', 401, null, 'TOKEN_INVALIDO');
        return;
      }

      respuestaError(res, 'Error al verificar token', 401, null, 'ERROR_AUTENTICACION');
    }
  } catch (error: any) {
    respuestaError(res, 'Error en autenticación', 401, null, 'ERROR_AUTENTICACION');
  }
};

export const esAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const usuario = req.usuario;

  if (!usuario || usuario.rol !== 'ADMIN') {
    respuestaError(res, 'Acceso denegado. Se requiere rol de administrador', 403, null, 'ACCESO_DENEGADO');
    return;
  }

  next();
};
