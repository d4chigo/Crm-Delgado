import { Response } from 'express';
import { RespuestaExito, RespuestaError } from '@/types';

export const respuestaExito = <T>(
  res: Response,
  datos: T,
  mensaje?: string,
  statusCode: number = 200
): Response<RespuestaExito<T>> => {
  return res.status(statusCode).json({
    exito: true,
    datos,
    ...(mensaje && { mensaje })
  });
};

export const respuestaError = (
  res: Response,
  error: string,
  statusCode: number = 400,
  detalles?: any,
  codigo?: string
): Response<RespuestaError> => {
  return res.status(statusCode).json({
    exito: false,
    error,
    ...(detalles && { detalles }),
    ...(codigo && { codigo })
  });
};
