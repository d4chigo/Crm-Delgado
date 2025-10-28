import { Router } from 'express';
import { askAssistant } from '@/controllers/assistant.controller';

const router = Router();

router.post('/ask', askAssistant);

export default router;
