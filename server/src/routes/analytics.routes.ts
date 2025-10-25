import { Router } from 'express';
import { getMetrics, getEstadisticas } from '@/controllers/analytics.controller';

const router = Router();

router.get('/metrics', getMetrics);
router.get('/estadisticas', getEstadisticas);

export default router;
