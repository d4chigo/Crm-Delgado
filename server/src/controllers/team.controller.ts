import { Request, Response } from 'express'
import { z } from 'zod'
import { teamService } from '../services/team.service'

const schema = z.object({
  nombre: z.string().min(1),
  cargo: z.string().optional(),
  descripcion: z.string().optional(),
  foto: z.string().optional(),
  orden: z.number().optional()
})

export const teamController = {
  async list(req: Request, res: Response) {
    const items = await teamService.obtenerTodos()
    res.json(items)
  },

  async get(req: Request, res: Response) {
    const id = Number(req.params.id)
    const item = await teamService.obtenerPorId(id)
    if (!item) return res.status(404).json({ message: 'Not found' })
    res.json(item)
  },

  async create(req: Request, res: Response) {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues })
    const created = await teamService.crear(parsed.data as any)
    res.status(201).json(created)
  },

  async update(req: Request, res: Response) {
    const id = Number(req.params.id)
    const parsed = schema.partial().safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues })
    const updated = await teamService.actualizar(id, parsed.data as any)
    res.json(updated)
  },

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id)
    await teamService.eliminar(id)
    res.status(204).end()
  }
}
