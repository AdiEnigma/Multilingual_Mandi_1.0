import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { prisma } from '@/config/database';
import { listingService } from '@/services/ListingService';
import { SupportedLanguage } from '@marketplace-mandi/shared';

describe('ListingService', () => {
  let testUserId: string;
  let testCategoryId: string;

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        name: 'Test Seller',
        phoneNumber: '+919876543210',
        location: {
          state: 'Maharashtra',
          district: 'Mumbai',
          pincode: '400001',
        },
        preferredLanguage: SupportedLanguage.HINDI,
        userType: 'seller',
      },
    });
    testUserId = user.id;

    // Create test category
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
      },
    });
    testCategoryId = category.id;
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.productListing.deleteMany({
      where: { sellerId: testUserId },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });
    await prisma.category.delete({
      where: { id: testCategoryId },
    });
  });

  describe('createListing', () => {
    it('should create a listing successfully', async () => {
      const listingData = {
        sellerId: testUserId,
        productName: 'Test Product',
        categoryId: testCategoryId,
        description: 'Test description',
        quantity: {
          amount: 100,
          unit: 'kg',
        },
        askingPrice: {
          amount: 50,
          currency: 'INR' as const,
          unit: 'kg',
        },
        location: {
          state: 'Maharashtra',
          district: 'Mumbai',
          pincode: '400001',
        },
        images: ['test-image.jpg'],
        language: SupportedLanguage.HINDI,
      };

      const result = await listingService.createListing(listingData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.productName).toBe('Test Product');
      expect(result.data?.sellerId).toBe(testUserId);
      expect(result.data?.status).toBe('active');
    });

    it('should fail with missing required fields', async () => {
      const listingData = {
        sellerId: testUserId,
        // Missing productName
        categoryId: testCategoryId,
        quantity: {
          amount: 100,
          unit: 'kg',
        },
        askingPrice: {
          amount: 50,
          currency: 'INR' as const,
          unit: 'kg',
        },
        location: {
          state: 'Maharashtra',
          district: 'Mumbai',
          pincode: '400001',
        },
        images: [],
        language: SupportedLanguage.HINDI,
      };

      const result = await listingService.createListing(listingData as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required fields');
    });

    it('should fail with invalid seller', async () => {
      const listingData = {
        sellerId: 'invalid-seller-id',
        productName: 'Test Product',
        categoryId: testCategoryId,
        quantity: {
          amount: 100,
          unit: 'kg',
        },
        askingPrice: {
          amount: 50,
          currency: 'INR' as const,
          unit: 'kg',
        },
        location: {
          state: 'Maharashtra',
          district: 'Mumbai',
          pincode: '400001',
        },
        images: [],
        language: SupportedLanguage.HINDI,
      };

      const result = await listingService.createListing(listingData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Seller not found');
    });
  });

  describe('getListingById', () => {
    it('should get listing by ID successfully', async () => {
      // Create a listing first
      const listingData = {
        sellerId: testUserId,
        productName: 'Test Product',
        categoryId: testCategoryId,
        quantity: {
          amount: 100,
          unit: 'kg',
        },
        askingPrice: {
          amount: 50,
          currency: 'INR' as const,
          unit: 'kg',
        },
        location: {
          state: 'Maharashtra',
          district: 'Mumbai',
          pincode: '400001',
        },
        images: [],
        language: SupportedLanguage.HINDI,
      };

      const createResult = await listingService.createListing(listingData);
      expect(createResult.success).toBe(true);

      const listingId = createResult.data!.id;

      // Get the listing
      const result = await listingService.getListingById(listingId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(listingId);
      expect(result.data?.productName).toBe('Test Product');
    });

    it('should fail with invalid listing ID', async () => {
      const result = await listingService.getListingById('invalid-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Listing not found');
    });
  });

  describe('updateListing', () => {
    it('should update listing successfully', async () => {
      // Create a listing first
      const listingData = {
        sellerId: testUserId,
        productName: 'Test Product',
        categoryId: testCategoryId,
        quantity: {
          amount: 100,
          unit: 'kg',
        },
        askingPrice: {
          amount: 50,
          currency: 'INR' as const,
          unit: 'kg',
        },
        location: {
          state: 'Maharashtra',
          district: 'Mumbai',
          pincode: '400001',
        },
        images: [],
        language: SupportedLanguage.HINDI,
      };

      const createResult = await listingService.createListing(listingData);
      expect(createResult.success).toBe(true);

      const listingId = createResult.data!.id;

      // Update the listing
      const updateData = {
        productName: 'Updated Product Name',
        description: 'Updated description',
      };

      const result = await listingService.updateListing(listingId, updateData);

      expect(result.success).toBe(true);
      expect(result.data?.productName).toBe('Updated Product Name');
      expect(result.data?.description).toBe('Updated description');
    });
  });

  describe('deleteListing', () => {
    it('should delete listing successfully', async () => {
      // Create a listing first
      const listingData = {
        sellerId: testUserId,
        productName: 'Test Product',
        categoryId: testCategoryId,
        quantity: {
          amount: 100,
          unit: 'kg',
        },
        askingPrice: {
          amount: 50,
          currency: 'INR' as const,
          unit: 'kg',
        },
        location: {
          state: 'Maharashtra',
          district: 'Mumbai',
          pincode: '400001',
        },
        images: [],
        language: SupportedLanguage.HINDI,
      };

      const createResult = await listingService.createListing(listingData);
      expect(createResult.success).toBe(true);

      const listingId = createResult.data!.id;

      // Delete the listing
      const result = await listingService.deleteListing(listingId);

      expect(result.success).toBe(true);

      // Verify listing is deleted
      const getResult = await listingService.getListingById(listingId);
      expect(getResult.success).toBe(false);
    });
  });

  describe('getListings', () => {
    it('should get listings with pagination', async () => {
      // Create multiple listings
      const listingData = {
        sellerId: testUserId,
        productName: 'Test Product',
        categoryId: testCategoryId,
        quantity: {
          amount: 100,
          unit: 'kg',
        },
        askingPrice: {
          amount: 50,
          currency: 'INR' as const,
          unit: 'kg',
        },
        location: {
          state: 'Maharashtra',
          district: 'Mumbai',
          pincode: '400001',
        },
        images: [],
        language: SupportedLanguage.HINDI,
      };

      await listingService.createListing({ ...listingData, productName: 'Product 1' });
      await listingService.createListing({ ...listingData, productName: 'Product 2' });

      const result = await listingService.getListings({}, 1, 10);

      expect(result.success).toBe(true);
      expect(result.data?.data).toBeDefined();
      expect(result.data?.data.length).toBeGreaterThanOrEqual(2);
      expect(result.data?.pagination).toBeDefined();
      expect(result.data?.pagination.page).toBe(1);
      expect(result.data?.pagination.limit).toBe(10);
    });

    it('should filter listings by seller', async () => {
      // Create a listing
      const listingData = {
        sellerId: testUserId,
        productName: 'Test Product',
        categoryId: testCategoryId,
        quantity: {
          amount: 100,
          unit: 'kg',
        },
        askingPrice: {
          amount: 50,
          currency: 'INR' as const,
          unit: 'kg',
        },
        location: {
          state: 'Maharashtra',
          district: 'Mumbai',
          pincode: '400001',
        },
        images: [],
        language: SupportedLanguage.HINDI,
      };

      await listingService.createListing(listingData);

      const result = await listingService.getListings({ sellerId: testUserId }, 1, 10);

      expect(result.success).toBe(true);
      expect(result.data?.data).toBeDefined();
      expect(result.data?.data.every(listing => listing.sellerId === testUserId)).toBe(true);
    });
  });
});