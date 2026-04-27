import { Router } from 'express';
import { createJob, getJobs, updateJobStatus, getReviews, getPainters, submitReview } from '../controllers/painter.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/all', getPainters);
router.post('/', authenticate, authorize(['customer']), createJob);
router.get('/', authenticate, getJobs);
router.get('/reviews', authenticate, authorize(['painter']), getReviews);
router.post('/review', authenticate, authorize(['customer']), submitReview);
router.patch('/:id/status', authenticate, authorize(['painter', 'customer', 'admin']), updateJobStatus);

export default router;
