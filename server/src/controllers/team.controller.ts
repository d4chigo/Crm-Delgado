import { Request, Response } from 'express'
import { z } from 'zod'
import { teamService } from '../services/team.service'

const createSchema = z.object({
  // Campos en formato API (desde el frontend)
  name: z.string().min(1, 'El nombre es requerido'),
  position: z.string().min(1, 'El cargo es requerido'),
  description: z.string().optional().nullable().default(''),
  email: z.string().email('Email inválido').optional().nullable().or(z.literal('')).default(''),
  phone: z.string().optional().nullable().default(''),
  photo: z.string().optional().nullable().default(null),
  active: z.boolean().optional().default(true),
  display_order: z.number().optional().default(0),
  facebook_url: z.string().optional().nullable().default(null),
  instagram_url: z.string().optional().nullable().default(null),
  tiktok_url: z.string().optional().nullable().default(null),
}).passthrough()

const updateSchema = createSchema.partial()

// Para compatibilidad con formato Prisma, crear transformadores
const transformData = (data: any) => {
  const transformed: any = {}
  
  // Mapear desde formato API
  if (data.name) transformed.nombre = data.name
  if (data.position) transformed.cargo = data.position
  if (data.description !== undefined) transformed.descripcion = data.description
  if (data.email !== undefined && data.email !== '') transformed.correo = data.email
  if (data.phone) transformed.telefono = data.phone
  if (data.photo !== undefined) transformed.foto = data.photo
  if (data.active !== undefined) transformed.activo = data.active
  if (data.display_order !== undefined) transformed.ordenMostrar = data.display_order
  if (data.facebook_url !== undefined) transformed.facebook = data.facebook_url
  if (data.instagram_url !== undefined) transformed.instagram = data.instagram_url
  if (data.tiktok_url !== undefined) transformed.tiktok = data.tiktok_url
  
  // Mapear desde formato Prisma (si es que existe)
  if (data.nombre) transformed.nombre = data.nombre
  if (data.cargo) transformed.cargo = data.cargo
  if (data.descripcion !== undefined) transformed.descripcion = data.descripcion
  if (data.correo !== undefined && data.correo !== '') transformed.correo = data.correo
  if (data.telefono) transformed.telefono = data.telefono
  if (data.foto !== undefined) transformed.foto = data.foto
  if (data.activo !== undefined) transformed.activo = data.activo
  if (data.ordenMostrar !== undefined) transformed.ordenMostrar = data.ordenMostrar
  if (data.facebook !== undefined) transformed.facebook = data.facebook
  if (data.instagram !== undefined) transformed.instagram = data.instagram
  if (data.tiktok !== undefined) transformed.tiktok = data.tiktok
  
  return transformed
}

export const teamController = {
  async list(req: Request, res: Response) {
    try {
      const items = await teamService.obtenerTodos()
      res.json(items)
    } catch (error) {
      console.error('Error al listar miembros del equipo:', error)
      res.status(500).json({ error: 'Error al obtener miembros del equipo' })
    }
  },

  async get(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }
      const item = await teamService.obtenerPorId(id)
      if (!item) return res.status(404).json({ error: 'Miembro no encontrado' })
      res.json(item)
    } catch (error) {
      console.error('Error al obtener miembro:', error)
      res.status(500).json({ error: 'Error al obtener miembro' })
    }
  },

  async create(req: Request, res: Response) {
    try {
      const parsed = createSchema.safeParse(req.body)
      if (!parsed.success) {
        console.error('Validation errors:', parsed.error.issues)
        return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
      }
      
      // Transformar datos al formato que espera la BD
      const transformedData = transformData(parsed.data)
      
      console.log('Datos transformados:', transformedData)
      const created = await teamService.crear(transformedData as any)
      res.status(201).json(created)
    } catch (error) {
      console.error('Error al crear miembro:', error)
      res.status(500).json({ error: 'Error al crear miembro del equipo', details: (error as any).message })
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }
      const parsed = updateSchema.safeParse(req.body)
      if (!parsed.success) {
        console.error('Validation errors:', parsed.error.issues)
        return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
      }
      
      // Transformar datos al formato que espera la BD
      const transformedData = transformData(parsed.data)
      
      console.log('Datos transformados:', transformedData)
      const updated = await teamService.actualizar(id, transformedData as any)
      res.json(updated)
    } catch (error) {
      console.error('Error al actualizar miembro:', error)
      res.status(500).json({ error: 'Error al actualizar miembro del equipo', details: (error as any).message })
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }
      await teamService.eliminar(id)
      res.status(204).end()
    } catch (error) {
      console.error('Error al eliminar miembro:', error)
      res.status(500).json({ error: 'Error al eliminar miembro del equipo' })
    }
  }
}
