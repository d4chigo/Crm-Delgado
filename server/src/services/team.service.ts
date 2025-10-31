import { PrismaClient, MiembroEquipo } from '@prisma/client'

const prisma = new PrismaClient()

export const teamService = {
  async obtenerTodos() {
    return await prisma.miembroEquipo.findMany({ orderBy: { orden: 'asc' } as any })
  },
  async obtenerPorId(id: number) {
    return await prisma.miembroEquipo.findUnique({ where: { id } })
  },
  async crear(data: Partial<MiembroEquipo>) {
    return await prisma.miembroEquipo.create({ data: { ...data } as any })
  },
  async actualizar(id: number, data: Partial<MiembroEquipo>) {
    return await prisma.miembroEquipo.update({ where: { id }, data: { ...data } as any })
  },
  async eliminar(id: number) {
    return await prisma.miembroEquipo.delete({ where: { id } })
  }
}
