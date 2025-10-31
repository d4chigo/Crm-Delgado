import { Request, Response } from 'express'
import { z } from 'zod'
import { testimonialService } from '../services/testimonial.service'

const createSchema = z.object({
  nombre: z.string().min(1),
  profesion: z.string().optional(),
  comentario: z.string().optional(),
  activo: z.boolean().optional()
})

export const testimonialController = {
  async list(req: Request, res: Response) {
    const items = await testimonialService.obtenerTodos()
    res.json(items)
  },

  async get(req: Request, res: Response) {
    const id = Number(req.params.id)
    const item = await testimonialService.obtenerPorId(id)
    if (!item) return res.status(404).json({ message: 'Not found' })
    res.json(item)
  },

  async create(req: Request, res: Response) {
    const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues })
    const newItem = await testimonialService.crear(parsed.data as any)
    res.status(201).json(newItem)
  },

  async update(req: Request, res: Response) {
    const id = Number(req.params.id)
    const parsed = createSchema.partial().safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues })
    const updated = await testimonialService.actualizar(id, parsed.data as any)
    res.json(updated)
  },

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id)
    await testimonialService.eliminar(id)
    res.status(204).end()
  }
}
