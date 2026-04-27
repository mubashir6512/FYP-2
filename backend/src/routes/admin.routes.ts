import { Router } from 'express';
import {
    getAllUsers,
    getUserById,
    deleteUser,
    getAllDealers,
    getDealerById,
    getAllPainters,
    getPainterById,
    getReportsSummary,
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All admin routes are protected
router.use(authenticate, authorize(['admin']));

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.delete('/users/:id', deleteUser);

// Dealers
router.get('/dealers', getAllDealers);
router.get('/dealers/:id', getDealerById);

// Painters
router.get('/painters', getAllPainters);
router.get('/painters/:id', getPainterById);

// Reports
router.get('/reports/summary', getReportsSummary);

export default router;
