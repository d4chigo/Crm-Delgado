import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()

// GET /api/public/otros-servicios
router.get('/otros-servicios', async (_req, res) => {
  try {
    console.log('[publicServicios] Obteniendo servicios...')
    // Usar creadoEn en lugar de createdAt
    const items = await prisma.otrosServicios.findMany({
      orderBy: { creadoEn: 'desc' }
    })

    console.log('[publicServicios] Items encontrados:', items.length)
    console.log('[publicServicios] Items:', items)

    const data = items.map((s: any) => {
      // El modelo OtrosServicios no tiene caracteristicas ni imagenes (JSON)
      // Tiene enlaceImagen y enlaceVideo

      const imagenes = s.enlaceImagen ? [s.enlaceImagen] : []
      const caracteristicas: string[] = [] // No hay campo caracteristicas en este modelo

      return {
        id: s.id,
        title: s.titulo,
        description: s.descripcion,
        caracteristicas,
        imagenes,
        image_link: s.enlaceImagen,
        video_link: s.enlaceVideo,
        enlaceVideo: s.enlaceVideo,
        service_type: s.tipoServicio,
        // Mapear campos de fecha correctamente
        created_at: s.creadoEn,
        updated_at: s.actualizadoEn,
      }
    })

    console.log('[publicServicios] Datos mapeados:', data)
    res.json({ success: true, data, meta: { count: data.length } })
  } catch (error) {
    console.error('[publicServicios] Error:', error)
    res.status(500).json({ success: false, error: 'Error al obtener servicios' })
  }
})

export default router
