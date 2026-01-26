import React from 'react';

const categories = [
  { name: 'Grains & Cereals', count: 1250, image: '🌾' },
  { name: 'Vegetables', count: 890, image: '🥕' },
  { name: 'Fruits', count: 675, image: '🍎' },
  { name: 'Spices', count: 445, image: '🌶️' },
  { name: 'Pulses', count: 320, image: '🫘' },
  { name: 'Dairy Products', count: 280, image: '🥛' },
];

export default function PopularCategories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Popular Categories
          </h2>
          <p className="text-lg text-gray-600">
            Discover products across various agricultural categories
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-center">
                <div className="text-4xl mb-3">{category.image}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} listings</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}