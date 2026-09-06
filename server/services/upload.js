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

// Configure storage options using os.tmpdir() to guarantee compatibility on Vercel serverless (read-only filesystem) & local
const uploadDir = path.join(os.tmpdir(), 'ubaidalabayat_uploads');
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    console.warn('Temporary directory creation note:', err.message);
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

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
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'ubaid_al_abayat',
      });
      // Delete temporary file from local storage
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      // Fallback: return relative path if Cloudinary fails
      return `/uploads/${file.filename}`;
    }
  } else {
    return `/uploads/${file.filename}`;
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
