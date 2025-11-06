import { NextResponse } from 'next/server';
import { PrismaClient, Rol } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface UsuarioInput {
  nombre?: string;
  email?: string;
  password?: string;
  rol?: Rol;
  telefono?: string | null;
  activo?: boolean;
}

// Obtener un usuario por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        telefono: true,
        activo: true,
        creadoEn: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener el usuario' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Actualizar un usuario
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data: UsuarioInput = await request.json();

    // Verificar si el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el correo ya está en uso por otro usuario
    if (data.email && data.email !== usuarioExistente.email) {
      const emailEnUso = await prisma.usuario.findUnique({
        where: { email: data.email },
      });

      if (emailEnUso) {
        return NextResponse.json(
          { error: 'El correo electrónico ya está en uso' },
          { status: 400 }
        );
      }
    }

    // Preparar datos para actualizar
    const updateData: any = { ...data };

    // Si se proporcionó una nueva contraseña, encriptarla
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    } else {
      // No actualizar la contraseña si no se proporcionó una nueva
      delete updateData.password;
    }

    // Actualizar usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        telefono: true,
        activo: true,
      },
    });

    return NextResponse.json(usuarioActualizado);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el usuario' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Eliminar un usuario
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verificar si el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar usuario
    await prisma.usuario.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el usuario' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
