import { NextResponse } from 'next/server';
import { PrismaClient, Rol } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Tipos de datos
interface UsuarioInput {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
  telefono?: string | null;
  activo: boolean;
}

// Obtener todos los usuarios
export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        telefono: true,
        activo: true,
        creadoEn: true,
      },
      orderBy: {
        creadoEn: 'desc',
      },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener los usuarios' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Crear un nuevo usuario
export async function POST(request: Request) {
  try {
    const data: UsuarioInput = await request.json();
    
    // Validar datos
    if (!data.nombre || !data.email || !data.password) {
      return NextResponse.json(
        { error: 'Nombre, email y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar si el correo ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'El correo electrónico ya está en uso' },
        { status: 400 }
      );
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password: hashedPassword,
        rol: data.rol || 'AGENTE',
        telefono: data.telefono || null,
        activo: data.activo !== undefined ? data.activo : true,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        telefono: true,
        activo: true,
      },
    });

    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { error: 'Error al crear el usuario' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
