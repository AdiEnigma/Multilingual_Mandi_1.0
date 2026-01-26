import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = [
    { id: 'cat-1', name: 'Grains & Cereals', parentId: null },
    { id: 'cat-2', name: 'Vegetables', parentId: null },
    { id: 'cat-3', name: 'Fruits', parentId: null },
    { id: 'cat-4', name: 'Spices', parentId: null },
    { id: 'cat-5', name: 'Pulses', parentId: null },
    { id: 'cat-6', name: 'Dairy Products', parentId: null },
    { id: 'cat-7', name: 'Rice', parentId: 'cat-1' },
    { id: 'cat-8', name: 'Wheat', parentId: 'cat-1' },
    { id: 'cat-9', name: 'Leafy Vegetables', parentId: 'cat-2' },
    { id: 'cat-10', name: 'Root Vegetables', parentId: 'cat-2' },
    { id: 'cat-11', name: 'Citrus Fruits', parentId: 'cat-3' },
    { id: 'cat-12', name: 'Seasonal Fruits', parentId: 'cat-3' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });
  }

  console.log('✅ Categories seeded');

  // Create sample price data
  const priceData = [
    {
      productName: 'Basmati Rice',
      category: 'Rice',
      price: 45.0,
      unit: 'kg',
      source: 'government',
      sourceName: 'MSP Data',
      locationState: 'Punjab',
      locationDistrict: 'Amritsar',
      confidenceScore: 0.95,
    },
    {
      productName: 'Tomato',
      category: 'Vegetables',
      price: 25.0,
      unit: 'kg',
      source: 'marketplace',
      sourceName: 'Local Mandi',
      locationState: 'Maharashtra',
      locationDistrict: 'Pune',
      confidenceScore: 0.85,
    },
    {
      productName: 'Turmeric',
      category: 'Spices',
      price: 180.0,
      unit: 'kg',
      source: 'government',
      sourceName: 'MSP Data',
      locationState: 'Tamil Nadu',
      locationDistrict: 'Erode',
      confidenceScore: 0.90,
    },
    {
      productName: 'Red Chili',
      category: 'Spices',
      price: 120.0,
      unit: 'kg',
      source: 'marketplace',
      sourceName: 'IndiaMART',
      locationState: 'Andhra Pradesh',
      locationDistrict: 'Guntur',
      confidenceScore: 0.80,
    },
  ];

  for (const price of priceData) {
    await prisma.priceData.create({
      data: price,
    });
  }

  console.log('✅ Price data seeded');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });