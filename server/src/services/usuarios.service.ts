import { PrismaClient, Usuario } from '@prisma/client'

const prisma = new PrismaClient()

export const usuariosService = {
  async obtenerTodos() {
    return await prisma.usuario.findMany({ orderBy: { id: 'asc' } as any })
  },
  async obtenerPorId(id: number) {
    return await prisma.usuario.findUnique({ where: { id: String(id) } })
  },
  async crear(data: Partial<Usuario>) {
    return await prisma.usuario.create({ data: { ...data } as any })
  },
  async actualizar(id: number, data: Partial<Usuario>) {
    return await prisma.usuario.update({ where: { id: String(id) }, data: { ...data } as any })
  },
  async eliminar(id: number) {
    return await prisma.usuario.delete({ where: { id: String(id) } })
  }
}
