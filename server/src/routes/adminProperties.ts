import express from 'express'
import multer from 'multer'
import path from 'path'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const router = express.Router()

// Storage for uploaded images (local POC)
const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, path.join(__dirname, '../../../public/img/properties'))
  },
  filename: function (req: any, file: any, cb: any) {
    const ext = path.extname(file.originalname)
    cb(null, `prop_${Date.now()}${ext}`)
  }
})

const upload = multer({ storage })

router.get('/', async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      orderBy: { created_at: 'desc' },
      include: { images: true }
    })
    res.json(properties)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB error' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const p = await prisma.property.findUnique({ where: { id: req.params.id }, include: { images: true } })
    if (!p) return res.status(404).json({ error: 'Not found' })
    res.json(p)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const body = req.body
    const created = await prisma.property.create({ data: body })
    res.status(201).json(created)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB error' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const updated = await prisma.property.update({ where: { id: req.params.id }, data: req.body })
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    // delete images first (cascade is set but we explicitly remove files if needed)
    await prisma.propertyImage.deleteMany({ where: { propertyId: req.params.id } })
    await prisma.property.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB error' })
  }
})

router.post('/:id/images', upload.array('images', 12), async (req, res) => {
  try {
    const files = (req.files as any[] | undefined) || []
    const urls = [] as string[]
    for (const f of files) {
      const imagePath = `/img/properties/${f.filename}`
      urls.push(imagePath)
      await prisma.propertyImage.create({ data: { propertyId: req.params.id, image_path: imagePath, is_main: false } })
    }
    res.json({ uploaded: urls })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Upload error' })
  }
})

export default router
