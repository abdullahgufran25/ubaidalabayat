import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Send, AlertCircle, ChevronRight, ChevronLeft, MessageCircle, ZoomIn, Maximize2, X } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  
  // Fabric Magnifier Loupe & Lightbox States
  const imageContainerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const LENS_SIZE = 190; // Lens circle diameter in pixels
  const ZOOM_LEVEL = 3; // 3x Fabric Magnification

  const handleMouseMove = (e) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCursorPos({
      x: Math.max(0, Math.min(rect.width, x)),
      y: Math.max(0, Math.min(rect.height, y)),
    });
    if (containerSize.width !== rect.width || containerSize.height !== rect.height) {
      setContainerSize({ width: rect.width, height: rect.height });
    }
  };

  const handleMouseEnter = () => {
    if (imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    }
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const openLightbox = (index) => {
    const currentIdx = index !== undefined ? index : (product?.images?.indexOf(activeImage) >= 0 ? product.images.indexOf(activeImage) : 0);
    setLightboxIndex(currentIdx);
    setLightboxOpen(true);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight' && product?.images?.length) {
        setLightboxIndex((prev) => (prev + 1) % product.images.length);
      }
      if (e.key === 'ArrowLeft' && product?.images?.length) {
        setLightboxIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, product?.images]);
  
  // Selection States
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // Review Form States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isEligibleForReview, setIsEligibleForReview] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/products/slug/${slug}`);
        if (res.data.success) {
          const prod = res.data.data;
          setProduct(prod);
          setActiveImage(prod.images[0]);
          
          // Select default attributes if available
          if (prod.sizes && prod.sizes.length > 0) setSelectedSize(prod.sizes[0]);
          if (prod.colors && prod.colors.length > 0) setSelectedColor(prod.colors[0]);

          // Verify wishlist state
          const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
          setIsWishlisted(wishlist.includes(prod._id));

          // Fetch related products (same category)
          const relatedRes = await axios.get(`/api/products?category=${prod.category._id}&limit=5`);
          if (relatedRes.data.success) {
            setRelatedProducts(relatedRes.data.data.filter(p => p._id !== prod._id).slice(0, 4));
          }

          // Fetch reviews
          const reviewsRes = await axios.get(`/api/reviews/${prod._id}`);
          if (reviewsRes.data.success) {
            setReviews(reviewsRes.data.data);
          }

          // Check if customer can write a review (Logged in & Purchased this product & order is Delivered)
          if (user) {
            try {
              // We'll query orders endpoint to see if user purchased it
              const ordersRes = await axios.get('/api/orders/my-orders');
              if (ordersRes.data.success) {
                const orders = ordersRes.data.data;
                const hasPurchased = orders.some(order => 
                  order.orderStatus === 'Delivered' && 
                  order.items.some(item => item.product._id === prod._id || item.product === prod._id)
                );
                setIsEligibleForReview(hasPurchased);
              }
            } catch (err) {
              console.error(err);
            }
          }
        }
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [slug, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-light">
        <div className="animate-pulse space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-t-luxury-gold border-luxury-gray rounded-full animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-widest font-bold text-luxury-textGray">Loading Product Details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-light text-center px-4">
        <div>
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="font-sans text-lg font-bold uppercase tracking-wider mb-2">Product Not Found</h2>
          <p className="text-xs text-luxury-textGray mb-6">The product you are looking for does not exist or has been removed.</p>
          <Link to="/shop" className="luxury-btn text-[10px]">Return to Shop</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.stock === 0) {
      addToast('Product is sold out', 'error');
      return;
    }
    if (!selectedSize && product.sizes.length > 0) {
      addToast('Please select a size', 'warning');
      return;
    }
    if (!selectedColor && product.colors.length > 0) {
      addToast('Please select a color', 'warning');
      return;
    }

    addToCart(product, quantity, selectedSize, selectedColor);
    addToast('Product added to cart!', 'success');
  };

  const handleBuyNow = () => {
    if (product.stock === 0) return;
    handleAddToCart();
    navigate('/checkout');
  };

  const handleWhatsAppOrder = () => {
    const whatsappNum = settings.whatsappNumber || '03287512751';
    let cleanNumber = whatsappNum.replace(/[^\d]/g, '');
    if (cleanNumber.startsWith('03')) {
      cleanNumber = '92' + cleanNumber.substring(1);
    }
    const priceText = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;

    const message = `Hello Ubaid Al Abayat, I would like to order:
*Product:* ${product.name}
*SKU:* ${product.sku}
*Size:* ${selectedSize || 'Standard'}
*Color:* ${selectedColor || 'Standard'}
*Quantity:* ${quantity}
*Total Price:* PKR ${priceText * quantity}
Link: ${window.location.href}`;

    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const toggleWishlist = () => {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (isWishlisted) {
      wishlist = wishlist.filter((id) => id !== product._id);
      addToast('Removed from wishlist', 'info');
      setIsWishlisted(false);
    } else {
      wishlist.push(product._id);
      addToast('Added to wishlist', 'success');
      setIsWishlisted(true);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setReviewLoading(true);
    try {
      const res = await axios.post(`/api/reviews/${product._id}`, {
        rating,
        comment,
      });

      if (res.data.success) {
        addToast(res.data.message, 'success');
        setComment('');
        // Refresh reviews
        const reviewsRes = await axios.get(`/api/reviews/${product._id}`);
        if (reviewsRes.data.success) {
          setReviews(reviewsRes.data.data);
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const originalPrice = product.price;
  const salePrice = product.salePrice;
  const hasSale = salePrice && salePrice > 0 && salePrice < originalPrice;
  const discountPercent = hasSale ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-[10px] uppercase tracking-wider text-luxury-textGray">
        <Link to="/" className="hover:text-luxury-dark">Home</Link>
        <ChevronRight size={10} />
        <Link to="/shop" className="hover:text-luxury-dark">Shop</Link>
        <ChevronRight size={10} />
        <Link to={`/shop?category=${product.category?.slug}`} className="hover:text-luxury-dark">
          {product.category?.name}
        </Link>
        <ChevronRight size={10} />
        <span className="text-luxury-dark font-semibold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main product configuration layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
        
        {/* Gallery Column */}
        <div className="flex flex-col-reverse sm:flex-row gap-4">
          {/* Vertical Thumbnails */}
          <div className="flex sm:flex-col gap-2 flex-wrap sm:flex-nowrap justify-start sm:w-20">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={`aspect-[3/4] w-14 sm:w-full border overflow-hidden transition-all ${
                  activeImage === img ? 'border-luxury-dark ring-1 ring-luxury-dark shadow-sm scale-95' : 'border-luxury-gray hover:border-luxury-gold opacity-80 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Display image with Magnifier Glass Loupe */}
          <div 
            ref={imageContainerRef}
            className="flex-1 aspect-[3/4] bg-luxury-cream border border-luxury-gray overflow-hidden relative group cursor-crosshair select-none"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => openLightbox()}
          >
            {/* Base Full Image: Stays completely normal and unzoomed */}
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover pointer-events-none select-none"
            />

            {/* Magnifying Glass Lens: Only zooms the circular area directly under the cursor */}
            {isHovering && containerSize.width > 0 && (
              <div
                className="absolute rounded-full border-2 border-white/95 shadow-[0_4px_30px_rgba(0,0,0,0.5),0_0_0_1px_rgba(197,168,128,0.7)] overflow-hidden pointer-events-none z-20"
                style={{
                  width: `${LENS_SIZE}px`,
                  height: `${LENS_SIZE}px`,
                  left: `${cursorPos.x - LENS_SIZE / 2}px`,
                  top: `${cursorPos.y - LENS_SIZE / 2}px`,
                }}
              >
                {/* High-definition 3x Magnified Image inside the loupe */}
                <img
                  src={activeImage}
                  alt=""
                  className="absolute max-w-none object-cover pointer-events-none select-none"
                  style={{
                    width: `${containerSize.width * ZOOM_LEVEL}px`,
                    height: `${containerSize.height * ZOOM_LEVEL}px`,
                    left: `${-(cursorPos.x * ZOOM_LEVEL - LENS_SIZE / 2)}px`,
                    top: `${-(cursorPos.y * ZOOM_LEVEL - LENS_SIZE / 2)}px`,
                  }}
                />

                {/* Realistic Lens Glass Ring & Reflection */}
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/20 pointer-events-none bg-gradient-to-br from-white/25 via-transparent to-black/20" />
                {/* Center focus indicator */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-luxury-goldDark/70 shadow-sm pointer-events-none" />
              </div>
            )}

            {/* Hint overlay badge */}
            <div 
              className={`absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border border-luxury-gray/80 px-2.5 py-1 rounded shadow-sm text-[11px] font-medium text-luxury-dark flex items-center gap-1.5 pointer-events-none transition-opacity duration-200 ${
                isHovering ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <ZoomIn size={13} className="text-luxury-goldDark" />
              <span>Hover to Magnify Fabric</span>
            </div>

            {/* Expand / Fullscreen button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openLightbox();
              }}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-luxury-dark shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
              title="Fullscreen View"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* Configurations column */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-luxury-goldDark">
              {product.category?.name} Collection
            </p>
            <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-wide text-luxury-dark">
              {product.name}
            </h1>
            
            {/* Rating Stars Summary */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-luxury-gold">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    fill={star <= product.averageRating ? '#C5A880' : 'none'}
                    className={star <= product.averageRating ? 'text-luxury-gold' : 'text-gray-300'}
                  />
                ))}
                <span className="text-xs font-semibold text-luxury-dark ml-2">
                  {product.averageRating > 0 ? product.averageRating.toFixed(1) : 'No reviews'}
                </span>
              </div>
              <span className="text-xs text-luxury-textGray uppercase tracking-wider">
                SKU: <strong className="text-luxury-dark font-sans">{product.sku}</strong>
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-y border-luxury-gray py-4">
            <div className="text-xl sm:text-2xl font-bold font-sans">
              {hasSale ? (
                <div className="flex items-baseline space-x-3">
                  <span className="text-red-600 font-bold">PKR {salePrice}</span>
                  <span className="line-through text-sm text-luxury-textGray">PKR {originalPrice}</span>
                  <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ml-2">
                    Save {discountPercent}%
                  </span>
                </div>
              ) : (
                <span>PKR {originalPrice}</span>
              )}
            </div>
            <p className="text-[9px] uppercase tracking-wider text-luxury-textGray mt-1">
              Prices inclusive of all taxes. Cash on delivery available.
            </p>
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest font-bold text-luxury-gold">
                Select Color: <span className="text-luxury-dark font-sans font-medium">{selectedColor}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`border text-xs px-4 py-2 font-semibold uppercase tracking-wider transition-all ${
                      selectedColor === color
                        ? 'border-luxury-dark bg-luxury-dark text-white shadow-sm'
                        : 'border-luxury-gray bg-white text-luxury-dark hover:border-luxury-gold'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest font-bold text-luxury-gold">
                Select Size: <span className="text-luxury-dark font-sans font-medium">{selectedSize}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`border text-xs min-w-[48px] px-4 py-2.5 font-bold uppercase text-center tracking-wider transition-all inline-flex items-center justify-center ${
                      selectedSize === size
                        ? 'border-luxury-dark bg-luxury-dark text-white shadow-sm'
                        : 'border-luxury-gray bg-white text-luxury-dark hover:border-luxury-gold'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Stock Check */}
          <div className="flex items-center space-x-6">
            <span className="text-xs uppercase tracking-widest font-bold text-luxury-gold">
              Quantity:
            </span>
            <div className="flex items-center border border-luxury-gray bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={product.stock === 0}
                className="p-2 text-luxury-textGray hover:text-luxury-dark"
              >
                -
              </button>
              <span className="px-5 text-sm font-semibold">{product.stock === 0 ? 0 : quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={product.stock === 0 || quantity >= product.stock}
                className="p-2 text-luxury-textGray hover:text-luxury-dark"
              >
                +
              </button>
            </div>
            
            {/* Stock status indicator */}
            <div>
              {product.stock === 0 ? (
                <span className="text-xs uppercase tracking-widest font-bold text-red-600 bg-red-50 px-3 py-1.5 border border-red-100 rounded">
                  Sold Out
                </span>
              ) : product.stock <= 5 ? (
                <span className="text-xs uppercase tracking-widest font-bold text-yellow-700 bg-yellow-50 px-3 py-1.5 border border-yellow-100 rounded">
                  Low Stock (Only {product.stock} left)
                </span>
              ) : (
                <span className="text-xs uppercase tracking-widest font-bold text-green-700 bg-green-50 px-3 py-1.5 border border-green-100 rounded">
                  In Stock
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="luxury-btn py-4 text-xs font-semibold flex items-center justify-center space-x-2"
            >
              <ShoppingBag size={14} />
              <span>Add to Cart</span>
            </button>
            
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="luxury-btn-gold py-4 text-xs font-semibold"
            >
              Buy It Now
            </button>
          </div>

          {/* Social Integration & Wishlist toggler */}
          <div className="flex flex-col sm:flex-row gap-4 border-t border-luxury-gray pt-6">
            <button
              onClick={handleWhatsAppOrder}
              className="flex-1 border border-green-200 bg-green-50 text-green-800 py-3 text-xs uppercase tracking-widest font-bold rounded flex items-center justify-center hover:bg-green-100 transition-colors"
            >
              <MessageCircle size={16} className="mr-2 fill-green-800 text-green-50" />
              Order via WhatsApp
            </button>
            
            <button
              onClick={toggleWishlist}
              className="border border-luxury-gray bg-white text-luxury-dark py-3 px-6 text-xs uppercase tracking-widest font-bold rounded flex items-center justify-center hover:bg-luxury-cream transition-colors"
            >
              <Heart size={14} className="mr-2" fill={isWishlisted ? '#EF4444' : 'none'} />
              {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Tabs Details Accordion */}
          <div className="border border-luxury-gray bg-white mt-10">
            <div className="flex border-b border-luxury-gray text-xs uppercase tracking-wider font-semibold">
              <button
                onClick={() => setActiveTab('description')}
                className={`flex-1 py-3 text-center border-r border-luxury-gray ${activeTab === 'description' ? 'bg-luxury-cream font-bold' : 'hover:bg-gray-50'}`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`flex-1 py-3 text-center ${activeTab === 'shipping' ? 'bg-luxury-cream font-bold' : 'hover:bg-gray-50'}`}
              >
                Shipping & Returns
              </button>
            </div>
            
            <div className="p-5 text-xs text-luxury-textGray leading-relaxed">
              {activeTab === 'description' ? (
                <div className="space-y-3">
                  <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>🚚 <strong>Cash on Delivery (COD)</strong> available nationwide inside Pakistan. Delivery usually takes 3 to 5 business days.</p>
                  <p>📦 <strong>Shipping Policy:</strong> Standard shipping fee is PKR {settings.shippingCharges}. FREE shipping applies automatically to all orders above PKR {settings.freeShippingThreshold}!</p>
                  <p>🔄 <strong>Exchange & Return:</strong> Unworn, unwashed articles with original tags can be exchanged or returned within 7 days of delivery. Please read our Return policy link below.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Reviews Section */}
      <section className="border-t border-luxury-gray pt-10">
        <h2 className="font-sans text-xl sm:text-2xl font-bold uppercase tracking-wider mb-6 text-center">
          Reviews ({reviews.length})
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Review breakdown metrics */}
          <div className="bg-white p-6 border border-luxury-gray rounded flex flex-col justify-center items-center text-center">
            <h3 className="text-4xl font-sans font-bold text-luxury-dark">{product.averageRating.toFixed(1)}</h3>
            <div className="flex text-luxury-gold my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  fill={star <= product.averageRating ? '#C5A880' : 'none'}
                  className={star <= product.averageRating ? 'text-luxury-gold' : 'text-gray-300'}
                />
              ))}
            </div>
            <p className="text-xs uppercase tracking-wider text-luxury-textGray font-semibold">
              Based on {reviews.length} approved reviews
            </p>
          </div>

          {/* List of reviews */}
          <div className="lg:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <p className="text-xs italic text-luxury-textGray">
                No reviews yet. Be the first to review this product after purchase!
              </p>
            ) : (
              <div className="space-y-4 divide-y divide-luxury-gray">
                {reviews.map((rev) => (
                  <div key={rev._id} className="pt-4 first:pt-0">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-luxury-dark">{rev.userName}</p>
                      <span className="text-[10px] text-luxury-textGray">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex text-luxury-gold my-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={11}
                          fill={star <= rev.rating ? '#C5A880' : 'none'}
                          className={star <= rev.rating ? 'text-luxury-gold' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-luxury-textGray leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Write a review (Verified buyers only) */}
            {isEligibleForReview && (
              <div className="bg-white p-5 border border-luxury-gray rounded mt-6 space-y-4">
                <h4 className="font-sans text-sm font-bold uppercase tracking-wider border-b border-luxury-gray pb-2">
                  Share Your Experience
                </h4>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="text-xs font-semibold uppercase tracking-wider text-luxury-gold">Rating:</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className="text-luxury-gold hover:scale-110"
                        >
                          <Star size={16} fill={star <= rating ? '#C5A880' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-luxury-gold mb-2">Comment:</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Write your review here. Tell us about the fabric quality, sizing, and drape..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full text-xs border border-luxury-gray p-3 rounded focus:outline-none focus:border-luxury-gold"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="luxury-btn py-2 text-[10px] flex items-center"
                  >
                    <Send size={12} className="mr-2" />
                    <span>Submit Review</span>
                  </button>
                </form>
              </div>
            )}

            {!isEligibleForReview && (
              <div className="bg-luxury-light/50 border border-luxury-gray p-4 rounded mt-6 text-xs text-luxury-textGray leading-relaxed">
                <p className="font-bold text-luxury-dark uppercase tracking-wider text-[10px] mb-1">
                  Customer Reviews
                </p>
                <p>
                  Only verified patrons who have purchased and received this piece can submit a review.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-luxury-gray pt-10">
          <h2 className="font-sans text-xl sm:text-2xl font-bold uppercase tracking-wider text-center mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* High-Resolution Fullscreen Lightbox Modal */}
      {lightboxOpen && product?.images?.length > 0 && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Navigation Bar */}
          <div 
            className="flex items-center justify-between text-white px-2 sm:px-6 py-2 z-10 w-full max-w-6xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3">
              <span className="font-serif tracking-widest text-xs uppercase text-luxury-gold">Ubaid Al Abayat</span>
              <span className="text-white/40">•</span>
              <span className="text-xs font-light text-white/80 truncate max-w-xs">{product.name}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-xs text-white/60 font-mono tracking-wider">
                {lightboxIndex + 1} / {product.images.length}
              </span>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Close (Esc)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Center Main Image Stage */}
          <div 
            className="relative flex-1 flex items-center justify-center my-auto min-h-0 overflow-hidden w-full max-w-5xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Image Arrow */}
            {product.images.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const newIdx = (lightboxIndex - 1 + product.images.length) % product.images.length;
                  setLightboxIndex(newIdx);
                  setActiveImage(product.images[newIdx]);
                }}
                className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105"
                title="Previous Image (←)"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Displayed Lightbox Image */}
            <img
              src={product.images[lightboxIndex]}
              alt={`${product.name} - View ${lightboxIndex + 1}`}
              className="max-h-[75vh] max-w-[90vw] object-contain rounded shadow-2xl transition-all duration-300"
            />

            {/* Next Image Arrow */}
            {product.images.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const newIdx = (lightboxIndex + 1) % product.images.length;
                  setLightboxIndex(newIdx);
                  setActiveImage(product.images[newIdx]);
                }}
                className="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105"
                title="Next Image (→)"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {product.images.length > 1 && (
            <div 
              className="flex justify-center items-center gap-2 py-3 overflow-x-auto z-10 w-full max-w-md mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setLightboxIndex(i);
                    setActiveImage(img);
                  }}
                  className={`w-12 h-16 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${
                    lightboxIndex === i ? 'border-luxury-gold scale-105 shadow-lg' : 'border-white/20 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default ProductDetails;
