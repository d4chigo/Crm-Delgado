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
 * POST /api/auth/google/test-token
 * Endpoint de debug para probar un token de Google
 */
router.post('/google/test-token', autenticar, async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      respuestaError(res, 'Access token requerido', 400);
      return;
    }
    
    console.log('[Google Auth Debug] Probando token...');
    const contactos = await googleAuthService.getContacts(accessToken);
    
    respuestaExito(res, {
      tokenValido: true,
      contactosEncontrados: contactos?.length || 0,
      contactos: contactos?.slice(0, 5) || [] // Primeros 5 para debug
    }, 'Token válido');
  } catch (error: any) {
    console.error('[Google Auth Debug] Error:', error.message);
    respuestaError(res, error.message || 'Error al probar token', 500);
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
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/leads?google_error=${errorCode}&description=${encodeURIComponent(errorDesc)}`);
    }

    if (!code) {
      console.log('❌ No se recibió código de autorización');
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/leads?google_error=no_code`);
    }

    // Obtener tokens de Google
    console.log('🔄 Intercambiando código por tokens...');
    const tokens = await googleAuthService.getTokens(code);
    console.log('✅ Tokens obtenidos exitosamente');

    // Validar que tenemos access token
    if (!tokens.access_token) {
      console.error('❌ CRÍTICO: Access token no recibido de Google');
      console.error('Tokens recibidos:', {
        access_token: 'AUSENTE ❌',
        refresh_token: tokens.refresh_token ? 'PRESENTE' : 'AUSENTE',
        token_type: tokens.token_type,
        scope: tokens.scope
      });
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      return res.redirect(`${clientUrl}/dashboard/leads?google_error=no_access_token&message=${encodeURIComponent('Google no devolvió un access_token válido. Intenta autenticarte nuevamente.')}`);
    }

    // Redirigir al frontend con el access token
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const redirectUrl = `${clientUrl}/dashboard/leads?google_token=${encodeURIComponent(tokens.access_token)}`;
    console.log('🔀 Redirigiendo al frontend...');
    console.log('Token a enviar, longitud:', tokens.access_token.length);
    res.redirect(redirectUrl);
  } catch (error: any) {
    console.error('❌ Error en callback de Google:', error.message);
    console.error('Stack:', error.stack);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/dashboard/leads?google_error=auth_failed&message=${encodeURIComponent(error.message)}`);
  }
});

export default router;
