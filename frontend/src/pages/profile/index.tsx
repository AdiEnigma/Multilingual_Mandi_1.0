import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useIntlayer } from 'next-intlayer';
import { toast } from 'react-hot-toast';
import { 
  UserIcon, 
  PhoneIcon, 
  MapPinIcon, 
  CurrencyRupeeIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  PlusIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  locationState?: string;
  locationDistrict?: string;
  userType: 'farmer' | 'trader' | 'consumer';
  createdAt: string;
}

interface UserStats {
  totalListings: number;
  activeListings: number;
  totalSales: number;
  totalPurchases: number;
}

export default function ProfilePage() {
  const { profile, aiInsights, createListing } = useIntlayer('common');
  const { user, isLoading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    locationState: '',
    locationDistrict: '',
    userType: 'farmer' as 'farmer' | 'trader' | 'consumer',
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserStats();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
        setFormData({
          name: profile.name || '',
          email: profile.email || '',
          locationState: profile.locationState || '',
          locationDistrict: profile.locationDistrict || '',
          userType: profile.userType || 'farmer',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const stats = await response.json();
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile(updatedProfile);
        setEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please login to view your profile</h2>
            <a href="/auth/login" className="text-primary-600 hover:text-primary-500">
              Go to Login
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{profile} - Marketplace Mandi</title>
        <meta name="description" content="Your Marketplace Mandi profile" />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-yellow-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* AI Insights Banner */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 mb-8 text-white">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse mr-3"></div>
                <h3 className="text-lg font-semibold">{aiInsights}</h3>
              </div>
              <p className="text-blue-100">
                Based on your activity, we recommend updating your profile with location details to get better local market prices and connect with nearby traders.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">User {profile}</h2>
                    <button
                      onClick={() => setEditing(!editing)}
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      {editing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  {editing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Enter your email"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            name="locationState"
                            value={formData.locationState}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Enter your state"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            District
                          </label>
                          <input
                            type="text"
                            name="locationDistrict"
                            value={formData.locationDistrict}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Enter your district"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            User Type
                          </label>
                          <select
                            name="userType"
                            value={formData.userType}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="farmer">Farmer</option>
                            <option value="trader">Trader</option>
                            <option value="consumer">Consumer</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200"
                      >
                        Update Profile
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center space-x-3">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium">{userProfile?.name || 'Not provided'}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">+91 {userProfile?.phoneNumber}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <MapPinIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">
                              {userProfile?.locationDistrict && userProfile?.locationState
                                ? `${userProfile.locationDistrict}, ${userProfile.locationState}`
                                : 'Not provided'
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">User Type</p>
                            <p className="font-medium capitalize">{userProfile?.userType}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <a
                      href="/listings/create"
                      className="flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      {createListing}
                    </a>
                    <a
                      href="/listings"
                      className="flex items-center justify-center w-full py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      <ShoppingBagIcon className="h-5 w-5 mr-2" />
                      Browse Products
                    </a>
                  </div>
                </div>

                {/* Stats */}
                {userStats && (
                  <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <ChartBarIcon className="h-5 w-5 text-blue-500" />
                          <span className="text-sm text-gray-600">Total Listings</span>
                        </div>
                        <span className="font-semibold text-gray-900">{userStats.totalListings}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <ShoppingBagIcon className="h-5 w-5 text-green-500" />
                          <span className="text-sm text-gray-600">Active Listings</span>
                        </div>
                        <span className="font-semibold text-gray-900">{userStats.activeListings}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CurrencyRupeeIcon className="h-5 w-5 text-yellow-500" />
                          <span className="text-sm text-gray-600">Total Sales</span>
                        </div>
                        <span className="font-semibold text-gray-900">₹{userStats.totalSales}</span>
                      </div>
                    </div>
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