import React, { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import { useIntlayer } from 'next-intlayer';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  MapPinIcon,
  CurrencyRupeeIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

import Layout from '@/components/Layout';
import { listingService, ListingFilters } from '@/services/listings';
import { ProductListing } from '@marketplace-mandi/shared';

interface AIInsight {
  type: 'price_trend' | 'demand_forecast' | 'quality_tip' | 'market_alert';
  title: string;
  description: string;
  confidence: number;
}

export default function ListingsPage() {
  const { search, searchProducts, aiInsights } = useIntlayer('common');
  const router = useRouter();
  
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ListingFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    // Get search query from URL
    const { search: urlSearch, category } = router.query;
    if (urlSearch) {
      setSearchQuery(urlSearch as string);
      setFilters(prev => ({ ...prev, search: urlSearch as string }));
    }
    if (category) {
      setFilters(prev => ({ ...prev, category: category as string }));
    }
    
    loadListings();
    fetchAIInsights();
  }, [router.query]);

  const loadListings = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await listingService.getListings(filters, pagination.page, pagination.limit);
      
      if (result.success && result.data) {
        setListings(result.data.data);
        setPagination(result.data.pagination);
      } else {
        setError(result.error || 'Failed to load listings');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchAIInsights = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/insights`);
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (filters.categoryId) params.append('category', filters.categoryId);
    
    router.push(`/listings?${params.toString()}`);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'price_trend':
        return <ChartBarIcon className="h-5 w-5 text-blue-500" />;
      case 'demand_forecast':
        return <SparklesIcon className="h-5 w-5 text-purple-500" />;
      case 'quality_tip':
        return <SparklesIcon className="h-5 w-5 text-green-500" />;
      case 'market_alert':
        return <SparklesIcon className="h-5 w-5 text-red-500" />;
      default:
        return <SparklesIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatPrice = (price: any) => {
    return `₹${price.amount}/${price.unit}`;
  };

  const formatLocation = (location: any) => {
    return `${location.district}, ${location.state}`;
  };

  return (
    <>
      <Head>
        <title>Product Listings - Marketplace Mandi</title>
        <meta name="description" content="Browse agricultural products from farmers and traders across India" />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-yellow-50">
          {/* Search Header */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchProducts}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200"
                >
                  {search}
                </button>
                <button
                  type="button"
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <FunnelIcon className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* AI Insights Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-6">
                  <div className="flex items-center mb-4">
                    <SparklesIcon className="h-6 w-6 text-blue-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">{aiInsights}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {insights.length > 0 ? insights.map((insight, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-start space-x-3">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                            <div className="mt-2 flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-500 h-1.5 rounded-full" 
                                  style={{ width: `${insight.confidence}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-xs text-gray-500">{insight.confidence}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="space-y-3">
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <div className="flex items-start space-x-3">
                            <ChartBarIcon className="h-5 w-5 text-green-500" />
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm">Price Trend Alert</h4>
                              <p className="text-xs text-gray-600 mt-1">Tomato prices are expected to rise by 15% next week due to seasonal demand.</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                          <div className="flex items-start space-x-3">
                            <SparklesIcon className="h-5 w-5 text-purple-500" />
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm">Quality Tip</h4>
                              <p className="text-xs text-gray-600 mt-1">Look for firm, bright red tomatoes with smooth skin for best quality.</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                          <div className="flex items-start space-x-3">
                            <SparklesIcon className="h-5 w-5 text-yellow-500" />
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm">Market Alert</h4>
                              <p className="text-xs text-gray-600 mt-1">High demand for organic vegetables in your area. Consider listing organic products.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Listings Grid */}
              <div className="lg:col-span-3">
                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 animate-pulse">
                        <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : listings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                      <div key={listing.id} className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                        <div className="relative h-48 bg-gradient-to-br from-primary-100 to-yellow-100">
                          {listing.images && listing.images.length > 0 ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.productName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-6xl opacity-50">🌾</div>
                            </div>
                          )}
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                            {listing.category?.name || 'Uncategorized'}
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                            {listing.productName}
                          </h3>
                          {listing.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {listing.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center text-primary-600">
                              <CurrencyRupeeIcon className="h-5 w-5 mr-1" />
                              <span className="text-xl font-bold">
                                {listing.askingPrice.amount}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">
                                /{listing.askingPrice.unit}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {listing.quantity.amount} {listing.quantity.unit}
                            </div>
                          </div>
                          
                          <div className="flex items-center text-gray-500 text-sm mb-4">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            <span>{formatLocation(listing.location)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-400">
                              By {listing.seller?.name || 'User'}
                            </div>
                            <Link
                              href={`/listings/${listing.id}`}
                              className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all categories.</p>
                    <Link
                      href="/listings/create"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200"
                    >
                      Create First Listing
                    </Link>
                  </div>
                )}

                {/* Pagination */}
                {!loading && listings.length > 0 && pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page <= 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                    >
                      Previous
                    </button>

                    <span className="px-4 py-2 text-sm text-gray-700">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {},
  };
};