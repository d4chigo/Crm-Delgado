import { Request, Response } from 'express'
import { z } from 'zod'
import { otrosServiciosService } from '../services/otrosServicios.service'

const schema = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().optional(),
  imagen: z.string().optional(),
  activo: z.boolean().optional()
})

export const otrosServiciosController = {
  async list(req: Request, res: Response) {
    const items = await otrosServiciosService.obtenerTodos()
    res.json(items)
  },
  async get(req: Request, res: Response) {
    const id = Number(req.params.id)
    const item = await otrosServiciosService.obtenerPorId(id)
    if (!item) return res.status(404).json({ message: 'Not found' })
    res.json(item)
  },
  async create(req: Request, res: Response) {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues })
    const created = await otrosServiciosService.crear(parsed.data as any)
    res.status(201).json(created)
  },
  async update(req: Request, res: Response) {
    const id = Number(req.params.id)
    const parsed = schema.partial().safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues })
    const updated = await otrosServiciosService.actualizar(id, parsed.data as any)
    res.json(updated)
  },
  async remove(req: Request, res: Response) {
    const id = Number(req.params.id)
    await otrosServiciosService.eliminar(id)
    res.status(204).end()
  }
}
