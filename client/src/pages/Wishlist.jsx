import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const Wishlist = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlistItems = async () => {
    const wishlistIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (wishlistIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const productPromises = wishlistIds.map(id =>
        axios.get(`/api/products/${id}`).then(res => res.data.data).catch(() => null)
      );
      
      const results = await Promise.all(productPromises);
      // Filter out any products that failed to load (null values)
      setProducts(results.filter(Boolean));
    } catch (err) {
      console.error('Error loading wishlist products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const removeFromWishlist = (id, e) => {
    e.preventDefault();
    e.stopPropagation();

    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    wishlist = wishlist.filter(wishId => wishId !== id);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    setProducts(prev => prev.filter(p => p._id !== id));
    addToast('Removed from wishlist', 'info');
    
    // Notify navbar to check status
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0) {
      addToast('Product is sold out', 'error');
      return;
    }

    if (product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'Free Size' && product.sizes[0] !== 'One Size') {
      navigate(`/product/${product.slug}`);
      addToast('Please select a size first', 'info');
      return;
    }

    const defaultSize = product.sizes[0] || 'Free Size';
    const defaultColor = product.colors[0] || 'Standard';

    addToCart(product, 1, defaultSize, defaultColor);
    addToast('Product added to cart!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-light">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-t-luxury-gold border-luxury-gray rounded-full animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-widest font-bold text-luxury-textGray">Loading Wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-serif font-bold uppercase tracking-wider border-b border-luxury-gray pb-4">
        My Wishlist
      </h1>

      {products.length === 0 ? (
        <div className="max-w-md mx-auto text-center space-y-6 py-12">
          <div className="inline-block p-6 bg-white border border-luxury-gray rounded-full text-luxury-gold shadow-sm">
            <Heart size={48} />
          </div>
          <h2 className="font-serif text-2xl font-bold uppercase tracking-wider">Wishlist is Empty</h2>
          <p className="text-xs text-luxury-textGray">
            You haven't saved any products to your wishlist yet. Browse our luxury Abaya and Hijab collections and tap the heart icon to save articles here!
          </p>
          <Link to="/shop" className="inline-block luxury-btn text-xs tracking-widest font-semibold px-8 py-3.5">
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((prod) => (
            <div
              key={prod._id}
              onClick={() => navigate(`/product/${prod.slug}`)}
              className="group bg-white border border-luxury-gray rounded overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              {/* Image Aspect */}
              <div className="relative aspect-[3/4] overflow-hidden bg-luxury-cream">
                <img
                  src={prod.images[0]}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Remove button */}
                <button
                  onClick={(e) => removeFromWishlist(prod._id, e)}
                  className="absolute top-2 right-2 p-2 bg-white bg-opacity-90 hover:bg-red-50 hover:text-red-500 rounded-full text-luxury-dark shadow transition-all"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Info Details */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-serif text-xs font-semibold text-luxury-dark leading-snug line-clamp-1">
                    {prod.name}
                  </h3>
                  <p className="text-[9px] text-luxury-textGray uppercase tracking-wider mt-0.5">
                    SKU: {prod.sku}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs font-semibold font-sans">
                    {prod.salePrice && prod.salePrice > 0 ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-red-600 font-bold">PKR {prod.salePrice}</span>
                        <span className="line-through text-[10px] text-luxury-textGray">PKR {prod.price}</span>
                      </div>
                    ) : (
                      <span>PKR {prod.price}</span>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(prod, e)}
                    disabled={prod.stock === 0}
                    className="p-2 border border-luxury-dark bg-luxury-dark text-white rounded hover:bg-luxury-gold hover:text-luxury-dark hover:border-luxury-gold transition-colors disabled:opacity-50"
                    title="Add to Cart"
                  >
                    <ShoppingBag size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
