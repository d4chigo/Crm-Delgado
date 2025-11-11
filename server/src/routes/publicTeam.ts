import { Router } from 'express'
import { teamService } from '@/services/team.service'

const router = Router()

// GET /api/public/team - lista miembros activos del equipo en formato público
router.get('/team', async (_req, res) => {
  try {
    const items = await teamService.obtenerTodos()
    // Asegurar estructura estable para el portal
    res.json({ success: true, data: items, count: items.length })
  } catch (error) {
    console.error('[publicTeam] Error:', error)
    res.status(500).json({ success: false, error: 'Error al obtener equipo' })
  }
})

export default router
