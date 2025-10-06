import prisma from '@/config/database';
import { hashearPassword, compararPassword } from '@/utils/password.util';
import { generarToken } from '@/utils/jwt.util';
import { LoginDTO, RegistroDTO, RespuestaLogin, PayloadJWT } from '@/types';

export class AuthService {
  /**
   * Registra un nuevo usuario
   */
  async registrar(datos: RegistroDTO): Promise<RespuestaLogin> {
    const { nombre, email, password, telefono } = datos;

    // Verificar si el email ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      throw new Error('El email ya está registrado');
    }

    // Hashear contraseña
    const passwordHasheada = await hashearPassword(password);

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: passwordHasheada,
        telefono
      }
    });

    // Generar token
    const payload: PayloadJWT = {
      usuarioId: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    };

    const token = generarToken(payload);

    // Retornar usuario sin password
    const { password: _, ...usuarioSinPassword } = usuario;

    return {
      usuario: {
        ...usuarioSinPassword,
        telefono: usuarioSinPassword.telefono ?? undefined,
        avatar: usuarioSinPassword.avatar ?? undefined
      },
      token: {
        token,
        expiraEn: '24h'
      }
    };
  }

  /**
   * Autentica un usuario
   */
  async login(datos: LoginDTO): Promise<RespuestaLogin> {
    const { email, password } = datos;

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar si está activo
    if (!usuario.activo) {
      throw new Error('Usuario inactivo');
    }

    // Verificar contraseña
    const passwordValida = await compararPassword(password, usuario.password);

    if (!passwordValida) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token
    const payload: PayloadJWT = {
      usuarioId: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    };

    const token = generarToken(payload);

    // Retornar usuario sin password
    const { password: _, ...usuarioSinPassword } = usuario;

    return {
      usuario: {
        ...usuarioSinPassword,
        telefono: usuarioSinPassword.telefono ?? undefined,
        avatar: usuarioSinPassword.avatar ?? undefined
      },
      token: {
        token,
        expiraEn: '24h'
      }
    };
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  async obtenerPerfil(usuarioId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const { password: _, ...usuarioSinPassword } = usuario;
    return {
      ...usuarioSinPassword,
      telefono: usuarioSinPassword.telefono ?? undefined,
      avatar: usuarioSinPassword.avatar ?? undefined
    };
  }
}

export default new AuthService();
