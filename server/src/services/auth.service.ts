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
   * Autentica un cliente del portal
   */
  async loginCliente(correo: string, password: string): Promise<{ token: string; cliente: any }> {
    // Buscar cliente por correo
    const cliente = await prisma.contacto.findFirst({
      where: { correo }
    });

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Buscar password del cliente
    const clientePassword = await prisma.$queryRaw<any[]>`
      SELECT password_web FROM cliente_passwords WHERE contacto_id = ${cliente.id} LIMIT 1
    `;

    if (!clientePassword || clientePassword.length === 0) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    const passwordValida = await compararPassword(password, clientePassword[0].password_web);

    if (!passwordValida) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token
    const payload: PayloadJWT = {
      usuarioId: cliente.id,
      email: cliente.correo,
      rol: 'CLIENTE' as any
    };

    const token = generarToken(payload);

    return {
      token,
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        correo: cliente.correo
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
