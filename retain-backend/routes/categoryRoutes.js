import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getCategories);
router.post('/', adminOnly, createCategory);
router.put('/:id', adminOnly, updateCategory);
router.delete('/:id', adminOnly, deleteCategory);

export default router;