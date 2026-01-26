import { apiClient as api } from '@/lib/api';
import {
  ProductListing,
  ApiResponse,
  PaginatedResponse,
  ProductCategory,
} from '@marketplace-mandi/shared';

export interface CreateListingData {
  productName: string;
  categoryId: string;
  description?: string;
  quantity: {
    amount: number;
    unit: string;
  };
  askingPrice: {
    amount: number;
    currency: 'INR';
    unit: string;
  };
  location: {
    state: string;
    district: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  images: string[];
  language: string;
}

export interface UpdateListingData {
  productName?: string;
  categoryId?: string;
  description?: string;
  quantity?: {
    amount: number;
    unit: string;
  };
  askingPrice?: {
    amount: number;
    currency: 'INR';
    unit: string;
  };
  location?: {
    state: string;
    district: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  images?: string[];
  status?: 'active' | 'sold' | 'expired' | 'draft';
}

export interface ListingFilters {
  sellerId?: string;
  categoryId?: string;
  status?: string;
  search?: string;
  state?: string;
  district?: string;
  pincode?: string;
  minPrice?: number;
  maxPrice?: number;
}

class ListingService {
  async createListing(data: CreateListingData): Promise<ApiResponse<ProductListing>> {
    try {
      const response = await api.post('/listings', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create listing',
      };
    }
  }

  async getListings(
    filters: ListingFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<ProductListing>>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined)
        ),
      });

      const response = await api.get(`/listings?${params}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get listings',
      };
    }
  }

  async getMyListings(
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<ProductListing>>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await api.get(`/listings/my?${params}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get your listings',
      };
    }
  }

  async getListingById(id: string): Promise<ApiResponse<ProductListing>> {
    try {
      const response = await api.get(`/listings/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get listing',
      };
    }
  }

  async updateListing(id: string, data: UpdateListingData): Promise<ApiResponse<ProductListing>> {
    try {
      const response = await api.put(`/listings/${id}`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update listing',
      };
    }
  }

  async deleteListing(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/listings/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete listing',
      };
    }
  }

  async uploadImage(file: File): Promise<ApiResponse<{ filename: string; url: string }>> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to upload image',
      };
    }
  }

  async uploadImages(files: File[]): Promise<ApiResponse<{ filename: string; url: string }[]>> {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await api.post('/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to upload images',
      };
    }
  }
}

// Category service
class CategoryService {
  async getCategories(): Promise<ApiResponse<ProductCategory[]>> {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get categories',
      };
    }
  }

  async getCategoryHierarchy(): Promise<ApiResponse<ProductCategory[]>> {
    try {
      const response = await api.get('/categories/hierarchy');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get category hierarchy',
      };
    }
  }

  async getCategoryById(id: string): Promise<ApiResponse<ProductCategory>> {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get category',
      };
    }
  }
}

export const listingService = new ListingService();
export const categoryService = new CategoryService();