const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class UploadService {
  constructor() {
    this.storage = multer.diskStorage({
      destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads', file.fieldname);
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    });

    this.fileFilter = (req, file, cb) => {
      const allowedMimes = {
        audio: ['audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/wav'],
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        document: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      };

      const type = file.fieldname.split('_')[0];
      if (allowedMimes[type] && allowedMimes[type].includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type for ${type}. Allowed types: ${allowedMimes[type].join(', ')}`), false);
      }
    };
  }

  // Audio upload middleware (30 seconds max, ~5MB)
  getAudioUpload() {
    return multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: parseInt(process.env.MAX_AUDIO_SIZE_MB) * 1024 * 1024 || 5 * 1024 * 1024,
      },
    }).single('audio_voice');
  }

  // Profile image upload
  getImageUpload() {
    return multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: parseInt(process.env.MAX_PROFILE_IMAGE_SIZE_MB) * 1024 * 1024 || 2 * 1024 * 1024,
      },
    }).single('image_profile');
  }

  // Document upload
  getDocumentUpload() {
    return multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB for documents
      },
    }).single('document_resume');
  }

  // Upload to cloud storage (placeholder - implement based on provider)
  async uploadToCloud(localFilePath, fileName) {
    // Implementation for DigitalOcean Spaces or AWS S3
    // This is a placeholder. Implement based on your chosen provider
    
    // For now, return local URL
    const cloudUrl = `/uploads/${path.basename(localFilePath)}`;
    
    return {
      success: true,
      url: cloudUrl,
      key: fileName,
    };
  }

  // Delete file
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new UploadService();
