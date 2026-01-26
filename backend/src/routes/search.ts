import { Router } from 'express';
import { asyncHandler } from '@/middleware/error';

const router = Router();

// GET /api/search
router.get('/', asyncHandler(async (req, res) => {
  // TODO: Implement search listings
  res.json({
    success: true,
    data: {
      listings: [],
      totalCount: 0,
      facets: {
        categories: [],
        priceRanges: [],
        locations: []
      },
      suggestions: []
    }
  });
}));

// GET /api/search/suggestions
router.get('/suggestions', asyncHandler(async (req, res) => {
  // TODO: Implement search suggestions
  res.json({
    success: true,
    data: []
  });
}));

// GET /api/search/categories
router.get('/categories', asyncHandler(async (req, res) => {
  // TODO: Implement get categories
  res.json({
    success: true,
    data: []
  });
}));

export default router;