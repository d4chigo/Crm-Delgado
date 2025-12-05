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
      where: { correo: email }
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
        correo: email,
        contrasena: passwordHasheada,
        telefono
      }
    });

    // Generar token
    const payload: PayloadJWT = {
      usuarioId: usuario.id,
      email: usuario.correo,
      rol: usuario.rol
    };

    const token = generarToken(payload);

    // Retornar usuario sin contraseña
    const { contrasena: _, ...usuarioSinPassword } = usuario;

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
    console.log(`[Auth] Intentando login de cliente con correo: ${correo}`);

    // Buscar cliente por correo en Cliente o Lead
    let cliente: any = await prisma.cliente.findFirst({
      where: { correo }
    });

    if (!cliente) {
      console.log(`[Auth] No encontrado en tabla cliente, buscando en lead...`);
      cliente = await prisma.lead.findFirst({
        where: { correo }
      });
    }

    if (!cliente) {
      console.log(`[Auth] Cliente no encontrado con correo: ${correo}`);
      throw new Error('Credenciales inválidas');
    }

    console.log(`[Auth] Cliente encontrado: ${cliente.id}`);

    // Verificar que tiene acceso web activo
    const clienteAcceso = await prisma.clientePassword.findUnique({
      where: { contactoId: cliente.id },
      select: {
        contactoId: true,
        passwordWeb: true,
        activo: true,
        creadoEn: true,
        actualizadoEn: true
      }
    });

    if (!clienteAcceso) {
      console.log(`[Auth] No hay acceso web configurado para: ${cliente.id}`);
      throw new Error('Credenciales inválidas');
    }

    console.log(`[Auth] Acceso web encontrado. Activo: ${clienteAcceso.activo}`);

    // Verificar que el acceso está activo
    if (!clienteAcceso.activo) {
      console.log(`[Auth] Acceso desactivado para: ${cliente.id}`);
      throw new Error('Acceso desactivado. Por favor contacta al administrador.');
    }

    // Verificar contraseña
    console.log(`[Auth] Verificando contraseña...`);
    const passwordValida = await compararPassword(password, clienteAcceso.passwordWeb);

    if (!passwordValida) {
      console.log(`[Auth] Contraseña inválida para: ${cliente.id}`);
      throw new Error('Credenciales inválidas');
    }

    console.log(`[Auth] Login exitoso para: ${cliente.id}`);

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
      where: { correo: email }
    });

    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar si está activo
    if (!usuario.activo) {
      throw new Error('Usuario inactivo');
    }

    // Verificar contraseña
    const passwordValida = await compararPassword(password, usuario.contrasena);

    if (!passwordValida) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token
    const payload: PayloadJWT = {
      usuarioId: usuario.id,
      email: usuario.correo,
      rol: usuario.rol
    };

    const token = generarToken(payload);

    // Retornar usuario sin contraseña
    const { contrasena: _, ...usuarioSinPassword } = usuario;

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

    const { contrasena: _, ...usuarioSinPassword } = usuario;
    return {
      ...usuarioSinPassword,
      telefono: usuarioSinPassword.telefono ?? undefined,
      avatar: usuarioSinPassword.avatar ?? undefined
    };
  }
}

export default new AuthService();
