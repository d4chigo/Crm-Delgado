import { Testimonio } from '@prisma/client'
import prisma from '@/config/database'

export const testimonialService = {
  async obtenerTodos() {
    return await prisma.testimonio.findMany({ orderBy: { creadoEn: 'desc' } as any })
  },

  async obtenerPorId(id: number) {
    return await prisma.testimonio.findUnique({ where: { id } })
  },

  async crear(data: Partial<Testimonio>) {
    return await prisma.testimonio.create({ data: { ...data } as any })
  },

  async actualizar(id: number, data: Partial<Testimonio>) {
    return await prisma.testimonio.update({ where: { id }, data: { ...data } as any })
  },

  async eliminar(id: number) {
    return await prisma.testimonio.delete({ where: { id } })
  }
}
