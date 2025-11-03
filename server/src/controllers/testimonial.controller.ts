import { Request, Response } from 'express'
import { z } from 'zod'
import { testimonialService } from '../services/testimonial.service'

const createSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido').optional(),
  correo: z.string().email('Correo inválido').optional(),
  calificacion: z.number().min(1).max(5, 'La calificación debe estar entre 1 y 5'),
  testimonio: z.string().min(1, 'El testimonio es requerido'),
  foto: z.string().optional().nullable(),
  estado: z.enum(['PENDIENTE', 'APROBADO', 'RECHAZADO']).optional()
})

export const testimonialController = {
  async list(req: Request, res: Response) {
    try {
      const items = await testimonialService.obtenerTodos()
      res.json(items)
    } catch (error) {
      console.error('Error al listar testimonios:', error)
      res.status(500).json({ error: 'Error al obtener testimonios' })
    }
  },

  async get(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }
      const item = await testimonialService.obtenerPorId(id)
      if (!item) return res.status(404).json({ error: 'Testimonio no encontrado' })
      res.json(item)
    } catch (error) {
      console.error('Error al obtener testimonio:', error)
      res.status(500).json({ error: 'Error al obtener testimonio' })
    }
  },

  async create(req: Request, res: Response) {
    try {
      // Normalizar el campo email/correo
      const body = {
        ...req.body,
        correo: req.body.correo || req.body.email || ''
      }
      delete body.email

      const parsed = createSchema.safeParse(body)
      if (!parsed.success) {
        return res.status(400).json({ 
          error: 'Datos inválidos', 
          details: parsed.error.issues 
        })
      }

      const newItem = await testimonialService.crear(parsed.data as any)
      res.status(201).json(newItem)
    } catch (error) {
      console.error('Error al crear testimonio:', error)
      res.status(500).json({ error: 'Error al crear testimonio' })
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      // Normalizar el campo email/correo
      const body = {
        ...req.body,
        correo: req.body.correo || req.body.email
      }
      if (body.email) delete body.email

      const parsed = createSchema.partial().safeParse(body)
      if (!parsed.success) {
        return res.status(400).json({ 
          error: 'Datos inválidos', 
          details: parsed.error.issues 
        })
      }

      const updated = await testimonialService.actualizar(id, parsed.data as any)
      res.json(updated)
    } catch (error) {
      console.error('Error al actualizar testimonio:', error)
      res.status(500).json({ error: 'Error al actualizar testimonio' })
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }
      await testimonialService.eliminar(id)
      res.status(204).end()
    } catch (error) {
      console.error('Error al eliminar testimonio:', error)
      res.status(500).json({ error: 'Error al eliminar testimonio' })
    }
  }
}
