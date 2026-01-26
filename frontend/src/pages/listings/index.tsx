import React, { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '@/components/Layout';
import { listingService, ListingFilters } from '@/services/listings';
import { ProductListing, PaginatedResponse } from '@marketplace-mandi/shared';

export default function ListingsPage() {
  const { t } = useTranslation('listings');
  
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  
  const [filters, setFilters] = useState<ListingFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadListings();
  }, [pagination.page, filters]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatPrice = (price: any) => {
    return `₹${price.amount}/${price.unit}`;
  };

  const formatLocation = (location: any) => {
    return `${location.district}, ${location.state}`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('allListings', 'All Listings')}
          </h1>
          <a
            href="/listings/create"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('createListing', 'Create Listing')}
          </a>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchListings', 'Search listings...')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('search', 'Search')}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">{t('loading', 'Loading listings...')}</p>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Image Placeholder */}
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">
                      {t('noImage', 'No Image')}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {listing.productName}
                  </h3>
                  
                  {listing.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {listing.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{t('price', 'Price')}:</span>
                      <span className="font-semibold text-green-600">
                        {formatPrice(listing.askingPrice)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{t('quantity', 'Quantity')}:</span>
                      <span className="text-sm">
                        {listing.quantity.amount} {listing.quantity.unit}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{t('location', 'Location')}:</span>
                      <span className="text-sm">
                        {formatLocation(listing.location)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{t('seller', 'Seller')}:</span>
                      <span className="text-sm">
                        {listing.seller?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      listing.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : listing.status === 'sold'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {t(listing.status, listing.status)}
                    </span>

                    <a
                      href={`/listings/${listing.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {t('viewDetails', 'View Details')}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && listings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {t('noListings', 'No listings found')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('noListingsDescription', 'There are no listings matching your criteria.')}
            </p>
            <a
              href="/listings/create"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('createFirstListing', 'Create First Listing')}
            </a>
          </div>
        )}

        {/* Pagination */}
        {!loading && listings.length > 0 && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {t('previous', 'Previous')}
            </button>

            <span className="px-4 py-2 text-sm text-gray-700">
              {t('pageInfo', 'Page {{current}} of {{total}}', {
                current: pagination.page,
                total: pagination.totalPages,
              })}
            </span>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {t('next', 'Next')}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'hi', ['common', 'listings'])),
    },
  };
};