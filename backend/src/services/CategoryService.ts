import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { ApiResponse, ProductCategory } from '@marketplace-mandi/shared';

export interface CreateCategoryData {
  name: string;
  parentId?: string;
}

export interface ICategoryService {
  createCategory(data: CreateCategoryData): Promise<ApiResponse<ProductCategory>>;
  getCategoryById(id: string): Promise<ApiResponse<ProductCategory>>;
  getAllCategories(): Promise<ApiResponse<ProductCategory[]>>;
  getCategoryHierarchy(): Promise<ApiResponse<ProductCategory[]>>;
  updateCategory(id: string, data: Partial<CreateCategoryData>): Promise<ApiResponse<ProductCategory>>;
  deleteCategory(id: string): Promise<ApiResponse<void>>;
}

export class CategoryService implements ICategoryService {
  async createCategory(data: CreateCategoryData): Promise<ApiResponse<ProductCategory>> {
    try {
      // Validate parent category if provided
      if (data.parentId) {
        const parentCategory = await prisma.category.findUnique({
          where: { id: data.parentId },
        });

        if (!parentCategory) {
          return {
            success: false,
            error: 'Parent category not found',
          };
        }
      }

      // Create category
      const category = await prisma.category.create({
        data: {
          name: data.name,
          parentId: data.parentId,
        },
        include: {
          parent: true,
          children: true,
        },
      });

      logger.info(`Category created: ${category.id} - ${category.name}`);

      return {
        success: true,
        data: this.transformCategory(category),
        message: 'Category created successfully',
      };
    } catch (error) {
      logger.error('Error in createCategory:', error);
      return {
        success: false,
        error: 'Failed to create category',
      };
    }
  }

  async getCategoryById(id: string): Promise<ApiResponse<ProductCategory>> {
    try {
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          parent: true,
          children: true,
        },
      });

      if (!category) {
        return {
          success: false,
          error: 'Category not found',
        };
      }

      return {
        success: true,
        data: this.transformCategory(category),
      };
    } catch (error) {
      logger.error('Error in getCategoryById:', error);
      return {
        success: false,
        error: 'Failed to get category',
      };
    }
  }

  async getAllCategories(): Promise<ApiResponse<ProductCategory[]>> {
    try {
      const categories = await prisma.category.findMany({
        include: {
          parent: true,
          children: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      const transformedCategories = categories.map((category: any) => this.transformCategory(category));

      return {
        success: true,
        data: transformedCategories,
      };
    } catch (error) {
      logger.error('Error in getAllCategories:', error);
      return {
        success: false,
        error: 'Failed to get categories',
      };
    }
  }

  async getCategoryHierarchy(): Promise<ApiResponse<ProductCategory[]>> {
    try {
      // Get root categories (no parent)
      const rootCategories = await prisma.category.findMany({
        where: {
          parentId: null,
        },
        include: {
          children: {
            include: {
              children: true, // Support 2-level hierarchy for now
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      const transformedCategories = rootCategories.map((category: any) => this.transformCategoryWithHierarchy(category));

      return {
        success: true,
        data: transformedCategories,
      };
    } catch (error) {
      logger.error('Error in getCategoryHierarchy:', error);
      return {
        success: false,
        error: 'Failed to get category hierarchy',
      };
    }
  }

  async updateCategory(id: string, data: Partial<CreateCategoryData>): Promise<ApiResponse<ProductCategory>> {
    try {
      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        return {
          success: false,
          error: 'Category not found',
        };
      }

      // Validate parent category if provided
      if (data.parentId) {
        const parentCategory = await prisma.category.findUnique({
          where: { id: data.parentId },
        });

        if (!parentCategory) {
          return {
            success: false,
            error: 'Parent category not found',
          };
        }

        // Prevent circular reference
        if (data.parentId === id) {
          return {
            success: false,
            error: 'Category cannot be its own parent',
          };
        }
      }

      // Update category
      const updatedCategory = await prisma.category.update({
        where: { id },
        data,
        include: {
          parent: true,
          children: true,
        },
      });

      logger.info(`Category updated: ${id}`);

      return {
        success: true,
        data: this.transformCategory(updatedCategory),
        message: 'Category updated successfully',
      };
    } catch (error) {
      logger.error('Error in updateCategory:', error);
      return {
        success: false,
        error: 'Failed to update category',
      };
    }
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    try {
      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
        where: { id },
        include: {
          children: true,
          listings: true,
        },
      });

      if (!existingCategory) {
        return {
          success: false,
          error: 'Category not found',
        };
      }

      // Check if category has children
      if (existingCategory.children.length > 0) {
        return {
          success: false,
          error: 'Cannot delete category with subcategories',
        };
      }

      // Check if category has listings
      if (existingCategory.listings.length > 0) {
        return {
          success: false,
          error: 'Cannot delete category with active listings',
        };
      }

      // Delete category
      await prisma.category.delete({
        where: { id },
      });

      logger.info(`Category deleted: ${id}`);

      return {
        success: true,
        message: 'Category deleted successfully',
      };
    } catch (error) {
      logger.error('Error in deleteCategory:', error);
      return {
        success: false,
        error: 'Failed to delete category',
      };
    }
  }

  /**
   * Transform database category to API format
   */
  private transformCategory(category: any): ProductCategory {
    return {
      id: category.id,
      name: category.name,
      parentId: category.parentId,
      subcategories: category.children ? category.children.map((child: any) => this.transformCategory(child)) : undefined,
    };
  }

  /**
   * Transform category with full hierarchy
   */
  private transformCategoryWithHierarchy(category: any): ProductCategory {
    return {
      id: category.id,
      name: category.name,
      parentId: category.parentId,
      subcategories: category.children ? category.children.map((child: any) => this.transformCategoryWithHierarchy(child)) : undefined,
    };
  }
}

// Export singleton instance
export const categoryService = new CategoryService();