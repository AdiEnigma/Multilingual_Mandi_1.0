import React from 'react';

const steps = [
  {
    step: 1,
    title: 'Register & Verify',
    description: 'Create your account and verify your phone number to get started',
    icon: '📱',
  },
  {
    step: 2,
    title: 'Browse or List',
    description: 'Search for products or create your own listings with photos and details',
    icon: '📋',
  },
  {
    step: 3,
    title: 'Chat & Negotiate',
    description: 'Connect with buyers/sellers in your language with AI-powered negotiation help',
    icon: '💬',
  },
  {
    step: 4,
    title: 'Complete Deal',
    description: 'Finalize the transaction and build your reputation in the marketplace',
    icon: '✅',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600">
            Get started in just four simple steps
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.step} className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {step.step}
              </div>
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}