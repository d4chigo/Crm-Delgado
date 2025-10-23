import { Router } from 'express';
import { getMetrics } from '@/controllers/analytics.controller';

const router = Router();

router.get('/metrics', getMetrics);

export default router;
