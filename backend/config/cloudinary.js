const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configure Cloudinary storage for videos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'spark-therapy/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    transformation: [{ quality: 'auto' }],
    chunk_size: 6000000 // 6MB chunks for large files
  }
});

// Create multer upload instance
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max file size
  }
});

module.exports = {
  cloudinary,
  upload
};
