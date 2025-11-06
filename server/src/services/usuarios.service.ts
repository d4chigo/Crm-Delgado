import { PrismaClient, UsuarioWeb } from '@prisma/client'

const prisma = new PrismaClient()

export const usuariosService = {
  async obtenerTodos() {
    return await prisma.usuarioWeb.findMany({ orderBy: { id: 'asc' } as any })
  },
  async obtenerPorId(id: number) {
    return await prisma.usuarioWeb.findUnique({ where: { id } })
  },
  async crear(data: Partial<UsuarioWeb>) {
    return await prisma.usuarioWeb.create({ data: { ...data } as any })
  },
  async actualizar(id: number, data: Partial<UsuarioWeb>) {
    return await prisma.usuarioWeb.update({ where: { id }, data: { ...data } as any })
  },
  async eliminar(id: number) {
    return await prisma.usuarioWeb.delete({ where: { id } })
  }
}
