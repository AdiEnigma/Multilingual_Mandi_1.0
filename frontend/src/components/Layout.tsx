import React, { ReactNode } from 'react';
import Head from 'next/head';
import { useIntlayer } from 'next-intlayer';

import Header from '@/components/layout/Header';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ 
  children, 
  title, 
  description 
}: LayoutProps) {
  const { appName } = useIntlayer('common');
  
  const pageTitle = title || appName;
  const pageDescription = description || 'AI-powered multilingual marketplace for Indian farmers and traders';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>{children}</main>
        <footer className="bg-gray-800 text-white py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p>&copy; 2024 {appName}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}