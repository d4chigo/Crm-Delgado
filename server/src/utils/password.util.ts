import bcrypt from 'bcrypt';

const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

export const hashearPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, ROUNDS);
};

export const compararPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
