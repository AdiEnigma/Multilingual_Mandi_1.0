import { Router } from 'express';
import { asyncHandler } from '@/middleware/error';
import { authenticate } from '@/middleware/auth';
import { listingService } from '@/services/ListingService';
import { ListingFilters } from '@/services/ListingService';

const router = Router();

// GET /api/listings - Get listings with filters and pagination
router.get('/', asyncHandler(async (req, res) => {
  const {
    page = '1',
    limit = '20',
    sellerId,
    categoryId,
    status,
    search,
    state,
    district,
    pincode,
    minPrice,
    maxPrice,
  } = req.query;

  const filters: ListingFilters = {};

  if (sellerId) filters.sellerId = sellerId as string;
  if (categoryId) filters.categoryId = categoryId as string;
  if (status) filters.status = status as string;
  if (search) filters.search = search as string;

  if (state || district || pincode) {
    filters.location = {};
    if (state) filters.location.state = state as string;
    if (district) filters.location.district = district as string;
    if (pincode) filters.location.pincode = pincode as string;
  }

  if (minPrice || maxPrice) {
    filters.priceRange = {
      min: minPrice ? parseFloat(minPrice as string) : 0,
      max: maxPrice ? parseFloat(maxPrice as string) : Number.MAX_SAFE_INTEGER,
    };
  }

  const result = await listingService.getListings(
    filters,
    parseInt(page as string),
    parseInt(limit as string)
  );

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
}));

// POST /api/listings - Create new listing (requires authentication)
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const listingData = {
    ...req.body,
    sellerId: userId, // Use authenticated user's ID
  };

  const result = await listingService.createListing(listingData);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.status(201).json(result);
}));

// GET /api/listings/my - Get current user's listings (requires authentication)
router.get('/my', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const { page = '1', limit = '20' } = req.query;

  const result = await listingService.getUserListings(
    userId,
    parseInt(page as string),
    parseInt(limit as string)
  );

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
}));

// GET /api/listings/:id - Get listing by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await listingService.getListingById(id);

  if (!result.success) {
    return res.status(404).json(result);
  }

  res.json(result);
}));

// PUT /api/listings/:id - Update listing (requires authentication and ownership)
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // Check if listing exists and user owns it
  const existingListing = await listingService.getListingById(id);
  if (!existingListing.success) {
    return res.status(404).json(existingListing);
  }

  if (existingListing.data?.sellerId !== userId) {
    return res.status(403).json({
      success: false,
      error: 'You can only update your own listings'
    });
  }

  const result = await listingService.updateListing(id, req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
}));

// DELETE /api/listings/:id - Delete listing (requires authentication and ownership)
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // Check if listing exists and user owns it
  const existingListing = await listingService.getListingById(id);
  if (!existingListing.success) {
    return res.status(404).json(existingListing);
  }

  if (existingListing.data?.sellerId !== userId) {
    return res.status(403).json({
      success: false,
      error: 'You can only delete your own listings'
    });
  }

  const result = await listingService.deleteListing(id);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
}));

export default router;