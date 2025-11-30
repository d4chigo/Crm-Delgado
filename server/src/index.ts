import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Intentar cargar .env de la carpeta del servidor; si no existe, cargar desde la raiz del repo
const serverEnv = path.resolve(__dirname, '../../.env');
const localEnv = path.resolve(__dirname, '../.env');
if (fs.existsSync(localEnv)) {
  dotenv.config({ path: localEnv });
} else if (fs.existsSync(serverEnv)) {
  dotenv.config({ path: serverEnv });
} else {
  // fallback: carga normal (buscará en process.cwd())
  dotenv.config();
}

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import authRoutes from '@/routes/auth.routes';
import googleAuthRoutes from '@/routes/google-auth.routes';
import dniRoutes from '@/routes/dni.routes';
import contactoRoutes from '@/routes/contacto.routes';
import etiquetaRoutes from '@/routes/etiqueta.routes';
import proyectoRoutes from '@/routes/proyecto.routes';
import oportunidadRoutes from '@/routes/oportunidad.routes';
import cotizacionRoutes from '@/routes/cotizacion.routes';
import analyticsRoutes from '@/routes/analytics.routes';
import assistantRoutes from '@/routes/assistant.routes';
import calendarRoutes from '@/routes/calendar.routes';
import adminProyectosRoutes from '@/routes/adminProyectos';
import adminTestimoniosRoutes from '@/routes/adminTestimonios';
import adminTeamRoutes from '@/routes/adminTeam';
import adminOtrosServiciosRoutes from '@/routes/adminOtrosServicios';
import adminUsuariosRoutes from '@/routes/adminUsuarios';
import clienteWebRoutes from '@/routes/clienteWebRoutes';
import publicLeadRoutes from '@/routes/publicLeadRoutes';
import publicTeamRoutes from '@/routes/publicTeam';
import publicProjectsRoutes from '@/routes/publicProjects';
import publicTestimoniosRoutes from '@/routes/publicTestimonios';
import publicServicesRoutes from '@/routes/publicServicios';
import publicProyectosRoutes from '@/routes/publicProyectos';
import clientPortalRoutes from '@/routes/clientPortalRoutes';
import portalTestimonialsRoutes from '@/routes/portalTestimonials';
import testRoutes from '@/routes/test.routes';
import testPasswordRoutes from '@/routes/test-password.routes';
import testJwtRoutes from '@/routes/test-jwt.routes';
import devRoutes from '@/routes/dev.routes';
import notificacionRoutes from '@/routes/notificacion.routes';
import alertaRoutes from '@/routes/alerta.routes';
import leadPipelineRoutes from '@/routes/lead-pipeline.routes';
import reportesRoutes from '@/routes/reportes.routes';
import mcpRoutes from '@/routes/mcp';
import emailMarketingRoutes from '@/routes/email-marketing.routes';
import { manejarErrores } from '@/middlewares/error.middleware';
import { handleVoiceSession } from '@/controllers/voice.controller';
import { iniciarJobGenerarAlertas } from '@/jobs/generarAlertasAutomaticamente';
import { iniciarJobAutomatizarEstados } from '@/jobs/automatizarEstados';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARES DE SEGURIDAD ====================
app.use(helmet());

// Configurar CORS para permitir múltiples orígenes
// Orígenes base por defecto (desarrollo)
const defaultOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:3000',  // Frontend del CRM
  'http://localhost:8081',  // Portal de clientes PGDP
  'http://localhost:8080',  // Alternativa
  'http://127.0.0.1:8081',  // PGDP en localhost
  'http://127.0.0.1:8080',  // Alternativa
];

// Orígenes extra configurables por entorno (separados por comas)
const extraOrigins = (process.env.CORS_EXTRA_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Unificar y eliminar duplicados
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...extraOrigins]));

console.log('[CORS] Orígenes permitidos:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como Postman, curl, etc.)
    if (!origin) {
      console.log('[CORS] Request sin origin (probablemente desde servidor)');
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log(`[CORS] Origen permitido: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`[CORS] Origen no permitido: ${origin}`);
      // En desarrollo, permitir igual pero con warning
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[CORS] Permitiendo en desarrollo: ${origin}`);
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma', 'Expires', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - más permisivo en desarrollo
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 1000, // límite de 1000 requests por ventana (muy permisivo para desarrollo)
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde'
});
app.use('/api/', limiter);

// ==================== MIDDLEWARES GENERALES ====================
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== RUTAS ====================
app.get('/api/health', (req, res) => {
  res.json({
    exito: true,
    mensaje: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Cache corto para endpoints públicos (mejora de rendimiento en sitio público)
app.use('/api/public', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/dni', dniRoutes);
app.use('/api/contactos', contactoRoutes);
app.use('/api/etiquetas', etiquetaRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/oportunidades', oportunidadRoutes);
app.use('/api/cotizaciones', cotizacionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/alertas', alertaRoutes);
app.use('/api/leads', leadPipelineRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/mcp', mcpRoutes);
app.use('/api/email-marketing', emailMarketingRoutes);
app.use('/api/admin/proyectos', adminProyectosRoutes);
app.use('/api/admin/testimonials', adminTestimoniosRoutes);
app.use('/api/admin/team', adminTeamRoutes);
app.use('/api/admin/otros-servicios', adminOtrosServiciosRoutes);
app.use('/api/admin/users', adminUsuariosRoutes);
app.use('/api/clientes', clienteWebRoutes);
// Rutas específicas primero (más específicas)
app.use('/api/public/testimonios', publicTestimoniosRoutes);
app.use('/api/public/proyectos', publicProyectosRoutes);

// Rutas generales después (menos específicas)
app.use('/api/public', publicLeadRoutes);
app.use('/api/public', publicTeamRoutes);
app.use('/api/public', publicProjectsRoutes);
app.use('/api/public', publicServicesRoutes);
app.use('/api/portal-cliente', clientPortalRoutes);
app.use('/api/portal-cliente/testimonios', portalTestimonialsRoutes);
app.use('/api/test', testRoutes);
app.use('/api/test', testPasswordRoutes);
app.use('/api/test', testJwtRoutes);

// Rutas de desarrollo opcionales (solo si ALLOW_DEV_SEED=true)
if (process.env.ALLOW_DEV_SEED === 'true') {
  app.use('/api/dev', devRoutes);
}

// ==================== MANEJO DE ERRORES ====================
app.use(manejarErrores);

// ==================== INICIAR SERVIDOR ====================
const httpServer = createServer(app);

// WebSocket Server para sesiones de voz
const wss = new WebSocketServer({ server: httpServer, path: '/api/voice' });

wss.on('connection', (ws) => {
  console.log('[Voice] Nueva conexión WebSocket');
  handleVoiceSession(ws).catch((err) => {
    // Ignorar errores silenciosamente - probablemente sea un cliente que no es de voz
    console.debug('[Voice] Conexión cerrada:', err?.message);
  });
});

// Manejar errores del servidor WebSocket
wss.on('error', (err) => {
  console.error('[Voice] Error en WebSocket server:', err);
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🎙️  WebSocket voice en ws://localhost:${PORT}/api/voice`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Rutas registradas: /api/auth, /api/contactos, /api/dni, /api/etiquetas, /api/proyectos, /api/oportunidades, /api/cotizaciones, /api/analytics, /api/assistant, /api/calendar, /api/alertas`);
  
  // 🤖 Iniciar jobs automáticos
  iniciarJobGenerarAlertas();
  iniciarJobAutomatizarEstados();
});

export default app;
