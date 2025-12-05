import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

// GET /api/public/testimonials
router.get('/testimonials', async (_req, res) => {
  try {
    const items = await prisma.testimonio.findMany({
      where: { estado: 'APROBADO' },
      orderBy: { actualizado_en: 'desc' }
    })
    res.json({ success: true, data: items, meta: { count: items.length } })
  } catch (error) {
    console.error('[publicTestimonials] Error:', error)
    res.status(500).json({ success: false, error: 'Error al obtener testimonios' })
  }
})

// POST /api/public/testimonials - crear desde el portal del cliente (público)
const createSchema = z.object({
  nombre: z.string().min(1),
  correo: z.string().email().optional().nullable(),
  calificacion: z.coerce.number().min(1).max(5),
  testimonio: z.string().min(1),
  foto: z.string().optional().nullable(),
  media: z.string().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
})

router.post('/testimonials', async (req, res) => {
  try {
    const body = req.body || {}
    // Normalizar email/correo desde portales que envían 'email'
    if (!body.correo && body.email) body.correo = body.email

    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Datos inválidos', details: parsed.error.issues })
    }

    const payload = parsed.data as any
    const created = await prisma.testimonio.create({
      data: {
        nombre: payload.nombre,
        correo: payload.correo ?? '',
        calificacion: payload.calificacion,
        testimonio: payload.testimonio,
        foto: payload.foto ?? null,
        estado: 'PENDIENTE',
      } as any,
    })

    return res.status(201).json({ success: true, data: created })
  } catch (error) {
    console.error('[publicTestimonials POST] Error:', error)
    return res.status(500).json({ success: false, error: 'Error al crear testimonio' })
  }
})

export default router
