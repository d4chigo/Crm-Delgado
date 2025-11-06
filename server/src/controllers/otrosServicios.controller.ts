import { Request, Response } from 'express'
import { z } from 'zod'
import { otrosServiciosService } from '../services/otrosServicios.service'

const schema = z.object({
  titulo: z.string().min(1, 'El título es requerido'),
  descripcion: z.string().optional().nullable(),
  enlaceImagen: z.string().optional().nullable(),
  enlaceVideo: z.string().optional().nullable(),
  tipoServicio: z.enum(['GENERAL', 'TECHO_PROPIO', 'MI_VIVIENDA', 'HABILITACIONES']).optional()
})

export const otrosServiciosController = {
  async list(req: Request, res: Response) {
    try {
      const items = await otrosServiciosService.obtenerTodos()
      res.json(items)
    } catch (error) {
      console.error('Error al listar servicios:', error)
      res.status(500).json({ error: 'Error al obtener servicios' })
    }
  },
  async get(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }
      const item = await otrosServiciosService.obtenerPorId(id)
      if (!item) return res.status(404).json({ error: 'Servicio no encontrado' })
      res.json(item)
    } catch (error) {
      console.error('Error al obtener servicio:', error)
      res.status(500).json({ error: 'Error al obtener servicio' })
    }
  },
  async create(req: Request, res: Response) {
    try {
      const parsed = schema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
      }
      const created = await otrosServiciosService.crear(parsed.data as any)
      res.status(201).json(created)
    } catch (error) {
      console.error('Error al crear servicio:', error)
      res.status(500).json({ error: 'Error al crear servicio' })
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
      const updated = await otrosServiciosService.actualizar(id, parsed.data as any)
      res.json(updated)
    } catch (error) {
      console.error('Error al actualizar servicio:', error)
      res.status(500).json({ error: 'Error al actualizar servicio' })
    }
  },
  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }
      await otrosServiciosService.eliminar(id)
      res.status(204).end()
    } catch (error) {
      console.error('Error al eliminar servicio:', error)
      res.status(500).json({ error: 'Error al eliminar servicio' })
    }
  }
}
