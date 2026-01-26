import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { listingService, categoryService, CreateListingData } from '@/services/listings';
import { ProductCategory } from '@marketplace-mandi/shared';

interface CreateListingFormProps {
  onSuccess?: (listing: any) => void;
  onCancel?: () => void;
}

export function CreateListingForm({ onSuccess, onCancel }: CreateListingFormProps) {
  const { t } = useTranslation('listings');
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateListingData>({
    productName: '',
    categoryId: '',
    description: '',
    quantity: {
      amount: 0,
      unit: 'kg',
    },
    askingPrice: {
      amount: 0,
      currency: 'INR',
      unit: 'kg',
    },
    location: {
      state: user?.location?.state || '',
      district: user?.location?.district || '',
      pincode: user?.location?.pincode || '',
    },
    images: [],
    language: currentLanguage,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const result = await categoryService.getCategories();
    if (result.success) {
      setCategories(result.data || []);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateListingData] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateListingData] as any),
          [child]: numValue,
        },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await listingService.createListing(formData);
      
      if (result.success) {
        onSuccess?.(result.data);
      } else {
        setError(result.error || 'Failed to create listing');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">{t('createListing', 'Create New Listing')}</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
            {t('productName', 'Product Name')} *
          </label>
          <input
            type="text"
            id="productName"
            name="productName"
            value={formData.productName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('enterProductName', 'Enter product name')}
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
            {t('category', 'Category')} *
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('selectCategory', 'Select a category')}</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            {t('description', 'Description')}
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('enterDescription', 'Enter product description')}
          />
        </div>

        {/* Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantity.amount" className="block text-sm font-medium text-gray-700 mb-2">
              {t('quantity', 'Quantity')} *
            </label>
            <input
              type="number"
              id="quantity.amount"
              name="quantity.amount"
              value={formData.quantity.amount}
              onChange={handleNumberChange}
              min="0"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="quantity.unit" className="block text-sm font-medium text-gray-700 mb-2">
              {t('unit', 'Unit')} *
            </label>
            <select
              id="quantity.unit"
              name="quantity.unit"
              value={formData.quantity.unit}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="kg">{t('kg', 'Kg')}</option>
              <option value="gram">{t('gram', 'Gram')}</option>
              <option value="ton">{t('ton', 'Ton')}</option>
              <option value="piece">{t('piece', 'Piece')}</option>
              <option value="dozen">{t('dozen', 'Dozen')}</option>
              <option value="liter">{t('liter', 'Liter')}</option>
            </select>
          </div>
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="askingPrice.amount" className="block text-sm font-medium text-gray-700 mb-2">
              {t('askingPrice', 'Asking Price')} (₹) *
            </label>
            <input
              type="number"
              id="askingPrice.amount"
              name="askingPrice.amount"
              value={formData.askingPrice.amount}
              onChange={handleNumberChange}
              min="0"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="askingPrice.unit" className="block text-sm font-medium text-gray-700 mb-2">
              {t('priceUnit', 'Price Unit')} *
            </label>
            <select
              id="askingPrice.unit"
              name="askingPrice.unit"
              value={formData.askingPrice.unit}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="kg">{t('perKg', 'Per Kg')}</option>
              <option value="gram">{t('perGram', 'Per Gram')}</option>
              <option value="ton">{t('perTon', 'Per Ton')}</option>
              <option value="piece">{t('perPiece', 'Per Piece')}</option>
              <option value="dozen">{t('perDozen', 'Per Dozen')}</option>
              <option value="liter">{t('perLiter', 'Per Liter')}</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="location.state" className="block text-sm font-medium text-gray-700 mb-2">
              {t('state', 'State')} *
            </label>
            <input
              type="text"
              id="location.state"
              name="location.state"
              value={formData.location.state}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="location.district" className="block text-sm font-medium text-gray-700 mb-2">
              {t('district', 'District')} *
            </label>
            <input
              type="text"
              id="location.district"
              name="location.district"
              value={formData.location.district}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="location.pincode" className="block text-sm font-medium text-gray-700 mb-2">
              {t('pincode', 'Pincode')} *
            </label>
            <input
              type="text"
              id="location.pincode"
              name="location.pincode"
              value={formData.location.pincode}
              onChange={handleInputChange}
              required
              pattern="[0-9]{6}"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t('cancel', 'Cancel')}
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('creating', 'Creating...') : t('createListing', 'Create Listing')}
          </button>
        </div>
      </form>
    </div>
  );
}