import { Router, Request, Response } from 'express';
import { autenticar } from '@/middlewares/autenticacion.middleware';
import googleAuthService from '@/services/google-auth.service';
import { respuestaExito, respuestaError } from '@/utils/respuesta.util';

const router = Router();

/**
 * GET /api/auth/google
 * Obtener URL de autorización de Google
 */
router.get('/google', autenticar, (req: Request, res: Response) => {
  try {
    // Verificar si Google OAuth está configurado
    if (!googleAuthService.isConfigured()) {
      respuestaError(
        res,
        'Google OAuth no está configurado. Por favor, configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en las variables de entorno.',
        503
      );
      return;
    }

    const authUrl = googleAuthService.getAuthUrl();
    respuestaExito(res, { authUrl }, 'URL de autorización generada');
  } catch (error: any) {
    console.error('Error al generar URL de autorización:', error);
    respuestaError(res, error.message || 'Error al generar URL de autorización', 500);
  }
});

/**
 * GET /api/auth/google/callback
 * Callback de Google OAuth
 */
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const error = req.query.error as string;

    console.log('📥 Callback recibido de Google');
    console.log('Code:', code ? 'Recibido' : 'No recibido');
    console.log('Error:', error || 'Ninguno');

    // Si el usuario canceló la autorización
    if (error) {
      console.log('❌ Error en OAuth:', error);
      console.log('❌ Descripción del error:', req.query.error_description);
      const errorCode = Array.isArray(error) ? error[0] : (typeof error === 'string' ? error : 'unknown');
      const errorDescRaw = req.query.error_description;
      const errorDesc = errorDescRaw 
        ? (Array.isArray(errorDescRaw) ? String(errorDescRaw[0]) : String(errorDescRaw))
        : '';
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/contacts?google_error=${errorCode}&description=${encodeURIComponent(errorDesc)}`);
    }

    if (!code) {
      console.log('❌ No se recibió código de autorización');
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/contacts?google_error=no_code`);
    }

    // Obtener tokens de Google
    console.log('🔄 Intercambiando código por tokens...');
    const tokens = await googleAuthService.getTokens(code);
    console.log('✅ Tokens obtenidos exitosamente');

    // Redirigir al frontend con el access token
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const redirectUrl = `${clientUrl}/dashboard/contacts?google_token=${encodeURIComponent(tokens.access_token || '')}`;
    console.log('🔀 Redirigiendo al frontend...');
    res.redirect(redirectUrl);
  } catch (error: any) {
    console.error('❌ Error en callback de Google:', error.message);
    console.error('Stack:', error.stack);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/dashboard/contacts?google_error=auth_failed&message=${encodeURIComponent(error.message)}`);
  }
});

export default router;
