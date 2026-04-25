import { Router } from 'express';
import {
    getProducts,
    getDealerProducts,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', getProducts);
router.get('/dealer', authenticate, authorize(['dealer']), getDealerProducts);
router.post('/', authenticate, authorize(['dealer']), createProduct);
router.put('/:id', authenticate, authorize(['dealer', 'admin']), updateProduct);
router.delete('/:id', authenticate, authorize(['dealer', 'admin']), deleteProduct);

export default router;
