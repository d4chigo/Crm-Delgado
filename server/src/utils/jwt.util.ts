import jwt, { SignOptions } from 'jsonwebtoken';
import { PayloadJWT } from '@/types';

const SECRET = process.env.JWT_SECRET || 'secret-super-secreto-cambiar-en-produccion';

export const generarToken = (payload: PayloadJWT): string => {
  const options: SignOptions = { expiresIn: '24h' };
  return jwt.sign(payload, SECRET, options);
};

export const verificarToken = (token: string): PayloadJWT => {
  return jwt.verify(token, SECRET) as PayloadJWT;
};

export const decodificarToken = (token: string): PayloadJWT | null => {
  try {
    return jwt.decode(token) as PayloadJWT;
  } catch {
    return null;
  }
};
