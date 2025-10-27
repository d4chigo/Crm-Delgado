import { Router } from 'express';
import { 
  getMetrics, 
  getEstadisticas,
  getReporteConversionPorOrigen,
  getReporteVelocidadCiclo,
  getReporteDesempenoAsesor,
  getReporteForecast,
} from '@/controllers/analytics.controller';

const router = Router();

router.get('/metrics', getMetrics);
router.get('/estadisticas', getEstadisticas);

// Reportes esenciales
router.get('/reports/conversion-origen', getReporteConversionPorOrigen);
router.get('/reports/velocidad-ciclo', getReporteVelocidadCiclo);
router.get('/reports/desempeno-asesor', getReporteDesempenoAsesor);
router.get('/reports/forecast', getReporteForecast);

export default router;
