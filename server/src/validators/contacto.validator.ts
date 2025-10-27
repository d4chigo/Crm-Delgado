import { z } from 'zod';

const baseSexoEnum = z.enum(['MASCULINO', 'FEMENINO']);
const soloLetrasRegexp = new RegExp("^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$");
const soloDigitosRegexp = new RegExp("^\\d+$");

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
    correo: z
      .string()
      .email('Correo electrónico inválido')
      .toLowerCase()
      .optional(),
    telefono: z
      .string()
      .regex(soloDigitosRegexp, 'El teléfono solo debe contener dígitos')
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
      .regex(soloDigitosRegexp, 'El DNI solo debe contener dígitos')
      .optional(),
    sexo: baseSexoEnum.optional(),
    fechaNacimiento: z
      .string()
      .datetime('Fecha de nacimiento inválida')
      .optional(),
    tipo: z.enum(['CONTACTO', 'LEAD', 'CLIENTE']).optional(),
    
    // Información profesional
    empresa: z.string().max(200).optional(),
    cargo: z.string().max(100).optional(),
    
    // Información comercial
    presupuesto: z.number().positive().optional(),
    estadoLead: z.enum(['NUEVO', 'CONTACTADO', 'CALIFICADO', 'NEGOCIACION', 'PROPUESTA', 'GANADO', 'PERDIDO', 'EN_ESPERA']).optional(),
    prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
    fuente: z.string().max(100).optional(),
    probabilidad: z.number().int().min(0).max(100).optional(),
    
    // Fechas
    fechaSeguimiento: z.string().datetime().optional(),
    
    // Notas
    notas: z.string().optional(),
    intereses: z.string().optional(),
    
    // Ubicación
    departamento: z.string().max(100).optional(),
    provincia: z.string().max(100).optional(),
    distrito: z.string().max(100).optional(),
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
    correo: z
      .string()
      .email('Correo electrónico inválido')
      .toLowerCase()
      .optional(),
    telefono: z
      .string()
      .regex(soloDigitosRegexp, 'El teléfono solo debe contener dígitos')
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
      .regex(soloDigitosRegexp, 'El DNI solo debe contener dígitos')
      .optional(),
    sexo: baseSexoEnum.optional(),
    fechaNacimiento: z
      .string()
      .datetime()
      .optional(),
    tipo: z
      .enum(['CONTACTO', 'LEAD', 'CLIENTE'])
      .optional(),
    
    // Información profesional
    empresa: z.string().max(200).optional(),
    cargo: z.string().max(100).optional(),
    
    // Información comercial
    presupuesto: z.number().positive().optional(),
    estadoLead: z.enum(['NUEVO', 'CONTACTADO', 'CALIFICADO', 'NEGOCIACION', 'PROPUESTA', 'GANADO', 'PERDIDO', 'EN_ESPERA']).optional(),
    prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
    fuente: z.string().max(100).optional(),
    probabilidad: z.number().int().min(0).max(100).optional(),
    
    // Fechas
    fechaSeguimiento: z.string().datetime().optional(),
    
    // Notas
    notas: z.string().optional(),
    intereses: z.string().optional(),
    
    // Ubicación
    departamento: z.string().max(100).optional(),
    provincia: z.string().max(100).optional(),
    distrito: z.string().max(100).optional(),
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
