import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/system.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Publicly readable for some settings (like maintenance mode), 
// but we'll protect the update
router.get('/', getSettings);
router.post('/', authenticate, authorize(['admin']), updateSettings);

export default router;
