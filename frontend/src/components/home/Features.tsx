import React from 'react';

const features = [
  {
    title: 'Multilingual Support',
    description: 'Communicate in any of 22 Indian languages with real-time translation',
    icon: '🌐',
  },
  {
    title: 'AI Price Discovery',
    description: 'Get fair market prices powered by government data and AI insights',
    icon: '💰',
  },
  {
    title: 'Smart Negotiation',
    description: 'AI-assisted negotiation guidance to help you get the best deals',
    icon: '🤝',
  },
  {
    title: 'Trust & Reputation',
    description: 'Build trust with verified profiles and reputation scoring',
    icon: '⭐',
  },
];

export default function Features() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Trading
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to trade efficiently and fairly in the digital marketplace
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}