import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()

// GET /api/public/otros-servicios
router.get('/otros-servicios', async (_req, res) => {
  try {
    console.log('[publicServicios] Obteniendo servicios...')
    const items = await prisma.otrosServicios.findMany({
      orderBy: { createdAt: 'desc' }
    })

    console.log('[publicServicios] Items encontrados:', items.length)
    console.log('[publicServicios] Items:', items)

    const data = items.map((s: any) => {
      // Parse JSON fields
      let caracteristicas: string[] = []
      let imagenes: string[] = []
      
      try {
        if (s.caracteristicas) {
          caracteristicas = JSON.parse(s.caracteristicas)
        }
      } catch (e) {
        console.error('Error parsing caracteristicas:', e)
      }
      
      try {
        if (s.imagenes) {
          imagenes = JSON.parse(s.imagenes)
        }
      } catch (e) {
        console.error('Error parsing imagenes:', e)
      }
      
      return {
        id: s.id,
        title: s.titulo,
        description: s.descripcion,
        caracteristicas,
        imagenes,
        image_link: s.imagen,
        video_link: s.imagen,
        enlaceVideo: s.imagen,
        service_type: 'servicio',
        created_at: s.createdAt,
        updated_at: s.updatedAt,
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
