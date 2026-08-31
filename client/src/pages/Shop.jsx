import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, X, ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ProductCard';

const Shop = () => {
  const navigate = useNavigate();
  const { categories } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Available Filter Constants
  const availableSizes = ['52', '54', '56', '58', 'Standard', 'Free Size'];
  const availableColors = ['Black', 'Beige', 'Emerald Green', 'Navy Blue', 'Deep Plum', 'Mocha', 'Sand Beige', 'Dusty Rose'];

  // Parse filters from URL query parameters
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = searchParams.get('page') || '1';
  const currentSearch = searchParams.get('search') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSizes = searchParams.get('sizes') ? searchParams.get('sizes').split(',') : [];
  const currentColors = searchParams.get('colors') ? searchParams.get('colors').split(',') : [];
  const currentNewArrival = searchParams.get('newArrival') === 'true';
  const currentBestseller = searchParams.get('bestseller') === 'true';
  const currentSale = searchParams.get('sale') === 'true';

  // Fetch products when query params change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (currentCategory) query.append('category', currentCategory);
        if (currentSort) query.append('sort', currentSort);
        if (currentPage) query.append('page', currentPage);
        if (currentSearch) query.append('search', currentSearch);
        if (currentMinPrice) query.append('minPrice', currentMinPrice);
        if (currentMaxPrice) query.append('maxPrice', currentMaxPrice);
        if (currentSizes.length > 0) query.append('sizes', currentSizes.join(','));
        if (currentColors.length > 0) query.append('colors', currentColors.join(','));
        if (currentNewArrival) query.append('newArrival', 'true');
        if (currentBestseller) query.append('bestseller', 'true');
        if (currentSale) query.append('inStock', 'true'); // or sale specific query mapping if defined

        // Load count of items
        query.append('limit', '12');

        const res = await axios.get(`/api/products?${query.toString()}`);
        if (res.data.success) {
          setProducts(res.data.data);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Error fetching shop products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredProducts();
    // Scroll window to top on page change
    window.scrollTo(0, 0);
  }, [searchParams]);

  // Update query params helper
  const updateQueryParam = (name, value, remove = false) => {
    const params = new URLSearchParams(searchParams);
    
    // Always reset page to 1 when filters are changed
    if (name !== 'page') {
      params.set('page', '1');
    }

    if (remove || !value) {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    setSearchParams(params);
  };

  // Toggle multiple value lists (sizes, colors)
  const toggleArrayFilter = (name, val) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    
    let list = params.get(name) ? params.get(name).split(',') : [];
    if (list.includes(val)) {
      list = list.filter((item) => item !== val);
    } else {
      list.push(val);
    }

    if (list.length === 0) {
      params.delete(name);
    } else {
      params.set(name, list.join(','));
    }
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams({ page: '1', sort: 'newest' }));
    setMobileFiltersOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Search Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-luxury-gray pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold uppercase tracking-wider">
            {currentCategory ? `${currentCategory} Collection` : 'Shop All Modesty'}
          </h1>
          {currentSearch && (
            <p className="text-xs text-luxury-textGray mt-1 uppercase tracking-wider">
              Search results for: <span className="font-bold text-luxury-dark">"{currentSearch}"</span>
            </p>
          )}
        </div>

        {/* Sort and mobile filter toggle */}
        <div className="flex items-center justify-between md:justify-end gap-4">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center text-xs uppercase tracking-wider font-semibold border border-luxury-gray px-4 py-2.5 bg-white hover:bg-luxury-cream transition-colors md:hidden"
          >
            <SlidersHorizontal size={14} className="mr-2" />
            Filters
          </button>

          <div className="flex items-center space-x-2">
            <ArrowUpDown size={14} className="text-luxury-textGray" />
            <select
              value={currentSort}
              onChange={(e) => updateQueryParam('sort', e.target.value)}
              className="border border-luxury-gray bg-white px-3 py-2 text-xs uppercase tracking-wider rounded font-medium focus:outline-none focus:border-luxury-gold"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Popularity</option>
              <option value="bestselling">Best Selling</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Filters & Grid */}
      <div className="flex gap-8 items-start">
        
        {/* Left Column: Filters Sidebar (Desktop) */}
        <aside className="w-64 flex-shrink-0 hidden md:block space-y-8 bg-white border border-luxury-gray p-6 rounded">
          
          <div className="flex justify-between items-center border-b border-luxury-gray pb-3">
            <span className="text-xs uppercase tracking-widest font-bold">Filters</span>
            <button
              onClick={clearAllFilters}
              className="text-[10px] text-luxury-goldDark uppercase tracking-wider font-semibold hover:underline"
            >
              Clear All
            </button>
          </div>

          {/* Categories Filter */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold">Category</h3>
            <div className="flex flex-col space-y-2 text-xs">
              <button
                onClick={() => updateQueryParam('category', '', true)}
                className={`text-left px-2 py-1 rounded transition-colors ${
                  !currentCategory ? 'bg-luxury-cream text-luxury-goldDark font-semibold' : 'hover:text-luxury-gold'
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateQueryParam('category', cat.slug)}
                  className={`text-left px-2 py-1 rounded transition-colors ${
                    currentCategory === cat.slug ? 'bg-luxury-cream text-luxury-goldDark font-semibold' : 'hover:text-luxury-gold'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes Filter */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold">Select Size</h3>
            <div className="grid grid-cols-3 gap-2">
              {availableSizes.map((size) => {
                const active = currentSizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => toggleArrayFilter('sizes', size)}
                    className={`border text-[10px] py-1.5 text-center font-semibold rounded uppercase tracking-wider transition-all ${
                      active
                        ? 'border-luxury-dark bg-luxury-dark text-white'
                        : 'border-luxury-gray bg-white text-luxury-dark hover:border-luxury-gold'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors Filter */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold">Select Color</h3>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((color) => {
                const active = currentColors.includes(color);
                return (
                  <button
                    key={color}
                    onClick={() => toggleArrayFilter('colors', color)}
                    className={`border text-[10px] px-3 py-1.5 font-semibold uppercase tracking-wider rounded transition-all ${
                      active
                        ? 'border-luxury-dark bg-luxury-dark text-white'
                        : 'border-luxury-gray bg-white text-luxury-dark hover:border-luxury-gold'
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold">Price Range</h3>
            <div className="flex items-center space-x-2 text-xs">
              <input
                type="number"
                placeholder="Min"
                value={currentMinPrice}
                onChange={(e) => updateQueryParam('minPrice', e.target.value)}
                className="w-full border border-luxury-gray px-2 py-1.5 rounded focus:outline-none focus:border-luxury-gold"
              />
              <span className="text-luxury-textGray">-</span>
              <input
                type="number"
                placeholder="Max"
                value={currentMaxPrice}
                onChange={(e) => updateQueryParam('maxPrice', e.target.value)}
                className="w-full border border-luxury-gray px-2 py-1.5 rounded focus:outline-none focus:border-luxury-gold"
              />
            </div>
          </div>

          {/* Flags Toggles */}
          <div className="space-y-3 border-t border-luxury-gray pt-4 text-xs font-semibold uppercase tracking-wider">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={currentNewArrival}
                onChange={(e) => updateQueryParam('newArrival', e.target.checked ? 'true' : '', !e.target.checked)}
                className="accent-luxury-dark h-4 w-4"
              />
              <span>New Arrivals Only</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={currentBestseller}
                onChange={(e) => updateQueryParam('bestseller', e.target.checked ? 'true' : '', !e.target.checked)}
                className="accent-luxury-dark h-4 w-4"
              />
              <span>Bestsellers Only</span>
            </label>
          </div>

        </aside>

        {/* Right Column: Products Grid */}
        <div className="flex-1 space-y-8">
          
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="animate-pulse space-y-4">
                  <div className="bg-gray-200 aspect-[3/4] w-full"></div>
                  <div className="h-4 bg-gray-200 w-3/4"></div>
                  <div className="h-4 bg-gray-200 w-1/4"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white border border-luxury-gray">
              <Grid3X3 size={32} className="mx-auto text-luxury-gold mb-3" />
              <h3 className="font-serif text-sm font-semibold uppercase tracking-wider mb-2">No Products Found</h3>
              <p className="text-xs text-luxury-textGray max-w-xs mx-auto">
                We couldn't find any products matching your select filter criteria. Try expanding your selections or clearing filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="luxury-btn text-[10px] mt-6"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Product Listing */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {products.map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 border-t border-luxury-gray pt-8 mt-12">
                  <button
                    disabled={!pagination.prev}
                    onClick={() => updateQueryParam('page', String(pagination.currentPage - 1))}
                    className="p-2 border border-luxury-gray rounded bg-white hover:bg-luxury-cream text-luxury-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="text-xs uppercase tracking-widest font-bold">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>

                  <button
                    disabled={!pagination.next}
                    onClick={() => updateQueryParam('page', String(pagination.currentPage + 1))}
                    className="p-2 border border-luxury-gray rounded bg-white hover:bg-luxury-cream text-luxury-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}

        </div>

      </div>

      {/* Mobile Drawer Filter (Responsive collapsed drawer) */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-luxury-dark bg-opacity-60 animate-fade-in">
          <div className="absolute inset-0" onClick={() => setMobileFiltersOpen(false)}></div>
          <div className="relative w-80 bg-luxury-light h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between z-10 animate-fade-in">
            <div className="space-y-6">
              
              <div className="flex justify-between items-center border-b border-luxury-gray pb-4">
                <span className="text-xs uppercase tracking-widest font-bold">Filter Catalog</span>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 hover:text-luxury-gold"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold">Category</h3>
                <div className="flex flex-col space-y-2 text-xs">
                  <button
                    onClick={() => { updateQueryParam('category', '', true); setMobileFiltersOpen(false); }}
                    className={`text-left px-2 py-1 rounded ${
                      !currentCategory ? 'bg-luxury-cream text-luxury-goldDark font-semibold' : ''
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => { updateQueryParam('category', cat.slug); setMobileFiltersOpen(false); }}
                      className={`text-left px-2 py-1 rounded ${
                        currentCategory === cat.slug ? 'bg-luxury-cream text-luxury-goldDark font-semibold' : ''
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold">Select Size</h3>
                <div className="grid grid-cols-3 gap-2">
                  {availableSizes.map((size) => {
                    const active = currentSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => toggleArrayFilter('sizes', size)}
                        className={`border text-[10px] py-1.5 text-center font-semibold rounded uppercase tracking-wider ${
                          active ? 'border-luxury-dark bg-luxury-dark text-white' : 'border-luxury-gray bg-white'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold">Select Color</h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => {
                    const active = currentColors.includes(color);
                    return (
                      <button
                        key={color}
                        onClick={() => toggleArrayFilter('colors', color)}
                        className={`border text-[10px] px-3 py-1.5 font-semibold uppercase tracking-wider rounded ${
                          active ? 'border-luxury-dark bg-luxury-dark text-white' : 'border-luxury-gray bg-white'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold">Price Range</h3>
                <div className="flex items-center space-x-2 text-xs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={currentMinPrice}
                    onChange={(e) => updateQueryParam('minPrice', e.target.value)}
                    className="w-full border border-luxury-gray px-2 py-1.5 rounded focus:outline-none"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={currentMaxPrice}
                    onChange={(e) => updateQueryParam('maxPrice', e.target.value)}
                    className="w-full border border-luxury-gray px-2 py-1.5 rounded focus:outline-none"
                  />
                </div>
              </div>

            </div>

            <div className="border-t border-luxury-gray pt-6 mt-8 space-y-4">
              <button
                onClick={clearAllFilters}
                className="w-full luxury-btn-outline py-2.5 text-[10px] text-center"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full luxury-btn py-2.5 text-[10px] text-center"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Shop;
