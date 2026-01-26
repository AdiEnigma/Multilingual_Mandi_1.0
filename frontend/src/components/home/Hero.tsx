import React from 'react';

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to Marketplace Mandi
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            AI-powered multilingual marketplace connecting farmers, wholesalers, and traders across India
          </p>
          <div className="space-x-4">
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}