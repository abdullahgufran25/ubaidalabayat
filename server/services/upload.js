const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const cloudinary = require('cloudinary').v2;

// Ensure environment variables are loaded
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  require('dotenv').config();
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });
}

// Configure memory storage for Multer (essential for serverless read-only filesystems like Vercel & fast in-memory handling)
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

const ensureCloudinary = () => {
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
    return true;
  }
  return false;
};

// Initial config check
let isCloudinaryConfigured = ensureCloudinary();
if (isCloudinaryConfigured) {
  console.log('Cloudinary service connected successfully.');
} else {
  console.log('Cloudinary not configured. Falling back to local storage uploads.');
}

/**
 * Uploads a file either to Cloudinary or keeps it locally
 * @param {Object} file - The file object from multer
 * @returns {Promise<String>} The public URL of the uploaded image
 */
const uploadSingleImage = async (file) => {
  if (!file) return null;

  if (ensureCloudinary()) {
    try {
      let uploadSource;
      if (file.buffer) {
        const fileFormat = file.mimetype || 'image/jpeg';
        const base64Data = file.buffer.toString('base64');
        uploadSource = `data:${fileFormat};base64,${base64Data}`;
      } else if (file.path) {
        uploadSource = file.path;
      } else {
        return null;
      }

      const result = await cloudinary.uploader.upload(uploadSource, {
        folder: 'ubaid_al_abayat',
      });
      // Delete temporary file from local storage if path exists
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      // Fallback: return relative path if local file exists
      if (file.filename) return `/uploads/${file.filename}`;
      throw new Error('Image upload failed: ' + error.message);
    }
  } else {
    if (file.filename) return `/uploads/${file.filename}`;
    throw new Error('Cloudinary not configured and file buffer cannot be saved locally on serverless.');
  }
};

/**
 * Deletes an image from Cloudinary or local storage
 * @param {String} imageUrl - The URL or path of the image to delete
 * @returns {Promise<Boolean>}
 */
const deleteImage = async (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return false;

  if (imageUrl.includes('res.cloudinary.com')) {
    if (ensureCloudinary()) {
      try {
        const splitUrl = imageUrl.split('/upload/');
        if (splitUrl.length > 1) {
          let publicIdWithPath = splitUrl[1];
          // Remove version prefix (e.g. v1788670204/)
          publicIdWithPath = publicIdWithPath.replace(/^v\d+\//, '');
          // Remove extension
          const lastDotIndex = publicIdWithPath.lastIndexOf('.');
          const publicId = lastDotIndex !== -1 ? publicIdWithPath.substring(0, lastDotIndex) : publicIdWithPath;

          const res = await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted Cloudinary asset (${publicId}):`, res);
          return true;
        }
      } catch (error) {
        console.error('Cloudinary deletion error:', error.message);
      }
    }
  } else if (imageUrl.startsWith('/uploads/')) {
    try {
      const filename = path.basename(imageUrl);
      const localPaths = [
        path.join(__dirname, '../uploads', filename),
        path.join(uploadDir, filename),
      ];
      for (const p of localPaths) {
        if (fs.existsSync(p)) {
          fs.unlinkSync(p);
        }
      }
      return true;
    } catch (error) {
      console.error('Local file deletion error:', error.message);
    }
  }
  return false;
};

module.exports = {
  upload,
  uploadSingleImage,
  deleteImage,
};
