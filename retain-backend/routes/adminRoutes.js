import { Router } from 'express';
import { getInsights } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(protect, adminOnly);

router.get('/insights', getInsights);

export default router;