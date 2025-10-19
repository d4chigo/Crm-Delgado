import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { respuestaError } from '@/utils/respuesta.util';

export const validar = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errores = error.issues.map((e) => ({
          campo: e.path.join('.'),
          mensaje: e.message
        }));
        respuestaError(res, 'Error de validación', 400, errores, 'VALIDACION_ERROR');
        return;
      }
      next(error);
    }
  };
};
