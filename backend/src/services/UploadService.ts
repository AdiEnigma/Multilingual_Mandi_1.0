import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@marketplace-mandi/shared';

export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
}

export interface IUploadService {
  uploadImage(file: Express.Multer.File): Promise<ApiResponse<UploadedFile>>;
  deleteImage(filename: string): Promise<ApiResponse<void>>;
  getImageUrl(filename: string): string;
}

export class UploadService implements IUploadService {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads', 'images');
    this.baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    this.ensureUploadDir();
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
      logger.info(`Created upload directory: ${this.uploadDir}`);
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<ApiResponse<UploadedFile>> {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return {
          success: false,
          error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
        };
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File size too large. Maximum size is 5MB.',
        };
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const filename = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(this.uploadDir, filename);

      // Save file
      await fs.writeFile(filePath, file.buffer);

      const uploadedFile: UploadedFile = {
        filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: this.getImageUrl(filename),
      };

      logger.info(`Image uploaded: ${filename}`);

      return {
        success: true,
        data: uploadedFile,
        message: 'Image uploaded successfully',
      };
    } catch (error) {
      logger.error('Error in uploadImage:', error);
      return {
        success: false,
        error: 'Failed to upload image',
      };
    }
  }

  async deleteImage(filename: string): Promise<ApiResponse<void>> {
    try {
      const filePath = path.join(this.uploadDir, filename);
      
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        logger.info(`Image deleted: ${filename}`);
      } catch {
        // File doesn't exist, which is fine
      }

      return {
        success: true,
        message: 'Image deleted successfully',
      };
    } catch (error) {
      logger.error('Error in deleteImage:', error);
      return {
        success: false,
        error: 'Failed to delete image',
      };
    }
  }

  getImageUrl(filename: string): string {
    return `${this.baseUrl}/uploads/images/${filename}`;
  }
}

// Export singleton instance
export const uploadService = new UploadService();