import { Request, Response, NextFunction } from 'express';
import { respuestaError } from '@/utils/respuesta.util';
import { Prisma } from '@prisma/client';

export const manejarErrores = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('❌ Error:', error);

  // Errores de Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      respuestaError(res, 'Ya existe un registro con esos datos', 409, null, 'REGISTRO_DUPLICADO');
      return;
    }
    if (error.code === 'P2025') {
      respuestaError(res, 'Registro no encontrado', 404, null, 'NO_ENCONTRADO');
      return;
    }
  }

  // Errores de validación
  if (error.name === 'ZodError') {
    respuestaError(res, 'Datos de entrada inválidos', 400, error.errors, 'VALIDACION_ERROR');
    return;
  }

  // Error genérico
  respuestaError(
    res,
    error.message || 'Error interno del servidor',
    error.statusCode || 500,
    null,
    'ERROR_SERVIDOR'
  );
};
