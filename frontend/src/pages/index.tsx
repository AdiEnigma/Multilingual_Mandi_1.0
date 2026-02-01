import { useState } from 'react';
import { GetStaticProps } from 'next';
import { useIntlayer } from 'next-intlayer';
import Head from 'next/head';
import Link from 'next/link';

import Layout from '@/components/Layout';
import Features from '@/components/home/Features';
import PopularCategories from '@/components/home/PopularCategories';
import RecentListings from '@/components/home/RecentListings';
import HowItWorks from '@/components/home/HowItWorks';

// Icons
import { 
  MagnifyingGlassIcon, 
  ShoppingBagIcon, 
  ChatBubbleLeftRightIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  GlobeAltIcon,
  SparklesIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { appName, welcomeToMandi, indianAgriculture, mandiPlatform, platformDescription, searchProducts, search: searchButton, viewProducts, sellProducts, digitalMandi, directConnection, popularCategories, categoriesDescription, grains, vegetables, fruits, dairy, spices, pulses, farmers, products, languages, states, startToday, joinThousands, startSelling, startBuying } = useIntlayer('common');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/listings?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const quickCategories = [
    { name: grains, nameEn: 'Grains', icon: '🌾', color: 'bg-amber-100 text-amber-800' },
    { name: vegetables, nameEn: 'Vegetables', icon: '🥬', color: 'bg-green-100 text-green-800' },
    { name: fruits, nameEn: 'Fruits', icon: '🍎', color: 'bg-red-100 text-red-800' },
    { name: dairy, nameEn: 'Dairy', icon: '🥛', color: 'bg-blue-100 text-blue-800' },
    { name: spices, nameEn: 'Spices', icon: '🌶️', color: 'bg-orange-100 text-orange-800' },
    { name: pulses, nameEn: 'Pulses', icon: '🫘', color: 'bg-yellow-100 text-yellow-800' },
  ];

  const stats = [
    { label: farmers, labelEn: 'Farmers', value: '50,000+', icon: UserGroupIcon },
    { label: products, labelEn: 'Products', value: '2,00,000+', icon: ShoppingBagIcon },
    { label: languages, labelEn: 'Languages', value: '22', icon: GlobeAltIcon },
    { label: states, labelEn: 'States', value: '28', icon: SparklesIcon },
  ];

  return (
    <>
      <Head>
        <title>{appName} - भारतीय कृषि मंडी</title>
        <meta name="description" content="AI-powered multilingual marketplace for Indian farmers and traders" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <Layout>
        {/* Enhanced Hero Section with Indian Design */}
        <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          {/* Floating Indian Elements */}
          <div className="absolute top-20 left-10 text-6xl opacity-20 animate-float">🪔</div>
          <div className="absolute top-40 right-20 text-4xl opacity-30 animate-float-delayed">🌾</div>
          <div className="absolute bottom-20 left-20 text-5xl opacity-25 animate-bounce-gentle">🏺</div>
          <div className="absolute bottom-40 right-10 text-3xl opacity-20 animate-float">🕉️</div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-4 border border-white/30">
                    <SparklesIcon className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-white/90 text-lg font-medium">
                    {welcomeToMandi}
                  </span>
                </div>

                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  {indianAgriculture}
                  <span className="block text-yellow-300 bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent">
                    {mandiPlatform}
                  </span>
                </h1>

                <p className="text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
                  {platformDescription}
                </p>

                {/* Enhanced Search Bar */}
                <form onSubmit={handleSearch} className="mb-8">
                  <div className="flex max-w-md mx-auto lg:mx-0 shadow-2xl">
                    <div className="relative flex-1">
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={searchProducts}
                        className="w-full pl-12 pr-4 py-4 rounded-l-2xl border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 focus:outline-none text-lg shadow-inner"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold rounded-r-2xl transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {searchButton}
                    </button>
                  </div>
                </form>

                {/* Enhanced Quick Actions */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <Link
                    href="/listings"
                    className="inline-flex items-center px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <ShoppingBagIcon className="h-5 w-5 mr-2" />
                    {viewProducts}
                  </Link>
                  <Link
                    href="/listings/create"
                    className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
                    {sellProducts}
                  </Link>
                </div>
              </div>

              {/* Enhanced Right Illustration */}
              <div className="relative">
                <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
                  {/* Indian Marketplace Illustration */}
                  <div className="text-center">
                    <div className="text-8xl mb-4 animate-bounce-gentle">🏪</div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {digitalMandi}
                    </h3>
                    <p className="text-white/80 leading-relaxed">
                      {directConnection}
                    </p>
                  </div>

                  {/* Enhanced Floating Elements */}
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-3 rounded-full animate-bounce-gentle shadow-lg">
                    <ChatBubbleLeftRightIcon className="h-6 w-6" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-full animate-bounce-gentle shadow-lg" style={{ animationDelay: '1s' }}>
                    <TruckIcon className="h-6 w-6" />
                  </div>
                  <div className="absolute top-1/2 -right-8 bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-full animate-pulse shadow-lg">
                    <span className="text-sm font-bold">24/7</span>
                  </div>
                </div>

                {/* Enhanced Background Decorations */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 -left-12 w-16 h-16 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Categories */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {popularCategories}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {categoriesDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {quickCategories.map((category, index) => (
                <Link
                  key={index}
                  href={`/listings?category=${encodeURIComponent(category.nameEn)}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 group-hover:-translate-y-1 border border-gray-100">
                    <div className="text-center">
                      <div className="text-4xl mb-3">{category.icon}</div>
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
                        {category.name}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-primary-50 to-yellow-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
                    <stat.icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Features />
        <PopularCategories />
        <RecentListings />
        <HowItWorks />

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-700">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-6">
              {startToday}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {joinThousands}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/listings/create"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-200 text-lg"
              >
                <CurrencyRupeeIcon className="h-6 w-6 mr-2" />
                {startSelling}
              </Link>
              <Link
                href="/listings"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-colors duration-200 border border-white/20 text-lg"
              >
                <ShoppingBagIcon className="h-6 w-6 mr-2" />
                {startBuying}
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {},
  };
};