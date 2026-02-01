import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useIntlayer } from 'next-intlayer';
import { toast } from 'react-hot-toast';
import { PhoneIcon, KeyIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login, aiInsights } = useIntlayer('common');
  const router = useRouter();
  const { login: authLogin, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    otp: '',
  });
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [showOtp, setShowOtp] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      // Send OTP request
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber }),
      });

      if (response.ok) {
        setStep('otp');
        toast.success('OTP sent successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.otp || formData.otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await authLogin(formData.phoneNumber, formData.otp);
      toast.success('Login successful!');
      router.push('/profile');
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <Head>
        <title>{login} - Marketplace Mandi</title>
        <meta name="description" content="Login to your Marketplace Mandi account" />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-yellow-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto h-20 w-20 bg-gradient-to-r from-primary-500 to-yellow-500 rounded-full flex items-center justify-center mb-6">
                <PhoneIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {login}
              </h2>
              <p className="text-gray-600">
                {step === 'phone' 
                  ? 'Enter your phone number to get started'
                  : 'Enter the OTP sent to your phone'
                }
              </p>
            </div>

            {/* AI Insights Panel */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium text-blue-800">{aiInsights}</span>
              </div>
              <p className="text-sm text-blue-700">
                {step === 'phone' 
                  ? 'AI suggests: Use your registered mobile number for faster verification'
                  : 'AI detected: OTP verification in progress. Check your messages.'
                }
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              {step === 'phone' ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Enter 10-digit phone number"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <KeyIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="otp"
                        name="otp"
                        type={showOtp ? 'text' : 'password'}
                        required
                        value={formData.otp}
                        onChange={handleInputChange}
                        placeholder="Enter 6-digit OTP"
                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                        maxLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOtp(!showOtp)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showOtp ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      OTP sent to +91 {formData.phoneNumber}
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  New to Marketplace Mandi?{' '}
                  <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}