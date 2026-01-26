import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/ui/LanguageSelector';

interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { isRTL } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: t('home'), href: '/', current: router.pathname === '/' },
    { name: t('listings'), href: '/listings', current: router.pathname.startsWith('/listings') },
    { name: t('search'), href: '/search', current: router.pathname === '/search' },
  ];

  const userNavigation = [
    { name: t('profile'), href: '/profile' },
    { name: t('dashboard'), href: '/dashboard' },
    { name: t('settings'), href: '/settings' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className={clsx('bg-white shadow-sm border-b border-gray-200', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {t('appName')}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  item.current
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search Icon (Mobile) */}
            <button
              type="button"
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => router.push('/search')}
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* Language Selector */}
            <LanguageSelector variant="compact" />

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md relative"
                >
                  <BellIcon className="h-5 w-5" />
                  {/* Notification badge */}
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* Messages */}
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md relative"
                  onClick={() => router.push('/messages')}
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  {/* Message badge */}
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                    2
                  </span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                    <UserCircleIcon className="h-6 w-6" />
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.name}
                    </span>
                  </button>

                  {/* User Dropdown */}
                  {isMobileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      {userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t('register')}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'block px-3 py-2 rounded-md text-base font-medium',
                    item.current
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {!isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;