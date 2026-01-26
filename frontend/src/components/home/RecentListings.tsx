import React from 'react';

const sampleListings = [
  {
    id: 1,
    title: 'Premium Basmati Rice',
    price: '₹45/kg',
    location: 'Punjab',
    seller: 'Rajesh Kumar',
    image: '🌾',
  },
  {
    id: 2,
    title: 'Fresh Tomatoes',
    price: '₹25/kg',
    location: 'Maharashtra',
    seller: 'Priya Sharma',
    image: '🍅',
  },
  {
    id: 3,
    title: 'Organic Turmeric',
    price: '₹180/kg',
    location: 'Tamil Nadu',
    seller: 'Murugan S',
    image: '🌶️',
  },
  {
    id: 4,
    title: 'Red Chili Powder',
    price: '₹120/kg',
    location: 'Andhra Pradesh',
    seller: 'Lakshmi Devi',
    image: '🌶️',
  },
];

export default function RecentListings() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Recent Listings
          </h2>
          <p className="text-lg text-gray-600">
            Fresh products from verified sellers across India
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleListings.map((listing) => (
            <div key={listing.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="text-4xl mb-4 text-center">{listing.image}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{listing.title}</h3>
                <p className="text-2xl font-bold text-green-600 mb-2">{listing.price}</p>
                <p className="text-sm text-gray-600 mb-1">📍 {listing.location}</p>
                <p className="text-sm text-gray-600">👤 {listing.seller}</p>
              </div>
              <div className="px-6 pb-6">
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}