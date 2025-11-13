import express from 'express'
const router = express.Router()

// Rutas deshabilitadas temporalmente hasta definir modelos en Prisma
router.all('*', (_req, res) => {
  res.status(501).json({ error: 'Admin properties API deshabilitada temporalmente' })
})

export default router
