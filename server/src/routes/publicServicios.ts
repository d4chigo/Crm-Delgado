import { Router } from 'express'
import { PrismaClient, TipoServicio } from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()

// GET /api/public/otros-servicios
router.get('/otros-servicios', async (_req, res) => {
  try {
    const items = await prisma.otrosServicios.findMany({
      orderBy: { creadoEn: 'desc' }
    })

    const data = items.map((s) => ({
      id: s.id,
      title: s.titulo,
      description: s.descripcion,
      image_link: s.enlaceImagen,
      video_link: s.enlaceVideo,
      service_type: s.tipoServicio.toLowerCase(),
      created_at: s.creadoEn,
      updated_at: s.actualizadoEn,
    }))

    res.json({ success: true, data, meta: { count: data.length } })
  } catch (error) {
    console.error('[publicServicios] Error:', error)
    res.status(500).json({ success: false, error: 'Error al obtener servicios' })
  }
})

export default router
