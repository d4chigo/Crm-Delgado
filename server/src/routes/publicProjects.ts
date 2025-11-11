import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()

// GET /api/public/projects
router.get('/projects', async (_req, res) => {
  try {
    const items = await prisma.proyecto.findMany({
      where: { activo: true, mostrarEnWeb: true },
      orderBy: { creadoEn: 'desc' },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        imagen: true,
        precio: true,
        ubicacion: true,
        estado: true,
        creadoEn: true,
        etiquetas: {
          include: {
            etiqueta: { select: { nombre: true, color: true } }
          }
        }
      }
    })

    const data = items.map((p: any) => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      imagen: p.imagen,
      precio: p.precio,
      ubicacion: p.ubicacion,
      estado: p.estado,
      creadoEn: p.creadoEn,
      etiquetas: (p.etiquetas || []).map((pe: any) => pe.etiqueta?.nombre).filter(Boolean),
      colores_etiquetas: (p.etiquetas || []).map((pe: any) => pe.etiqueta?.color).filter(Boolean),
    }))

    res.json({ success: true, data, meta: { count: data.length } })
  } catch (error) {
    console.error('[publicProjects] Error:', error)
    res.status(500).json({ success: false, error: 'Error al obtener proyectos' })
  }
})

export default router
