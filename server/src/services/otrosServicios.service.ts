import { PrismaClient, OtrosServicios } from '@prisma/client'

const prisma = new PrismaClient()

export const otrosServiciosService = {
  async obtenerTodos() {
    try {
      console.log('[otrosServiciosService] Iniciando obtenerTodos...')
      const result = await prisma.otrosServicios.findMany({ orderBy: { id: 'asc' } as any })
      console.log('[otrosServiciosService] Resultado:', result)
      // Parsear JSON fields
      return result.map(item => this.parseJsonFields(item))
    } catch (error) {
      console.error('[otrosServiciosService] Error en obtenerTodos:', error)
      throw error
    }
  },
  async obtenerPorId(id: number) {
    const result = await prisma.otrosServicios.findUnique({ where: { id } })
    return result ? this.parseJsonFields(result) : null
  },
  async crear(data: Partial<OtrosServicios>) {
    const processedData = this.stringifyJsonFields(data)
    const result = await prisma.otrosServicios.create({ data: { ...processedData } as any })
    return this.parseJsonFields(result)
  },
  async actualizar(id: number, data: Partial<OtrosServicios>) {
    const processedData = this.stringifyJsonFields(data)
    const result = await prisma.otrosServicios.update({ where: { id }, data: { ...processedData } as any })
    return this.parseJsonFields(result)
  },
  async eliminar(id: number) {
    return await prisma.otrosServicios.delete({ where: { id } })
  },
  parseJsonFields(item: any) {
    return {
      ...item,
      caracteristicas: item.caracteristicas ? JSON.parse(item.caracteristicas) : [],
      imagenes: item.imagenes ? JSON.parse(item.imagenes) : []
    }
  },
  stringifyJsonFields(data: any) {
    return {
      ...data,
      caracteristicas: data.caracteristicas ? JSON.stringify(data.caracteristicas) : null,
      imagenes: data.imagenes ? JSON.stringify(data.imagenes) : null
    }
  }
}
