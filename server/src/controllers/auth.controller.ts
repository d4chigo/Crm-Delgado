import { Request, Response } from 'express';
import authService from '@/services/auth.service';
import { respuestaExito, respuestaError } from '@/utils/respuesta.util';
import { LoginDTO, RegistroDTO } from '@/types';

export class AuthController {
  /**
   * POST /api/auth/registro
   */
  async registrar(req: Request, res: Response): Promise<void> {
    try {
      const datos: RegistroDTO = req.body;
      const resultado = await authService.registrar(datos);
      respuestaExito(res, resultado, 'Usuario registrado exitosamente', 201);
    } catch (error: any) {
      if (error.message === 'El email ya está registrado') {
        respuestaError(res, error.message, 409, null, 'EMAIL_DUPLICADO');
        return;
      }
      respuestaError(res, error.message || 'Error al registrar usuario', 500);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const datos: LoginDTO = req.body;
      const resultado = await authService.login(datos);
      respuestaExito(res, resultado, 'Login exitoso');
    } catch (error: any) {
      if (error.message === 'Credenciales inválidas' || error.message === 'Usuario inactivo') {
        respuestaError(res, error.message, 401, null, 'CREDENCIALES_INVALIDAS');
        return;
      }
      respuestaError(res, error.message || 'Error al iniciar sesión', 500);
    }
  }

  /**
   * POST /api/auth/login-cliente
   * Login específico para clientes del portal
   * Endpoint que acepta token JWT pre-generado del PHP
   */
  async loginCliente(req: Request, res: Response): Promise<void> {
    try {
      // Si viene con un token JWT pre-firmado (desde PHP), valídalo directamente
      if (req.body.token) {
        // El token ya fue validado por el PHP y contiene la info del cliente
        res.json({
          exito: true,
          datos: {
            token: req.body.token,
            cliente: req.body.cliente
          }
        });
        return;
      }
      
      // Si viene con correo/password, intenta autenticar
      const { correo, password } = req.body;
      
      if (!correo || !password) {
        respuestaError(res, 'Correo y contraseña son requeridos', 400);
        return;
      }
      
      const resultado = await authService.loginCliente(correo, password);
      res.json(resultado);
    } catch (error: any) {
      if (error.message === 'Credenciales inválidas' || error.message === 'Cliente no encontrado') {
        respuestaError(res, error.message, 401, null, 'CREDENCIALES_INVALIDAS');
        return;
      }
      respuestaError(res, error.message || 'Error al iniciar sesión', 500);
    }
  }

  /**
   * GET /api/auth/perfil
   */
  async obtenerPerfil(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const usuario = await authService.obtenerPerfil(usuarioId);
      respuestaExito(res, usuario);
    } catch (error: any) {
      respuestaError(res, error.message || 'Error al obtener perfil', 500);
    }
  }
}

export default new AuthController();
