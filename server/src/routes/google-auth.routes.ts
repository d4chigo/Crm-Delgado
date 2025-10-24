import { Router, Request, Response } from 'express';
import { autenticar } from '@/middlewares/autenticacion.middleware';
import googleAuthService from '@/services/google-auth.service';
import { respuestaExito, respuestaError } from '@/utils/respuesta.util';
import prisma from '@/config/database';
import cryptoUtil from '@/utils/crypto.util';
import jwt from 'jsonwebtoken';

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

    // Incluir state con el usuario para permitir callback seguro
    const stateToken = jwt.sign({
      sub: req.usuario!.id,
      purpose: 'contacts_oauth',
      exp: Math.floor(Date.now() / 1000) + 10 * 60 // 10 minutos
    }, process.env.JWT_SECRET || 'secret-super-secreto-cambiar-en-produccion');

    const authUrl = googleAuthService.getAuthUrl(stateToken);
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
    const state = req.query.state as string | undefined;

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

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    // Si el state corresponde a flujo de calendario/contactos, guardamos tokens y redirigimos sin exponerlos
    if (state) {
      try {
        const decoded: any = jwt.verify(state, process.env.JWT_SECRET || 'secret-super-secreto-cambiar-en-produccion');
        const userId: string | undefined = decoded?.sub;
        const purpose: string | undefined = decoded?.purpose;
        if (userId && (purpose === 'calendar_oauth' || purpose === 'contacts_oauth')) {
          const accessEnc = tokens.access_token ? cryptoUtil.encrypt(tokens.access_token) : null;
          const refreshEnc = tokens.refresh_token ? cryptoUtil.encrypt(tokens.refresh_token) : null;
          // Guardar/actualizar cuenta calendario cuando el propósito sea calendario
          if (purpose === 'calendar_oauth') {
            await prisma.calendarioCuenta.upsert({
              where: { usuarioId_proveedor: { usuarioId: userId, proveedor: 'GOOGLE' } },
              create: {
                usuarioId: userId,
                proveedor: 'GOOGLE',
                proveedorUsuarioId: null,
                email: null,
                accessTokenEnc: accessEnc || '',
                refreshTokenEnc: refreshEnc,
                tokenExpiraEn: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                scope: tokens.scope || null,
                calendarioPrimarioId: 'primary',
              },
              update: {
                accessTokenEnc: accessEnc || '',
                refreshTokenEnc: refreshEnc,
                tokenExpiraEn: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                scope: tokens.scope || null,
              }
            });
            return res.redirect(`${clientUrl}/dashboard/calendar?connected=1`);
          }
          // En caso de contactos, mantenemos compatibilidad con import basado en frontend token si no implementado
          return res.redirect(`${clientUrl}/dashboard/contacts?connected=1`);
        }
      } catch (e) {
        console.warn('State inválido en callback de Google:', (e as any).message);
      }
    }

    // Fallback legacy: redirigir con token para flujos antiguos (contactos)
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
