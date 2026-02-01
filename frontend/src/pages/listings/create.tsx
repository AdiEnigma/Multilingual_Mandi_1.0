import React from 'react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useIntlayer } from 'next-intlayer';
import Layout from '@/components/Layout';
import { CreateListingForm } from '@/components/listings/CreateListingForm';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateListingPage() {
  const { createListing } = useIntlayer('listings');
  const { home, listings } = useIntlayer('common');
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/listings/create');
    }
  }, [isAuthenticated, router]);

  const handleSuccess = (listing: any) => {
    // Redirect to the created listing or listings page
    router.push(`/listings/${listing.id}`);
  };

  const handleCancel = () => {
    router.push('/listings');
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                  {home}
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <a href="/listings" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                    {listings}
                  </a>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-sm font-medium text-gray-500">
                    {createListing}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <CreateListingForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {},
  };
};