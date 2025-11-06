import { PrismaClient, OtrosServicios } from '@prisma/client'

const prisma = new PrismaClient()

export const otrosServiciosService = {
  async obtenerTodos() {
    return await prisma.otrosServicios.findMany({ orderBy: { id: 'asc' } as any })
  },
  async obtenerPorId(id: number) {
    return await prisma.otrosServicios.findUnique({ where: { id } })
  },
  async crear(data: Partial<OtrosServicios>) {
    return await prisma.otrosServicios.create({ data: { ...data } as any })
  },
  async actualizar(id: number, data: Partial<OtrosServicios>) {
    return await prisma.otrosServicios.update({ where: { id }, data: { ...data } as any })
  },
  async eliminar(id: number) {
    return await prisma.otrosServicios.delete({ where: { id } })
  }
}
