import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search } from 'lucide-react';
import axios from 'axios';

const SearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Debounced search logic for autocomplete suggestions
  useEffect(() => {
    if (!keyword.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/products?search=${keyword}&limit=5`);
        if (res.data.success) {
          setSuggestions(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [keyword]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    onClose();
    navigate(`/shop?search=${encodeURIComponent(keyword.trim())}`);
  };

  const handleSuggestionClick = (slug) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-luxury-dark bg-opacity-70 pt-20 px-4 animate-fade-in">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Search Container */}
      <div className="relative w-full max-w-2xl bg-luxury-light p-6 shadow-2xl z-10 border border-luxury-gray animate-fade-in">
        
        {/* Header Close */}
        <div className="flex justify-between items-center mb-4">
          <span className="font-serif text-sm uppercase tracking-widest font-bold text-luxury-gold">
            Search Our Collection
          </span>
          <button onClick={onClose} className="p-1 hover:text-luxury-gold transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex border border-luxury-gray bg-white rounded shadow-inner">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by product name, fabric description, or SKU..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-4 py-3 text-sm focus:outline-none placeholder-gray-400"
          />
          <button type="submit" className="px-4 text-luxury-textGray hover:text-luxury-dark transition-colors">
            <Search size={18} />
          </button>
        </form>

        {/* Suggestions Panel */}
        {keyword.trim() && (
          <div className="mt-4 border-t border-luxury-gray pt-4">
            {loading ? (
              <div className="py-6 text-center text-xs uppercase tracking-wider text-luxury-textGray">
                Searching...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="py-6 text-center text-xs uppercase tracking-wider text-luxury-textGray">
                No matching products found.
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-wider text-luxury-gold font-bold mb-2">
                  Matching Products
                </p>
                {suggestions.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleSuggestionClick(product.slug)}
                    className="flex items-center space-x-4 p-2 hover:bg-white border border-transparent hover:border-luxury-gray cursor-pointer transition-all"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-12 object-cover border border-luxury-gray"
                    />
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold leading-tight">{product.name}</h4>
                      <p className="text-[9px] text-luxury-textGray uppercase tracking-wider mt-0.5">
                        SKU: {product.sku}
                      </p>
                    </div>
                    <div className="text-right text-xs font-bold font-sans">
                      {product.salePrice && product.salePrice > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-red-600">PKR {product.salePrice}</span>
                          <span className="text-[9px] line-through text-luxury-textGray">PKR {product.price}</span>
                        </div>
                      ) : (
                        <span>PKR {product.price}</span>
                      )}
                    </div>
                  </div>
                ))}

                {/* View all button */}
                <button
                  onClick={handleSubmit}
                  className="w-full text-center py-2 bg-luxury-dark text-white text-[10px] font-semibold uppercase tracking-widest hover:bg-luxury-gold hover:text-luxury-dark transition-colors mt-2"
                >
                  View All Matching Results
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchModal;
