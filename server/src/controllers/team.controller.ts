import { Request, Response } from 'express'
import { z } from 'zod'
import { teamService } from '../services/team.service'

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  cargo: z.string().min(1, 'El cargo es requerido'),
  descripcion: z.string().optional(),
  correo: z.string().email('Email inválido').optional(),
  telefono: z.string().optional(),
  foto: z.string().optional().nullable(),
  activo: z.boolean().optional(),
  ordenMostrar: z.number().optional(),
  facebook: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  tiktok: z.string().optional().nullable()
})

export const teamController = {
  async list(req: Request, res: Response) {
    try {
      const items = await teamService.obtenerTodos()
      res.json(items)
    } catch (error) {
      console.error('Error al listar miembros del equipo:', error)
      res.status(500).json({ error: 'Error al obtener miembros del equipo' })
    }
  },

  async get(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }
      const item = await teamService.obtenerPorId(id)
      if (!item) return res.status(404).json({ error: 'Miembro no encontrado' })
      res.json(item)
    } catch (error) {
      console.error('Error al obtener miembro:', error)
      res.status(500).json({ error: 'Error al obtener miembro' })
    }
  },

  async create(req: Request, res: Response) {
    try {
      const parsed = schema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
      }
      const created = await teamService.crear(parsed.data as any)
      res.status(201).json(created)
    } catch (error) {
      console.error('Error al crear miembro:', error)
      res.status(500).json({ error: 'Error al crear miembro del equipo' })
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }
      const parsed = schema.partial().safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
      }
      const updated = await teamService.actualizar(id, parsed.data as any)
      res.json(updated)
    } catch (error) {
      console.error('Error al actualizar miembro:', error)
      res.status(500).json({ error: 'Error al actualizar miembro del equipo' })
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }
      await teamService.eliminar(id)
      res.status(204).end()
    } catch (error) {
      console.error('Error al eliminar miembro:', error)
      res.status(500).json({ error: 'Error al eliminar miembro del equipo' })
    }
  }
}
