import { Request, Response } from 'express'
import { z } from 'zod'
import prisma from '@/config/database'

const createSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  calificacion: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val) : val),
    z.number().int().min(1, 'La calificación debe ser al menos 1').max(5, 'La calificación no puede exceder 5')
  ),
  testimonio: z.string().min(10, 'El testimonio debe tener al menos 10 caracteres'),
  // Foto: aceptar URL válida, null, o string vacío (que se convierte a null)
  foto: z.preprocess(
    (val) => (val === '' ? null : val),
    z.union([z.string().url(), z.null()]).optional().default(null)
  ),
  estado: z.enum(['PENDIENTE', 'APROBADO', 'RECHAZADO']).optional().default('PENDIENTE'),
})

// Schema específico para actualización - más flexible
const updateSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').optional(),
  email: z.string().email('Email inválido').optional(),
  calificacion: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val) : val),
    z.number().int().min(1, 'La calificación debe ser al menos 1').max(5, 'La calificación no puede exceder 5').optional()
  ),
  testimonio: z.string().min(10, 'El testimonio debe tener al menos 10 caracteres').optional(),
  foto: z.preprocess(
    (val) => (val === '' ? null : val),
    z.union([z.string().url(), z.null()]).optional()
  ),
  estado: z.enum(['PENDIENTE', 'APROBADO', 'RECHAZADO']).optional(),
}).strict(false) // Permitir campos adicionales sin fallar

export const testimoniosController = {
  // Obtener todos los testimonios (admin)
  async listAll(req: Request, res: Response) {
    try {
      const testimonios = await prisma.testimonio.findMany({
        orderBy: { creadoEn: 'desc' },
      })
      res.json(testimonios)
    } catch (error) {
      console.error('Error al listar testimonios:', error)
      res.status(500).json({ error: 'Error al obtener testimonios' })
    }
  },

  // Obtener testimonios aprobados (público)
  async listPublic(req: Request, res: Response) {
    try {
      const testimonios = await prisma.testimonio.findMany({
        where: { estado: 'APROBADO' },
        orderBy: { creadoEn: 'desc' },
      })
      res.json(testimonios)
    } catch (error) {
      console.error('Error al listar testimonios públicos:', error)
      res.status(500).json({ error: 'Error al obtener testimonios' })
    }
  },

  // Obtener un testimonio específico
  async get(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }
      const testimonio = await prisma.testimonio.findUnique({
        where: { id },
      })
      if (!testimonio) return res.status(404).json({ error: 'Testimonio no encontrado' })
      res.json(testimonio)
    } catch (error) {
      console.error('Error al obtener testimonio:', error)
      res.status(500).json({ error: 'Error al obtener testimonio' })
    }
  },

  // Crear testimonio (desde cliente web - sin autenticación)
  async createPublic(req: Request, res: Response) {
    try {
      console.log('Body recibido:', req.body)
      const parsed = createSchema.safeParse(req.body)
      if (!parsed.success) {
        console.log('Errores de validación:', parsed.error.issues)
        return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
      }

      const testimonio = await prisma.testimonio.create({
        data: {
          nombre: parsed.data.nombre,
          correo: parsed.data.email,
          calificacion: parsed.data.calificacion,
          testimonio: parsed.data.testimonio,
          foto: parsed.data.foto,
          estado: 'PENDIENTE',
          creadoEn: new Date(),
        },
      })

      res.status(201).json({
        message: 'Testimonio enviado correctamente. Será revisado por nuestro equipo.',
        testimonio,
      })
    } catch (error) {
      console.error('Error al crear testimonio:', error)
      res.status(500).json({ error: 'Error al enviar testimonio' })
    }
  },

  // Crear testimonio (admin)
  async create(req: Request, res: Response) {
    try {
      const parsed = createSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
      }

      const testimonio = await prisma.testimonio.create({
        data: {
          nombre: parsed.data.nombre,
          correo: parsed.data.email,
          calificacion: parsed.data.calificacion,
          testimonio: parsed.data.testimonio,
          foto: parsed.data.foto,
          estado: parsed.data.estado as any,
          creadoEn: new Date(),
        },
      })

      res.status(201).json(testimonio)
    } catch (error) {
      console.error('Error al crear testimonio:', error)
      res.status(500).json({ error: 'Error al crear testimonio' })
    }
  },

  // Actualizar testimonio (admin)
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      console.log('Body recibido para actualizar:', JSON.stringify(req.body, null, 2))

      const parsed = updateSchema.safeParse(req.body)
      if (!parsed.success) {
        console.log('Errores de validación:', parsed.error.issues)
        return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
      }

      const updateData: any = {}
      
      // Solo actualizar campos que fueron enviados y validados
      if (parsed.data.nombre !== undefined) updateData.nombre = parsed.data.nombre
      if (parsed.data.email !== undefined) updateData.correo = parsed.data.email
      if (parsed.data.calificacion !== undefined) updateData.calificacion = parsed.data.calificacion
      if (parsed.data.testimonio !== undefined) updateData.testimonio = parsed.data.testimonio
      if (parsed.data.foto !== undefined) updateData.foto = parsed.data.foto
      if (parsed.data.estado !== undefined) {
        updateData.estado = parsed.data.estado
        if (parsed.data.estado === 'APROBADO') {
          updateData.aprobadoEn = new Date()
        }
      }

      console.log('Datos a actualizar en BD:', JSON.stringify(updateData, null, 2))

      const testimonio = await prisma.testimonio.update({
        where: { id },
        data: updateData,
      })

      res.json(testimonio)
    } catch (error) {
      console.error('Error al actualizar testimonio:', error)
      res.status(500).json({ error: 'Error al actualizar testimonio' })
    }
  },

  // Cambiar estado de testimonio (admin)
  async updateStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const { estado } = req.body
      if (!['PENDIENTE', 'APROBADO', 'RECHAZADO'].includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' })
      }

      const updateData: any = { estado }
      if (estado === 'APROBADO') {
        updateData.aprobadoEn = new Date()
      }

      const testimonio = await prisma.testimonio.update({
        where: { id },
        data: updateData,
      })

      res.json(testimonio)
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      res.status(500).json({ error: 'Error al cambiar estado del testimonio' })
    }
  },

  // Eliminar testimonio (admin)
  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      await prisma.testimonio.delete({
        where: { id },
      })

      res.status(204).end()
    } catch (error) {
      console.error('Error al eliminar testimonio:', error)
      res.status(500).json({ error: 'Error al eliminar testimonio' })
    }
  },
}
