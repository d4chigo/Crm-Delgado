import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const teamService = {
  async obtenerTodos() {
    try {
      const items = await prisma.miembroEquipo.findMany({ 
        where: { activo: true },
        orderBy: { ordenMostrar: 'asc' } 
      })
      // Mapear campos de Prisma a formato esperado por el frontend
      return items.map((item: any) => ({
        id: item.id,
        name: item.nombre,
        position: item.cargo,
        description: item.descripcion,
        email: item.correo,
        phone: item.telefono,
        photo: item.foto,
        facebook_url: item.facebook,
        instagram_url: item.instagram,
        tiktok_url: item.tiktok,
        active: item.activo,
        display_order: item.ordenMostrar,
        created_at: item.creadoEn,
        updated_at: item.actualizadoEn,
      }))
    } catch (error) {
      console.error('Error en teamService.obtenerTodos:', error)
      throw error
    }
  },

  async obtenerPorId(id: number) {
    try {
      const item = await prisma.miembroEquipo.findUnique({ where: { id } })
      if (!item) return null
      
      return {
        id: item.id,
        name: item.nombre,
        position: item.cargo,
        description: item.descripcion,
        email: item.correo,
        phone: item.telefono,
        photo: item.foto,
        facebook_url: item.facebook,
        instagram_url: item.instagram,
        tiktok_url: item.tiktok,
        active: item.activo,
        display_order: item.ordenMostrar,
        created_at: item.creadoEn,
        updated_at: item.actualizadoEn,
      }
    } catch (error) {
      console.error('Error en teamService.obtenerPorId:', error)
      throw error
    }
  },

  async crear(data: any) {
    try {
      const item = await prisma.miembroEquipo.create({
        data: {
          nombre: data.nombre || data.name || '',
          cargo: data.cargo || data.position || '',
          descripcion: data.descripcion || data.description || '',
          correo: data.correo || data.email || '',
          telefono: data.telefono || data.phone || '',
          foto: data.foto || data.photo || null,
          activo: data.activo ?? data.active ?? true,
          ordenMostrar: data.ordenMostrar || data.display_order || 0,
          facebook: data.facebook || data.facebook_url || null,
          instagram: data.instagram || data.instagram_url || null,
          tiktok: data.tiktok || data.tiktok_url || null,
        }
      })

      return {
        id: item.id,
        name: item.nombre,
        position: item.cargo,
        description: item.descripcion,
        email: item.correo,
        phone: item.telefono,
        photo: item.foto,
        facebook_url: item.facebook,
        instagram_url: item.instagram,
        tiktok_url: item.tiktok,
        active: item.activo,
        display_order: item.ordenMostrar,
        created_at: item.creadoEn,
        updated_at: item.actualizadoEn,
      }
    } catch (error) {
      console.error('Error en teamService.crear:', error)
      throw error
    }
  },

  async actualizar(id: number, data: any) {
    try {
      const item = await prisma.miembroEquipo.update({
        where: { id },
        data: {
          ...(data.nombre || data.name ? { nombre: data.nombre || data.name } : {}),
          ...(data.cargo || data.position ? { cargo: data.cargo || data.position } : {}),
          ...(data.descripcion || data.description ? { descripcion: data.descripcion || data.description } : {}),
          ...(data.correo || data.email ? { correo: data.correo || data.email } : {}),
          ...(data.telefono || data.phone ? { telefono: data.telefono || data.phone } : {}),
          ...(data.foto || data.photo !== undefined ? { foto: data.foto || data.photo } : {}),
          ...(data.activo !== undefined || data.active !== undefined ? { activo: data.activo ?? data.active } : {}),
          ...(data.ordenMostrar !== undefined || data.display_order !== undefined ? { ordenMostrar: data.ordenMostrar ?? data.display_order } : {}),
          ...(data.facebook || data.facebook_url !== undefined ? { facebook: data.facebook || data.facebook_url } : {}),
          ...(data.instagram || data.instagram_url !== undefined ? { instagram: data.instagram || data.instagram_url } : {}),
          ...(data.tiktok || data.tiktok_url !== undefined ? { tiktok: data.tiktok || data.tiktok_url } : {}),
        }
      })

      return {
        id: item.id,
        name: item.nombre,
        position: item.cargo,
        description: item.descripcion,
        email: item.correo,
        phone: item.telefono,
        photo: item.foto,
        facebook_url: item.facebook,
        instagram_url: item.instagram,
        tiktok_url: item.tiktok,
        active: item.activo,
        display_order: item.ordenMostrar,
        created_at: item.creadoEn,
        updated_at: item.actualizadoEn,
      }
    } catch (error) {
      console.error('Error en teamService.actualizar:', error)
      throw error
    }
  },

  async eliminar(id: number) {
    try {
      await prisma.miembroEquipo.delete({ where: { id } })
    } catch (error) {
      console.error('Error en teamService.eliminar:', error)
      throw error
    }
  }
}
