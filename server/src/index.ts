import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from '@/routes/auth.routes';
import contactoRoutes from '@/routes/contacto.routes';
import dniRoutes from '@/routes/dni.routes';
import etiquetaRoutes from '@/routes/etiqueta.routes';
import proyectoRoutes from '@/routes/proyecto.routes';
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
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
app.use('/api/contactos', contactoRoutes);
app.use('/api/dni', dniRoutes);
app.use('/api/etiquetas', etiquetaRoutes);
app.use('/api/proyectos', proyectoRoutes);

// ==================== MANEJO DE ERRORES ====================
app.use(manejarErrores);

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Rutas registradas: /api/auth, /api/contactos, /api/dni, /api/etiquetas`);
});

export default app;
