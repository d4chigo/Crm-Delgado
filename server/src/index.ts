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
import authRoutes from '@/routes/auth.routes';
import googleAuthRoutes from '@/routes/google-auth.routes';
import contactoRoutes from '@/routes/contacto.routes';
import dniRoutes from '@/routes/dni.routes';
import etiquetaRoutes from '@/routes/etiqueta.routes';
import proyectoRoutes from '@/routes/proyecto.routes';
import oportunidadRoutes from '@/routes/oportunidad.routes';
import cotizacionRoutes from '@/routes/cotizacion.routes';
import { manejarErrores } from '@/middlewares/error.middleware';

// Cargar variables de entorno
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARES DE SEGURIDAD ====================
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
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

app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/contactos', contactoRoutes);
app.use('/api/dni', dniRoutes);
app.use('/api/etiquetas', etiquetaRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/oportunidades', oportunidadRoutes);
app.use('/api/cotizaciones', cotizacionRoutes);

// ==================== MANEJO DE ERRORES ====================
app.use(manejarErrores);

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Rutas registradas: /api/auth, /api/contactos, /api/dni, /api/etiquetas, /api/proyectos, /api/oportunidades, /api/cotizaciones`);
});

export default app;
