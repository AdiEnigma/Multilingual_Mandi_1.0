import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '@/middleware/error';
import { authenticate } from '@/middleware/auth';
import { uploadService } from '@/services/UploadService';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// POST /api/upload/image - Upload single image (requires authentication)
router.post('/image', authenticate, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No image file provided',
    });
  }

  const result = await uploadService.uploadImage(req.file);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.status(201).json(result);
}));

// POST /api/upload/images - Upload multiple images (requires authentication)
router.post('/images', authenticate, upload.array('images', 5), asyncHandler(async (req, res) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No image files provided',
    });
  }

  const uploadPromises = files.map(file => uploadService.uploadImage(file));
  const results = await Promise.all(uploadPromises);

  const successfulUploads = results.filter(result => result.success);
  const failedUploads = results.filter(result => !result.success);

  if (failedUploads.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Some uploads failed',
      data: {
        successful: successfulUploads.map(result => result.data),
        failed: failedUploads.map(result => result.error),
      },
    });
  }

  res.status(201).json({
    success: true,
    data: successfulUploads.map(result => result.data),
    message: `${successfulUploads.length} images uploaded successfully`,
  });
}));

// DELETE /api/upload/image/:filename - Delete image (requires authentication)
router.delete('/image/:filename', authenticate, asyncHandler(async (req, res) => {
  const { filename } = req.params;

  const result = await uploadService.deleteImage(filename);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
}));

export default router;