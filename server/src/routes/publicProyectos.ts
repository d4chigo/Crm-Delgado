import { Router, Request, Response } from 'express'
import prisma from '@/config/database'

const router = Router()

/**
 * GET /api/public/proyectos
 * Obtener proyectos públicos filtrados por etiqueta
 * Query params: etiqueta (opcional), estado (opcional)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { etiqueta, estado } = req.query
    
    console.log('=== GET /api/public/proyectos ===')
    console.log('Query params:', { etiqueta, estado })

    // Obtener todos los proyectos activos
    let proyectos = await prisma.proyecto.findMany({
      where: { activo: true },
      include: {
        etiquetas: {
          include: {
            etiqueta: true,
          },
        },
      },
      orderBy: {
        creadoEn: 'desc',
      },
    })
    
    console.log(`Total de proyectos activos: ${proyectos.length}`)
    proyectos.forEach((p: any) => {
      console.log(`- ${p.nombre}: etiquetas = [${p.etiquetas.map((e: any) => e.etiqueta.nombre).join(', ')}]`)
    })

    // Si se especifica una etiqueta, filtrar en memoria (case-insensitive)
    if (etiqueta) {
      // Dividir por coma si hay múltiples etiquetas
      const etiquetasBuscadas = (etiqueta as string)
        .split(',')
        .map((e: string) => e.trim().toLowerCase())
        .filter((e: string) => e.length > 0)
      
      console.log('Etiquetas a buscar:', etiquetasBuscadas)
      
      proyectos = proyectos.filter((p: any) => {
        const etiquetasProyecto = p.etiquetas.map((e: any) => e.etiqueta.nombre.toLowerCase())
        return etiquetasBuscadas.some((eb: string) => 
          etiquetasProyecto.some((ep: string) => ep.includes(eb) || eb.includes(ep))
        )
      })
    }
    
    console.log(`Proyectos después de filtro: ${proyectos.length}`)

    // Mapear proyectos al formato esperado por el frontend
    const proyectosFormato = proyectos.map((p: any) => {
      // Parsear galería si es JSON string
      let galeria: string[] = []
      if (p.galeria) {
        try {
          galeria = typeof p.galeria === 'string' ? JSON.parse(p.galeria) : p.galeria
        } catch (e: any) {
          galeria = []
        }
      }

      // Parsear características si es JSON string
      let caracteristicas: any = {}
      if (p.caracteristicas) {
        try {
          caracteristicas = typeof p.caracteristicas === 'string' ? JSON.parse(p.caracteristicas) : p.caracteristicas
        } catch (e: any) {
          caracteristicas = {}
        }
      }

      return {
        id: p.id,
        title: p.nombre,
        description: p.descripcion,
        city: p.ubicacion,
        price: p.precio,
        property_type: p.tipoProyecto || 'house',
        status: p.estado?.toLowerCase() || 'available',
        bedrooms: caracteristicas.habitaciones || 0,
        bathrooms: caracteristicas.banos || 0,
        area: caracteristicas.area || 0,
        latitude: p.latitud,
        longitude: p.longitud,
        images: [
          ...(p.imagen ? [{ image_path: p.imagen }] : []),
          ...galeria.map((img: string) => ({ image_path: img }))
        ],
        created_at: p.creadoEn,
        etiquetas: p.etiquetas?.map((e: any) => e.etiqueta.nombre) || [],
      }
    })

    res.json({
      success: true,
      properties: proyectosFormato,
    })
  } catch (error) {
    console.error('Error al obtener proyectos públicos:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener proyectos',
    })
  }
})

export default router
