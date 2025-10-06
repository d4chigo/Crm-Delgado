import { z } from 'zod';

export const crearContactoSchema = z.object({
  body: z.object({
    nombre: z
      .string({ message: 'El nombre es requerido' })
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
    apellido: z
      .string()
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(100, 'El apellido no puede exceder 100 caracteres')
      .optional(),
    correo: z
      .string()
      .email('Correo electrónico inválido')
      .toLowerCase()
      .optional(),
    telefono: z
      .string()
      .optional(),
    direccion: z
      .string()
      .max(200, 'La dirección no puede exceder 200 caracteres')
      .optional(),
    ciudad: z
      .string()
      .max(100, 'La ciudad no puede exceder 100 caracteres')
      .optional(),
    dni: z
      .string()
      .max(20, 'El DNI no puede exceder 20 caracteres')
      .optional(),
    sexo: z
      .enum(['MASCULINO', 'FEMENINO', 'OTRO'])
      .optional(),
    fechaNacimiento: z
      .string()
      .datetime('Fecha de nacimiento inválida')
      .optional()
  })
});

export const actualizarContactoSchema = z.object({
  body: z.object({
    nombre: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100)
      .optional(),
    apellido: z
      .string()
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(100)
      .optional(),
    correo: z
      .string()
      .email('Correo electrónico inválido')
      .toLowerCase()
      .optional(),
    telefono: z
      .string()
      .optional(),
    direccion: z
      .string()
      .max(200)
      .optional(),
    ciudad: z
      .string()
      .max(100)
      .optional(),
    dni: z
      .string()
      .max(20)
      .optional(),
    sexo: z
      .enum(['MASCULINO', 'FEMENINO', 'OTRO'])
      .optional(),
    fechaNacimiento: z
      .string()
      .datetime()
      .optional(),
    tipo: z
      .enum(['CONTACTO', 'LEAD', 'CLIENTE'])
      .optional()
  })
});

export const filtrosContactoSchema = z.object({
  query: z.object({
    tipo: z
      .enum(['CONTACTO', 'LEAD', 'CLIENTE'])
      .optional(),
    ciudad: z
      .string()
      .optional(),
    busqueda: z
      .string()
      .optional(),
    pagina: z
      .string()
      .transform(Number)
      .optional(),
    limite: z
      .string()
      .transform(Number)
      .optional()
  })
});
