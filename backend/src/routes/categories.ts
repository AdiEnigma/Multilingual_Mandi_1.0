import { Router } from 'express';
import { asyncHandler } from '@/middleware/error';
import { authenticate } from '@/middleware/auth';
import { categoryService } from '@/services/CategoryService';

const router = Router();

// GET /api/categories - Get all categories
router.get('/', asyncHandler(async (req, res) => {
  const result = await categoryService.getAllCategories();

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
}));

// GET /api/categories/hierarchy - Get category hierarchy
router.get('/hierarchy', asyncHandler(async (req, res) => {
  const result = await categoryService.getCategoryHierarchy();

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
}));

// POST /api/categories - Create new category (requires authentication)
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const result = await categoryService.createCategory(req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.status(201).json(result);
}));

// GET /api/categories/:id - Get category by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await categoryService.getCategoryById(id);

  if (!result.success) {
    return res.status(404).json(result);
  }

  res.json(result);
}));

// PUT /api/categories/:id - Update category (requires authentication)
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await categoryService.updateCategory(id, req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
}));

// DELETE /api/categories/:id - Delete category (requires authentication)
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await categoryService.deleteCategory(id);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
}));

export default router;