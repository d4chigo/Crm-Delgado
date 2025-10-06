import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'El email es requerido' })
      .email('Email inválido')
      .toLowerCase(),
    password: z
      .string({ message: 'La contraseña es requerida' })
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
  })
});

export const registroSchema = z.object({
  body: z.object({
    nombre: z
      .string({ message: 'El nombre es requerido' })
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
    email: z
      .string({ message: 'El email es requerido' })
      .email('Email inválido')
      .toLowerCase(),
    password: z
      .string({ message: 'La contraseña es requerida' })
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(100, 'La contraseña no puede exceder 100 caracteres'),
    telefono: z
      .string()
      .optional()
  })
});
