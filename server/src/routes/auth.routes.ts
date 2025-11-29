import { Router } from 'express';
import authController from '@/controllers/auth.controller';
import { validar } from '@/middlewares/validacion.middleware';
import { autenticar } from '@/middlewares/autenticacion.middleware';
import { loginSchema, registroSchema } from '@/validators/auth.validator';

const router = Router();

// Rutas públicas
router.post('/registro', validar(registroSchema), authController.registrar.bind(authController));
router.post('/login', validar(loginSchema), authController.login.bind(authController));
router.post('/login-cliente', authController.loginCliente.bind(authController)); // Login para clientes del portal
router.post('/portal-login', authController.loginCliente.bind(authController)); // Alias para portal

// Rutas protegidas
router.get('/perfil', autenticar, authController.obtenerPerfil.bind(authController));

// Debug: verificar token
router.get('/debug/verificar-token', autenticar, (req: any, res: any) => {
  res.json({
    exito: true,
    datos: {
      mensaje: 'Token válido',
      usuario: req.usuario,
      headers: req.headers
    }
  });
});

export default router;
