import { z } from 'zod';

const baseSexoEnum = z.enum(['MASCULINO', 'FEMENINO']);
const soloLetrasRegexp = new RegExp("^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$");
const soloDigitosRegexp = new RegExp("^\\d+$");

// Validar email de forma más robusta - acepta caracteres Unicode
const emailRegexp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Email opcional que acepta strings vacíos
const emailOpcional = z
  .union([
    z.string().trim().min(1).refine(
      (val) => emailRegexp.test(val),
      'Correo electrónico inválido'
    ),
    z.string().trim().length(0) // string vacío
  ])
  .optional()
  .nullable()
  .transform((val) => val === null || val === '' ? '' : val);

// Teléfono opcional que acepta strings vacíos
const telefonoOpcional = z
  .union([
    z.string().trim().min(1).refine(
      (val) => soloDigitosRegexp.test(val),
      'El teléfono solo debe contener dígitos'
    ),
    z.string().trim().length(0) // string vacío
  ])
  .optional()
  .nullable()
  .transform((val) => val === null || val === '' ? '' : val);

// DNI opcional que acepta strings vacíos
const dniOpcional = z
  .union([
    z.string().trim().min(1).refine(
      (val) => soloDigitosRegexp.test(val),
      'El DNI solo debe contener dígitos'
    ),
    z.string().trim().length(0) // string vacío
  ])
  .optional()
  .nullable()
  .transform((val) => val === null || val === '' ? '' : val);

export const crearContactoSchema = z.object({
  body: z.object({
    nombre: z
      .string({ message: 'El nombre es requerido' })
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres')
      .regex(soloLetrasRegexp, 'El nombre solo debe contener letras y espacios'),
    apellido: z
      .string()
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(100, 'El apellido no puede exceder 100 caracteres')
      .regex(soloLetrasRegexp, 'El apellido solo debe contener letras y espacios')
      .optional(),
    correo: emailOpcional,
    telefono: telefonoOpcional,
    direccion: z
      .string()
      .trim()
      .max(200, 'La dirección no puede exceder 200 caracteres')
      .optional(),
    ciudad: z
      .string()
      .trim()
      .max(100, 'La ciudad no puede exceder 100 caracteres')
      .optional(),
    dni: dniOpcional,
    sexo: baseSexoEnum.optional(),
    fechaNacimiento: z
      .string()
      .datetime('Fecha de nacimiento inválida')
      .optional()
      .or(z.literal('')),
    tipo: z.enum(['CONTACTO', 'LEAD', 'CLIENTE']).optional(),
    
    // Información profesional
    empresa: z.string().trim().max(200).optional(),
    cargo: z.string().trim().max(100).optional(),
    
    // Información comercial
    presupuesto: z.number().positive().optional(),
    estadoLead: z.enum(['NUEVO', 'CONTACTADO', 'CALIFICADO', 'NEGOCIACION', 'PROPUESTA', 'GANADO', 'PERDIDO', 'EN_ESPERA']).optional(),
    prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
    fuente: z.string().trim().max(100).optional(),
    probabilidad: z.number().int().min(0).max(100).optional(),
    
    // Fechas
    fechaSeguimiento: z.string().datetime().optional().or(z.literal('')),
    
    // Notas
    notas: z.string().trim().optional(),
    intereses: z.string().trim().optional(),
    
    // Ubicación
    departamento: z.string().trim().max(100).optional(),
    provincia: z.string().trim().max(100).optional(),
    distrito: z.string().trim().max(100).optional(),
  })
});

export const actualizarContactoSchema = z.object({
  body: z.object({
    nombre: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100)
      .regex(soloLetrasRegexp, 'El nombre solo debe contener letras y espacios')
      .optional(),
    apellido: z
      .string()
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(100)
      .regex(soloLetrasRegexp, 'El apellido solo debe contener letras y espacios')
      .optional(),
    correo: emailOpcional,
    telefono: telefonoOpcional,
    direccion: z
      .string()
      .trim()
      .max(200)
      .optional(),
    ciudad: z
      .string()
      .trim()
      .max(100)
      .optional(),
    dni: dniOpcional,
    sexo: baseSexoEnum.optional(),
    fechaNacimiento: z
      .string()
      .datetime()
      .optional()
      .or(z.literal('')),
    tipo: z
      .enum(['CONTACTO', 'LEAD', 'CLIENTE'])
      .optional(),
    
    // Información profesional
    empresa: z.string().trim().max(200).optional(),
    cargo: z.string().trim().max(100).optional(),
    
    // Información comercial
    presupuesto: z.number().positive().optional(),
    estadoLead: z.enum(['NUEVO', 'CONTACTADO', 'CALIFICADO', 'NEGOCIACION', 'PROPUESTA', 'GANADO', 'PERDIDO', 'EN_ESPERA']).optional(),
    prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
    fuente: z.string().trim().max(100).optional(),
    probabilidad: z.number().int().min(0).max(100).optional(),
    
    // Fechas
    fechaSeguimiento: z.string().datetime().optional().or(z.literal('')),
    
    // Notas
    notas: z.string().trim().optional(),
    intereses: z.string().trim().optional(),
    
    // Ubicación
    departamento: z.string().trim().max(100).optional(),
    provincia: z.string().trim().max(100).optional(),
    distrito: z.string().trim().max(100).optional(),
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
    estadoLead: z
      .enum(['NUEVO', 'CONTACTADO', 'CALIFICADO', 'NEGOCIACION', 'PROPUESTA', 'GANADO', 'PERDIDO', 'EN_ESPERA'])
      .optional(),
    prioridad: z
      .enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE'])
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
