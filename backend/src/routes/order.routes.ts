import { Router } from 'express';
import { createOrder, getOrders } from '../controllers/order.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, authorize(['dealer']), createOrder);
router.get('/', authenticate, authorize(['dealer', 'admin']), getOrders);

export default router;
