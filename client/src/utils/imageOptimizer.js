/**
 * imageOptimizer.js
 * High-performance image optimization utilities for Ubaid Al Abayat.
 * Dynamically generates Cloudinary WebP / AVIF responsive srcSets and optimized URLs.
 */

export const DESKTOP_BANNER_WIDTHS = [1200, 1600, 1920, 2560];
export const MOBILE_BANNER_WIDTHS = [480, 640, 768, 900];

/**
 * Injects Cloudinary transformations into an image URL.
 * Falls back to the original URL if not hosted on Cloudinary.
 *
 * @param {string} url - Original image URL
 * @param {object} options - Optimization parameters
 * @returns {string} Optimized URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return '';

  // Only Cloudinary URLs can be transformed on the fly
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  const {
    width,
    height,
    format = 'auto', // 'auto' | 'webp' | 'avif' | 'jpg'
    quality = 'auto', // 'auto' | 'auto:best' | 'auto:good' | 'auto:eco'
    crop = 'limit', // 'limit' | 'fill' | 'scale'
  } = options;

  const transforms = [];

  if (format) transforms.push(`f_${format}`);
  if (quality) transforms.push(`q_${quality}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop && (width || height)) transforms.push(`c_${crop}`);

  const transformString = transforms.join(',');

  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  const prefix = url.substring(0, uploadIndex + 8);
  const suffix = url.substring(uploadIndex + 8);

  return `${prefix}${transformString}/${suffix}`;
};

/**
 * Generates an HTML responsive srcSet string for a given image URL.
 *
 * @param {string} url - Source image URL
 * @param {number[]} widths - Array of image widths in pixels
 * @param {string} format - Image format ('auto', 'webp', 'avif')
 * @returns {string} Standard srcSet string e.g. "url1 480w, url2 768w"
 */
export const generateSrcSet = (url, widths = DESKTOP_BANNER_WIDTHS, format = 'auto') => {
  if (!url || typeof url !== 'string') return '';

  // If not Cloudinary, return the original URL without descriptor
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  return widths
    .map((w) => {
      const optimizedUrl = getOptimizedImageUrl(url, {
        width: w,
        format: format,
        quality: 'auto:good',
        crop: 'limit',
      });
      return `${optimizedUrl} ${w}w`;
    })
    .join(', ');
};
