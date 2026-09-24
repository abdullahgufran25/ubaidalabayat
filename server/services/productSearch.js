const Product = require('../models/product');

/**
 * Intelligent MongoDB Product and Variant Search Service
 * Optimizes queries for natural language and Roman Urdu
 */
class ProductSearchService {
  /**
   * Common colors & shade keywords in English and Roman Urdu
   */
  getColorKeywords() {
    return [
      'black', 'kala', 'kali', 'siyah',
      'brown', 'coffee', 'dark brown', 'light brown', 'chocolate', 'bhoora',
      'beige', 'cream', 'off white', 'nude',
      'white', 'safed', 'chitta',
      'navy', 'blue', 'neela', 'dark blue',
      'green', 'emerald', 'olive', 'hara', 'sabz',
      'maroon', 'burgundy', 'red', 'laal',
      'pink', 'dusty rose', 'gulabi',
      'plum', 'purple', 'jamni', 'deep plum',
      'grey', 'gray', 'slate',
      'teal', 'firozi',
    ];
  }

  /**
   * Clean and normalize search query
   */
  normalizeQuery(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract color keywords from user message
   */
  extractColors(text) {
    const normalized = this.normalizeQuery(text);
    const colors = this.getColorKeywords();
    const found = [];

    // Sort by length descending so "dark brown" matches before "brown"
    const sortedColors = [...colors].sort((a, b) => b.length - a.length);

    for (const color of sortedColors) {
      const regex = new RegExp(`\\b${color}\\b`, 'i');
      if (regex.test(normalized)) {
        found.push(color);
      }
    }

    return found;
  }

  /**
   * Search MongoDB for relevant products and variants
   * @param {string} userQuery - Customer natural language message
   * @param {Object} [options]
   * @returns {Promise<Array>} List of relevant products with variant details
   */
  async searchRelevantProducts(userQuery, options = {}) {
    const limit = options.limit || 5;
    const cleanQuery = this.normalizeQuery(userQuery);
    const extractedColors = this.extractColors(userQuery);

    // Stop-words to remove for keyword extraction
    const stopWords = new Set([
      'chahiye', 'chahye', 'hai', 'hain', 'ki', 'ka', 'ke', 'ko', 'se', 'me', 'mein',
      'bhejo', 'send', 'karo', 'dikhao', 'dikhayein', 'mujhe', 'humko', 'kya', 'konsa',
      'kaunsa', 'wali', 'wala', 'wale', 'kitny', 'kitna', 'kitne', 'price', 'rate',
      'available', 'stock', 'please', 'pls', 'batao', 'bataen', 'pic', 'pics', 'picture',
      'pictures', 'image', 'images', 'photo', 'photos', 'abaya', 'abayat', 'dress'
    ]);

    const queryWords = cleanQuery
      .split(' ')
      .filter((w) => w.length > 2 && !stopWords.has(w));

    const filter = { isActive: true };
    const searchConditions = [];

    // 1. Color matching
    if (extractedColors.length > 0) {
      const colorRegexes = extractedColors.map((c) => new RegExp(c, 'i'));
      searchConditions.push(
        { colors: { $in: colorRegexes } },
        { 'variants.color': { $in: colorRegexes } },
        { 'variants.shade': { $in: colorRegexes } },
        { name: { $in: colorRegexes } },
        { description: { $in: colorRegexes } }
      );
    }

    // 2. Keyword matching on name, sku, description
    if (queryWords.length > 0) {
      for (const word of queryWords) {
        const regex = new RegExp(word, 'i');
        searchConditions.push(
          { name: regex },
          { sku: regex },
          { description: regex },
          { 'variants.color': regex },
          { 'variants.shade': regex }
        );
      }
    }

    if (searchConditions.length > 0) {
      filter.$or = searchConditions;
    }

    // Execute query
    let products = await Product.find(filter)
      .populate('category', 'name slug')
      .limit(limit)
      .lean();

    // If no direct keyword/color match, fallback to featured / bestsellers so AI has store context
    if (products.length === 0) {
      products = await Product.find({ isActive: true })
        .populate('category', 'name slug')
        .sort({ bestseller: -1, newArrival: -1, createdAt: -1 })
        .limit(4)
        .lean();
    }

    // Format products for AI knowledge context
    return products.map((prod) => {
      const effectivePrice = prod.salePrice && prod.salePrice > 0 ? prod.salePrice : prod.price;
      const hasDiscount = prod.salePrice && prod.salePrice > 0 && prod.salePrice < prod.price;

      // Extract variants if defined
      const variants = (prod.variants && prod.variants.length > 0)
        ? prod.variants.map((v) => ({
            id: v._id ? String(v._id) : undefined,
            sku: v.sku || prod.sku,
            color: v.color || '',
            shade: v.shade || '',
            name: [v.shade, v.color].filter(Boolean).join(' ') || v.color || 'Standard',
            price: v.salePrice && v.salePrice > 0 ? v.salePrice : (v.price || effectivePrice),
            originalPrice: v.price || prod.price,
            stock: v.stock !== undefined ? v.stock : prod.stock,
            inStock: (v.stock !== undefined ? v.stock : prod.stock) > 0,
            sizes: (v.sizes && v.sizes.length > 0) ? v.sizes : prod.sizes,
            images: v.images && v.images.length > 0 ? v.images : prod.images,
          }))
        : (prod.colors || ['Standard']).map((color) => ({
            sku: prod.sku,
            color: color,
            shade: '',
            name: color,
            price: effectivePrice,
            originalPrice: prod.price,
            stock: prod.stock,
            inStock: prod.stock > 0,
            sizes: prod.sizes,
            images: prod.images,
          }));

      return {
        id: String(prod._id),
        name: prod.name,
        sku: prod.sku,
        category: prod.category?.name || 'Abaya',
        price: effectivePrice,
        originalPrice: prod.price,
        hasDiscount,
        discountPercentage: hasDiscount ? Math.round(((prod.price - prod.salePrice) / prod.price) * 100) : 0,
        stock: prod.stock,
        inStock: prod.stock > 0,
        availableSizes: prod.sizes || [],
        availableColors: prod.colors || [],
        description: prod.description || '',
        images: prod.images || [],
        variants,
      };
    });
  }

  /**
   * Find exact images for a specific product and color/shade
   * @param {Object} productDoc
   * @param {string} colorOrShade
   * @returns {Array<string>} Cloudinary image URLs
   */
  findImagesForColorOrVariant(productDoc, colorOrShade) {
    if (!productDoc) return [];
    const term = (colorOrShade || '').toLowerCase().trim();
    if (!term) return productDoc.images || [];

    // Check variants first
    if (productDoc.variants && productDoc.variants.length > 0) {
      // 1. Specific shade match (e.g. "coffee brown", "coffee", "dark brown")
      const shadeMatch = productDoc.variants.find((v) => {
        const vShade = (v.shade || '').toLowerCase().trim();
        return vShade && (vShade === term || term.includes(vShade) || vShade.includes(term));
      });
      if (shadeMatch && shadeMatch.images && shadeMatch.images.length > 0) {
        return shadeMatch.images;
      }

      // 2. Exact or specific color match
      const colorMatch = productDoc.variants.find((v) => {
        const vColor = (v.color || '').toLowerCase().trim();
        return vColor && (vColor === term || term.includes(vColor) || vColor.includes(term));
      });
      if (colorMatch && colorMatch.images && colorMatch.images.length > 0) {
        return colorMatch.images;
      }
    }

    // Default to main product images
    return productDoc.images || [];
  }
}

module.exports = new ProductSearchService();
