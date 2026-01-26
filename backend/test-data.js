const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    // Create a test category
    const category = await prisma.category.create({
      data: {
        name: 'Vegetables',
      },
    });

    // Create a test user
    const user = await prisma.user.create({
      data: {
        name: 'Test Seller',
        phoneNumber: '+919876543210',
        locationState: 'Maharashtra',
        locationDistrict: 'Mumbai',
        locationPincode: '400001',
        locationLat: 19.0760,
        locationLng: 72.8777,
        preferredLanguage: 'hi',
        userType: 'seller',
        reputationScore: 4.5,
        isVerified: true,
      },
    });

    // Create test listings
    const listings = [
      {
        sellerId: user.id,
        productName: 'Fresh Tomatoes',
        categoryId: category.id,
        description: 'Fresh red tomatoes from local farm',
        quantityAmount: 10,
        quantityUnit: 'kg',
        priceAmount: 40,
        priceCurrency: 'INR',
        priceUnit: 'kg',
        locationState: 'Maharashtra',
        locationDistrict: 'Mumbai',
        locationPincode: '400001',
        locationLat: 19.0760,
        locationLng: 72.8777,
        language: 'hi',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      {
        sellerId: user.id,
        productName: 'Organic Onions',
        categoryId: category.id,
        description: 'Organic onions, pesticide-free',
        quantityAmount: 5,
        quantityUnit: 'kg',
        priceAmount: 30,
        priceCurrency: 'INR',
        priceUnit: 'kg',
        locationState: 'Maharashtra',
        locationDistrict: 'Mumbai',
        locationPincode: '400001',
        locationLat: 19.0760,
        locationLng: 72.8777,
        language: 'hi',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        sellerId: user.id,
        productName: 'Green Chilies',
        categoryId: category.id,
        description: 'Spicy green chilies',
        quantityAmount: 2,
        quantityUnit: 'kg',
        priceAmount: 80,
        priceCurrency: 'INR',
        priceUnit: 'kg',
        locationState: 'Maharashtra',
        locationDistrict: 'Mumbai',
        locationPincode: '400001',
        locationLat: 19.0760,
        locationLng: 72.8777,
        language: 'hi',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const listing of listings) {
      await prisma.productListing.create({
        data: listing,
      });
    }

    console.log('Test data created successfully!');
    console.log(`Created user: ${user.name} (${user.id})`);
    console.log(`Created category: ${category.name} (${category.id})`);
    console.log(`Created ${listings.length} listings`);

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();