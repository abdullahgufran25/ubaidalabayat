const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Configure memory storage for Multer (essential for serverless read-only filesystems like Vercel)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// Configure Cloudinary if credentials are provided
let isCloudinaryConfigured = false;
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  isCloudinaryConfigured = true;
  console.log('Cloudinary service connected successfully.');
} else {
  console.log('Cloudinary not configured. Cannot process memory uploads.');
}

/**
 * Uploads a file buffer directly to Cloudinary using base64 URI
 * @param {Object} file - The file object from multer (using memoryStorage)
 * @returns {Promise<String>} The public URL of the uploaded image
 */
const uploadSingleImage = async (file) => {
  if (!file) return null;

  if (isCloudinaryConfigured) {
    try {
      // Convert image buffer to base64 Data URI
      const fileFormat = file.mimetype;
      const base64Data = file.buffer.toString('base64');
      const fileUri = `data:${fileFormat};base64,${base64Data}`;

      const result = await cloudinary.uploader.upload(fileUri, {
        folder: 'ubaid_al_abayat',
      });
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Image upload failed');
    }
  } else {
    throw new Error('Upload failed: Cloudinary is not configured on this serverless instance.');
  }
};

module.exports = {
  upload,
  uploadSingleImage,
};
