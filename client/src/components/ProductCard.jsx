import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Check if product is in wishlist
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(wishlist.includes(product._id));
  }, [product._id]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (wishlist.includes(product._id)) {
      wishlist = wishlist.filter((id) => id !== product._id);
      addToast('Removed from wishlist', 'info');
      setIsWishlisted(false);
    } else {
      wishlist.push(product._id);
      addToast('Added to wishlist', 'success');
      setIsWishlisted(true);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    // Dispatch event to update navbar wishlist counter
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Abayas require size. If product has sizes, navigate to details to let them choose
    if (product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'Free Size' && product.sizes[0] !== 'One Size') {
      navigate(`/product/${product.slug}`);
      addToast('Please select a size first', 'info');
      return;
    }

    const defaultSize = product.sizes[0] || 'Free Size';
    const defaultColor = product.colors[0] || 'Standard';

    addToCart(product, 1, defaultSize, defaultColor);
    addToast('Added to cart successfully!', 'success');
  };

  const originalPrice = product.price;
  const salePrice = product.salePrice;
  const hasSale = salePrice && salePrice > 0 && salePrice < originalPrice;
  const discountPercent = hasSale ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;

  return (
    <div
      className="group relative bg-white border border-luxury-gray overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      
      {/* Product Image Section */}
      <div className="relative aspect-[3/4] bg-luxury-cream overflow-hidden">
        <Link to={`/product/${product.slug}`}>
          <img
            src={hovered && product.images[1] ? product.images[1] : product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Promo badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {hasSale && (
            <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
              -{discountPercent}% OFF
            </span>
          )}
          {product.newArrival && (
            <span className="bg-luxury-gold text-luxury-dark text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
              NEW
            </span>
          )}
          {product.bestseller && (
            <span className="bg-luxury-dark text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
              Best Seller
            </span>
          )}
        </div>

        {/* Wishlist Heart Icon Toggle */}
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 p-2 rounded-full bg-white bg-opacity-80 hover:bg-white text-luxury-dark hover:text-red-500 shadow-md transition-colors"
        >
          <Heart size={16} fill={isWishlisted ? '#EF4444' : 'none'} className={isWishlisted ? 'text-red-500' : ''} />
        </button>

        {/* Quick Hover Action buttons */}
        <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center space-x-2">
          <Link
            to={`/product/${product.slug}`}
            className="bg-white text-luxury-dark p-2 hover:bg-luxury-gold hover:text-luxury-dark transition-colors shadow-lg"
            title="View Details"
          >
            <Eye size={16} />
          </Link>
          <button
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className="bg-luxury-dark text-white p-2 hover:bg-luxury-gold hover:text-luxury-dark disabled:bg-gray-400 transition-colors shadow-lg"
            title={product.stock === 0 ? 'Out of Stock' : 'Quick Add to Cart'}
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>

      {/* Description Meta Section */}
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          {/* Rating */}
          {product.averageRating > 0 ? (
            <div className="flex items-center space-x-1 mb-1">
              <Star size={11} fill="#C5A880" className="text-luxury-gold" />
              <span className="text-[10px] font-semibold text-luxury-textGray">
                {product.averageRating.toFixed(1)}
              </span>
            </div>
          ) : (
            <div className="h-4"></div>
          )}

          {/* Title */}
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-serif text-sm sm:text-base font-semibold text-luxury-dark hover:text-luxury-gold transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-[10px] text-luxury-textGray tracking-wider uppercase mt-0.5">
            SKU: {product.sku}
          </p>
        </div>

        {/* Price & Out of stock flags */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm sm:text-base font-bold font-sans">
            {hasSale ? (
              <div className="flex items-center space-x-2">
                <span className="text-red-600 font-bold">PKR {salePrice}</span>
                <span className="line-through text-xs text-luxury-textGray">PKR {originalPrice}</span>
              </div>
            ) : (
              <span>PKR {originalPrice}</span>
            )}
          </div>

          {product.stock === 0 ? (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 px-2 py-0.5">
              Sold Out
            </span>
          ) : product.stock <= 5 ? (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-yellow-700 bg-yellow-50 border border-yellow-100 px-2 py-0.5">
              Only {product.stock} Left
            </span>
          ) : null}
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
