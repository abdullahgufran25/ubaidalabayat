import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  AlertCircle, 
  RefreshCw, 
  Image as ImageIcon, 
  ArrowLeft, 
  ArrowRight, 
  Star,
  Sparkles,
  Check,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Search,
  Flame,
  SlidersHorizontal,
  Percent,
  Tag
} from 'lucide-react';
import axios from 'axios';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

const Products = () => {
  const { categories } = useSettings();
  const { addToast } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Showcase Curator & Table Filter States
  const [showcaseModalOpen, setShowcaseModalOpen] = useState(false);
  const [showcaseType, setShowcaseType] = useState('newArrival'); // 'newArrival' | 'bestseller'
  const [showcaseNewArrivals, setShowcaseNewArrivals] = useState([]); // array of product IDs
  const [showcaseBestsellers, setShowcaseBestsellers] = useState([]); // array of product IDs
  const [showcaseSearch, setShowcaseSearch] = useState('');
  const [showcaseCategory, setShowcaseCategory] = useState('');
  const [showcaseSaving, setShowcaseSaving] = useState(false);
  const [tableFilter, setTableFilter] = useState('all'); // 'all' | 'newArrival' | 'bestseller' | 'draft'
  const [tableSearch, setTableSearch] = useState('');

  // Form States
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [sizes, setSizes] = useState('');
  const [colors, setColors] = useState('');
  const [description, setDescription] = useState('');
  
  // Custom Size State
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [sizeTab, setSizeTab] = useState('universal'); // 'universal' | 'numeric' | 'alpha'

  // Presets
  const NUMERIC_SIZES = ['50', '52', '54', '56', '58', '60'];
  const ALPHA_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
  const UNIVERSAL_SIZES = ['Standard', 'Free Size', 'Custom'];

  const selectedSizesList = sizes
    ? sizes.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const handleToggleSize = (sizeVal) => {
    if (selectedSizesList.includes(sizeVal)) {
      const next = selectedSizesList.filter((s) => s !== sizeVal);
      setSizes(next.join(', '));
    } else {
      setSizes([...selectedSizesList, sizeVal].join(', '));
    }
  };

  const handleAddCustomSize = (e) => {
    if (e) e.preventDefault();
    const val = customSizeInput.trim();
    if (!val) return;
    if (!selectedSizesList.includes(val)) {
      setSizes([...selectedSizesList, val].join(', '));
    }
    setCustomSizeInput('');
  };

  // Automatic Price & Discount Calculation Handlers
  const handlePriceChange = (val) => {
    setPrice(val);
    const numPrice = parseFloat(val);
    const numDisc = parseFloat(discountPercent);

    if (numPrice > 0 && numDisc > 0 && numDisc <= 100) {
      const calculatedSale = Math.round(numPrice * (1 - numDisc / 100));
      setSalePrice(calculatedSale > 0 ? String(calculatedSale) : '0');
    } else if (numPrice > 0 && salePrice && (!discountPercent || numDisc <= 0)) {
      const numSale = parseFloat(salePrice);
      if (numSale > 0 && numSale < numPrice) {
        const computedDisc = Math.round(((numPrice - numSale) / numPrice) * 100);
        setDiscountPercent(String(computedDisc));
      }
    } else if (!val) {
      setSalePrice('');
    }
  };

  const handleDiscountPercentChange = (val) => {
    if (val === '') {
      setDiscountPercent('');
      setSalePrice('');
      return;
    }

    const numDisc = parseFloat(val);
    if (isNaN(numDisc) || numDisc < 0) {
      setDiscountPercent('');
      setSalePrice('');
      return;
    }

    const clampedDisc = Math.min(100, Math.max(0, numDisc));
    setDiscountPercent(val);

    const numPrice = parseFloat(price);
    if (numPrice > 0) {
      if (clampedDisc === 0) {
        setSalePrice('');
      } else {
        const calculatedSale = Math.round(numPrice * (1 - clampedDisc / 100));
        setSalePrice(calculatedSale > 0 ? String(calculatedSale) : '0');
      }
    }
  };

  const handleApplyPresetDiscount = (pct) => {
    if (String(discountPercent) === String(pct)) {
      // Toggle off if already selected
      setDiscountPercent('');
      setSalePrice('');
      return;
    }
    setDiscountPercent(String(pct));
    const numPrice = parseFloat(price);
    if (numPrice > 0) {
      const calculatedSale = Math.round(numPrice * (1 - pct / 100));
      setSalePrice(calculatedSale > 0 ? String(calculatedSale) : '0');
    }
  };

  const handleClearDiscount = () => {
    setDiscountPercent('');
    setSalePrice('');
  };

  const handleSalePriceChange = (val) => {
    setSalePrice(val);
    const numSale = parseFloat(val);
    const numPrice = parseFloat(price);

    if (numPrice > 0 && numSale > 0 && numSale < numPrice) {
      const computedDisc = Math.round(((numPrice - numSale) / numPrice) * 100);
      setDiscountPercent(String(computedDisc));
    } else if (!val || numSale >= numPrice || numSale <= 0) {
      setDiscountPercent('');
    }
  };

  // Toggles
  const [featured, setFeatured] = useState(false);
  const [bestseller, setBestseller] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Images List with exact sequence & preview objects
  const [imageList, setImageList] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch all products on mount
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/products?limit=250'); // Load all for admin list
      if (res.data.success) {
        const prods = res.data.data;
        setProducts(prods);

        // Sync showcase lists ordered by sequence
        const naList = prods
          .filter((p) => p.newArrival)
          .sort((a, b) => (a.newArrivalOrder || 999) - (b.newArrivalOrder || 999))
          .map((p) => p._id);
        setShowcaseNewArrivals(naList);

        const bsList = prods
          .filter((p) => p.bestseller)
          .sort((a, b) => (a.bestsellerOrder || 999) - (b.bestsellerOrder || 999))
          .map((p) => p._id);
        setShowcaseBestsellers(bsList);
      }
    } catch (err) {
      addToast('Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickToggleFlag = async (productId, flag) => {
    const prod = products.find((p) => p._id === productId);
    if (!prod) return;
    const nextVal = !prod[flag];

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, [flag]: nextVal } : p))
    );

    if (flag === 'newArrival') {
      setShowcaseNewArrivals((prev) =>
        nextVal ? [...prev, productId] : prev.filter((id) => id !== productId)
      );
    } else if (flag === 'bestseller') {
      setShowcaseBestsellers((prev) =>
        nextVal ? [...prev, productId] : prev.filter((id) => id !== productId)
      );
    }

    try {
      const res = await axios.patch(`/api/products/${productId}/toggle`, { flag, value: nextVal });
      if (res.data.success) {
        addToast(
          `${flag === 'newArrival' ? 'New Arrival' : 'Best Seller'} ${nextVal ? 'enabled' : 'removed'} for "${prod.name}"`,
          'success'
        );
      }
    } catch (err) {
      // Revert if error
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, [flag]: !nextVal } : p))
      );
      addToast('Failed to update status', 'error');
    }
  };

  const handleToggleShowcaseItem = (type, productId) => {
    if (type === 'newArrival') {
      if (showcaseNewArrivals.includes(productId)) {
        setShowcaseNewArrivals(showcaseNewArrivals.filter((id) => id !== productId));
      } else {
        if (showcaseNewArrivals.length >= 16) {
          addToast('Note: Homepage grid shows maximum 16 items', 'info');
        }
        setShowcaseNewArrivals([...showcaseNewArrivals, productId]);
      }
    } else {
      if (showcaseBestsellers.includes(productId)) {
        setShowcaseBestsellers(showcaseBestsellers.filter((id) => id !== productId));
      } else {
        if (showcaseBestsellers.length >= 16) {
          addToast('Note: Homepage grid shows maximum 16 items', 'info');
        }
        setShowcaseBestsellers([...showcaseBestsellers, productId]);
      }
    }
  };

  const handleMoveShowcaseItem = (type, index, direction) => {
    const list = type === 'newArrival' ? [...showcaseNewArrivals] : [...showcaseBestsellers];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    if (type === 'newArrival') {
      setShowcaseNewArrivals(list);
    } else {
      setShowcaseBestsellers(list);
    }
  };

  const handleSaveShowcase = async (type) => {
    setShowcaseSaving(true);
    const productIds = type === 'newArrival' ? showcaseNewArrivals : showcaseBestsellers;
    try {
      const res = await axios.post('/api/products/home-showcase', { type, productIds });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchProducts();
        setShowcaseModalOpen(false);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save showcase', 'error');
    } finally {
      setShowcaseSaving(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0]._id);
    }
  }, [categories, category]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setName('');
    setSku('');
    setPrice('');
    setDiscountPercent('');
    setSalePrice('');
    setStock('');
    setCategory(categories[0]?._id || '');
    setSizes('Standard, Free Size, Custom');
    setSizeTab('universal');
    setColors('');
    setDescription('');
    setFeatured(false);
    setBestseller(false);
    setNewArrival(false);
    setIsActive(true);
    setImageList([]);
    setModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingId(product._id);
    setName(product.name);
    setSku(product.sku);
    setPrice(product.price);
    setSalePrice(product.salePrice || '');
    if (product.price && product.salePrice && Number(product.salePrice) < Number(product.price)) {
      const computedPct = Math.round(((Number(product.price) - Number(product.salePrice)) / Number(product.price)) * 100);
      setDiscountPercent(String(computedPct));
    } else {
      setDiscountPercent('');
    }
    setStock(product.stock);
    setCategory(product.category?._id || '');
    setSizes(product.sizes?.join(', ') || '');
    setColors(product.colors?.join(', ') || '');
    setDescription(product.description);
    setFeatured(product.featured || false);
    setBestseller(product.bestseller || false);
    setNewArrival(product.newArrival || false);
    setIsActive(product.isActive);
    
    // Load existing images into sequence gallery
    const existing = (product.images || []).map((imgUrl, idx) => ({
      id: `existing-${idx}-${Date.now()}`,
      type: 'existing',
      url: imgUrl,
      name: `Photo ${idx + 1}`,
    }));
    setImageList(existing);
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const newItems = selected.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}-${Math.random()}`,
      type: 'new',
      url: URL.createObjectURL(file),
      file: file,
      name: file.name,
    }));

    setImageList((prev) => [...prev, ...newItems]);
    e.target.value = ''; // Reset to allow re-selecting or adding more files sequentially
  };

  const handleMoveImage = (index, direction) => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= imageList.length) return;

    setImageList((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleSetCover = (index) => {
    if (index === 0) return;
    setImageList((prev) => {
      const updated = [...prev];
      const [item] = updated.splice(index, 1);
      updated.unshift(item);
      return updated;
    });
    addToast('Set as Main Cover photo (#1)', 'success');
  };

  const handleRemoveImage = (index) => {
    setImageList((prev) => {
      const item = prev[index];
      if (item && item.type === 'new' && item.url) {
        URL.revokeObjectURL(item.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      if (!file.type || !file.type.startsWith('image/')) {
        return resolve(file);
      }
      // If already very tiny (under 250KB), no need to compress
      if (file.size <= 250 * 1024) {
        return resolve(file);
      }
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.78
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !sku || !price || !stock || !category || !description) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }

    if (salePrice && price && Number(salePrice) >= Number(price)) {
      addToast('Sale price must be less than original price', 'warning');
      return;
    }

    if (imageList.length === 0) {
      addToast('Please select at least one product image', 'warning');
      return;
    }

    setSubmitLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('sku', sku);
    formData.append('price', price);
    formData.append('salePrice', salePrice);
    formData.append('stock', stock);
    formData.append('category', category);
    formData.append('sizes', sizes);
    formData.append('colors', colors);
    formData.append('description', description);
    formData.append('featured', featured ? 'true' : 'false');
    formData.append('bestseller', bestseller ? 'true' : 'false');
    formData.append('newArrival', newArrival ? 'true' : 'false');
    formData.append('isActive', isActive ? 'true' : 'false');

    // Build the final sequence order array strictly preserving user order
    const sequenceOrder = [];
    for (const item of imageList) {
      if (item.type === 'new' && item.file) {
        const processedFile = await compressImage(item.file);
        formData.append('images', processedFile);
        sequenceOrder.push({ type: 'new', name: processedFile.name });
      } else if (item.type === 'existing') {
        sequenceOrder.push({ type: 'existing', url: item.url });
      }
    }
    formData.append('finalImageOrder', JSON.stringify(sequenceOrder));

    try {
      let res;
      if (editingId) {
        // Edit API call
        res = await axios.put(`/api/products/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Create API call
        res = await axios.post('/api/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data.success) {
        addToast(res.data.message || 'Product saved successfully', 'success');
        setModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      console.error('Product save error:', err);
      let errorMsg = err.response?.data?.message;
      if (!errorMsg) {
        if (err.message === 'Network Error') {
          errorMsg = 'Network or server connection error. Please try uploading a smaller image or retry.';
        } else {
          errorMsg = err.message || 'Failed to save product';
        }
      }
      addToast(errorMsg, 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This will clear all transactions and review records.')) return;

    try {
      const res = await axios.delete(`/api/products/${id}`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchProducts();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete product', 'error');
    }
  };

  const filteredProducts = products.filter((prod) => {
    if (tableFilter === 'newArrival' && !prod.newArrival) return false;
    if (tableFilter === 'bestseller' && !prod.bestseller) return false;
    if (tableFilter === 'draft' && prod.isActive) return false;

    if (tableSearch) {
      const q = tableSearch.toLowerCase();
      const matchName = prod.name?.toLowerCase().includes(q);
      const matchSku = prod.sku?.toLowerCase().includes(q);
      const matchCat = prod.category?.name?.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-luxury-gray pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-sans font-bold uppercase tracking-wider">Products Catalog</h1>
          <p className="text-xs text-luxury-textGray uppercase tracking-widest mt-1">
            Create, Edit and Manage product catalog parameters
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setShowcaseType('newArrival');
              setShowcaseModalOpen(true);
            }}
            className="bg-luxury-gold text-luxury-dark hover:bg-luxury-goldDark font-bold px-3.5 py-2.5 rounded text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Sparkles size={14} />
            <span>Curate Homepage (16 & 16)</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="luxury-btn py-2.5 text-xs font-semibold tracking-widest flex items-center justify-center space-x-2"
          >
            <Plus size={14} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Catalog Table Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-lg text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setTableFilter('all')}
            className={`px-3 py-1.5 rounded transition-all ${
              tableFilter === 'all'
                ? 'bg-white text-luxury-dark shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setTableFilter('newArrival')}
            className={`px-3 py-1.5 rounded transition-all flex items-center space-x-1.5 ${
              tableFilter === 'newArrival'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <span>✦ New Arrivals</span>
            <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px]">
              {products.filter(p => p.newArrival).length}/16
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTableFilter('bestseller')}
            className={`px-3 py-1.5 rounded transition-all flex items-center space-x-1.5 ${
              tableFilter === 'bestseller'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <span>★ Best Sellers</span>
            <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px]">
              {products.filter(p => p.bestseller).length}/16
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTableFilter('draft')}
            className={`px-3 py-1.5 rounded transition-all ${
              tableFilter === 'draft'
                ? 'bg-white text-luxury-dark shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Drafts ({products.filter(p => !p.isActive).length})
          </button>
        </div>

        {/* Search in table */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Search article name or SKU..."
            className="w-full text-xs border border-luxury-gray px-3 py-2 rounded focus:outline-none focus:border-luxury-gold bg-white"
          />
        </div>
      </div>

      {/* Grid List Products Table */}
      {loading ? (
        <div className="py-20 text-center flex flex-col justify-center items-center text-xs uppercase tracking-widest text-luxury-textGray">
          <RefreshCw size={24} className="animate-spin text-luxury-gold mb-2" />
          <span>Loading products catalog...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-luxury-gray rounded p-12 text-center text-xs text-luxury-textGray uppercase tracking-wider">
          {products.length === 0 
            ? 'No products inside catalog database. Click "Add Product" to create your first article.' 
            : 'No products match the selected filter criteria.'}
        </div>
      ) : (
        <div className="bg-white border border-luxury-gray rounded overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-luxury-gray">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-luxury-goldDark font-bold">
                  <th className="p-4">Article</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-center">Stock</th>
                  <th className="p-4 text-center">Home Showcase (16)</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-gray">
                {filteredProducts.map((prod) => (
                  <tr key={prod._id} className="hover:bg-gray-55 transition-colors">
                    {/* Thumbnail & Name */}
                    <td className="p-4 flex items-center space-x-3">
                      <img src={prod.images?.[0]} alt="" className="w-10 h-12 object-cover border border-luxury-gray flex-shrink-0" />
                      <div>
                        <h4 className="font-sans font-bold text-luxury-dark leading-tight line-clamp-1">{prod.name}</h4>
                        <div className="flex space-x-2 mt-1">
                          {prod.featured && <span className="bg-purple-100 text-purple-700 text-[8px] font-bold uppercase tracking-wider px-1">Featured</span>}
                        </div>
                      </div>
                    </td>
                    
                    {/* SKU */}
                    <td className="p-4 font-mono font-bold uppercase">{prod.sku}</td>

                    {/* Category */}
                    <td className="p-4">{prod.category?.name || 'Uncategorized'}</td>

                    {/* Pricing */}
                    <td className="p-4 font-sans font-semibold">
                      {prod.salePrice ? (
                        <div className="flex flex-col">
                          <span className="text-red-600 font-bold">PKR {Number(prod.salePrice).toLocaleString()}</span>
                          <div className="flex items-center space-x-1">
                            <span className="line-through text-[10px] text-luxury-textGray">PKR {Number(prod.price).toLocaleString()}</span>
                            {Number(prod.price) > Number(prod.salePrice) && (
                              <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1 rounded">
                                {Math.round(((prod.price - prod.salePrice) / prod.price) * 100)}% OFF
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span>PKR {Number(prod.price).toLocaleString()}</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="p-4 text-center font-bold font-sans">
                      <span className={prod.stock === 0 ? 'text-red-600' : prod.stock <= 5 ? 'text-yellow-600' : 'text-luxury-dark'}>
                        {prod.stock}
                      </span>
                    </td>

                    {/* 1-Click Home Showcase Toggles */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickToggleFlag(prod._id, 'newArrival')}
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all border ${
                            prod.newArrival
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                              : 'bg-white text-gray-400 border-gray-200 hover:border-emerald-500 hover:text-emerald-700'
                          }`}
                          title={prod.newArrival ? 'Remove from Home New Arrivals' : 'Add to Home New Arrivals'}
                        >
                          {prod.newArrival ? '✓ New' : '+ New'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickToggleFlag(prod._id, 'bestseller')}
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all border ${
                            prod.bestseller
                              ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                              : 'bg-white text-gray-400 border-gray-200 hover:border-blue-500 hover:text-blue-700'
                          }`}
                          title={prod.bestseller ? 'Remove from Home Best Sellers' : 'Add to Home Best Sellers'}
                        >
                          {prod.bestseller ? '★ Best' : '+ Best'}
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded ${
                        prod.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                      }`}>
                        {prod.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(prod)}
                        className="p-2 border border-luxury-gray text-luxury-dark hover:bg-luxury-cream hover:border-luxury-gold transition-colors inline-block"
                        title="Edit Article"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(prod._id)}
                        className="p-2 border border-red-200 text-red-600 hover:bg-red-50 transition-colors inline-block"
                        title="Delete Product"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-luxury-dark bg-opacity-70 p-4 py-8 sm:py-12 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-4xl bg-luxury-light p-6 sm:p-8 shadow-2xl rounded border border-luxury-gray animate-fade-in space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-luxury-gray pb-3">
              <h3 className="font-sans text-lg font-bold uppercase tracking-wider">
                {editingId ? 'Edit Product Article' : 'Create New Product'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:text-luxury-gold">
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm border-2 border-luxury-gray p-2 px-3 rounded focus:outline-none focus:border-luxury-gold text-black font-medium placeholder-gray-400 bg-white"
                    placeholder="Classic Black Nidha Abaya"
                  />
                </div>

                {/* SKU */}
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">SKU Code *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingId}
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    className="w-full text-sm border-2 border-luxury-gray p-2 px-3 rounded focus:outline-none focus:border-luxury-gold text-black font-medium placeholder-gray-400 bg-white disabled:bg-gray-50 disabled:text-gray-405"
                    placeholder="AB-CLS-BLK"
                  />
                </div>

                {/* Pricing & Automatic % Discount Calculator */}
                <div className="sm:col-span-3 bg-luxury-cream/40 border border-luxury-gray p-4 rounded-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-gray-200/80 pb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark flex items-center space-x-1.5">
                          <Percent size={14} className="text-luxury-goldDark" />
                          <span>Pricing & Automatic % Discount Engine</span>
                        </label>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300">
                          Auto-Adjust
                        </span>
                      </div>
                      <p className="text-[10px] text-luxury-textGray mt-0.5">
                        Original Price aur Discount % likhein, after-discount price khud ba khud adjust ho jayegi.
                      </p>
                    </div>

                    {discountPercent && Number(discountPercent) > 0 && price && salePrice && (
                      <div className="inline-flex items-center space-x-1.5 bg-red-50 text-red-700 px-2.5 py-1 rounded text-xs font-bold border border-red-200 shadow-sm">
                        <Sparkles size={12} className="text-red-500" />
                        <span>{discountPercent}% OFF Active</span>
                        <span className="text-[10px] text-red-600 font-semibold ml-1">
                          (Save: PKR {(Number(price) - Number(salePrice)).toLocaleString()})
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. Original Price */}
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark block">
                        Original Price (PKR) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-bold">PKR</span>
                        <input
                          type="number"
                          required
                          min="0"
                          value={price}
                          onChange={(e) => handlePriceChange(e.target.value)}
                          className="w-full text-sm border-2 border-luxury-gray pl-12 pr-3 py-2 rounded focus:outline-none focus:border-luxury-gold text-black font-bold placeholder-gray-400 bg-white"
                          placeholder="7500"
                        />
                      </div>
                    </div>

                    {/* 2. Discount Percentage */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark flex items-center space-x-1">
                          <span>Discount (% Off)</span>
                        </label>
                        {discountPercent && (
                          <button
                            type="button"
                            onClick={handleClearDiscount}
                            className="text-[10px] uppercase font-bold text-red-600 hover:underline"
                          >
                            Clear %
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={discountPercent}
                          onChange={(e) => handleDiscountPercentChange(e.target.value)}
                          className="w-full text-sm border-2 border-luxury-gray pr-8 pl-3 py-2 rounded focus:outline-none focus:border-luxury-gold text-black font-bold placeholder-gray-400 bg-white"
                          placeholder="e.g. 20"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-bold">%</span>
                      </div>
                    </div>

                    {/* 3. Sale Price (After Discount) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">
                          After Discount Price (PKR)
                        </label>
                        {salePrice && price && Number(salePrice) < Number(price) && (
                          <span className="text-[9px] text-green-700 bg-green-100 border border-green-300 px-1.5 py-0.2 rounded font-bold uppercase">
                            Final Sale
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-bold">PKR</span>
                        <input
                          type="number"
                          min="0"
                          value={salePrice}
                          onChange={(e) => handleSalePriceChange(e.target.value)}
                          className={`w-full text-sm border-2 pl-12 pr-3 py-2 rounded focus:outline-none text-black font-bold placeholder-gray-400 bg-white transition-colors ${
                            salePrice && price && Number(salePrice) < Number(price)
                              ? 'border-green-600 bg-green-50/30 text-green-900 focus:border-green-600'
                              : 'border-luxury-gray focus:border-luxury-gold'
                          }`}
                          placeholder="Auto-calculated"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Preset % Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-gray-200/80">
                    <span className="text-[10px] uppercase font-bold text-gray-500 mr-1 flex items-center space-x-1">
                      <Tag size={11} />
                      <span>Quick % Off:</span>
                    </span>
                    {[10, 15, 20, 25, 30, 40, 50].map((pct) => {
                      const isSelected = String(discountPercent) === String(pct);
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleApplyPresetDiscount(pct)}
                          className={`text-xs px-2.5 py-1 rounded font-bold transition-all border ${
                            isSelected
                              ? 'bg-red-600 text-white border-red-700 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-luxury-gold hover:bg-white'
                          }`}
                        >
                          {pct}% OFF
                        </button>
                      );
                    })}
                    {salePrice && (
                      <button
                        type="button"
                        onClick={handleClearDiscount}
                        className="text-[10px] uppercase font-bold text-gray-500 hover:text-red-600 px-2 py-1 rounded border border-dashed border-gray-300 hover:border-red-300 bg-white ml-auto"
                      >
                        ✕ No Discount (Original Only)
                      </button>
                    )}
                  </div>
                </div>

                {/* Initial Stock */}
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">Inventory Stock *</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full text-sm border-2 border-luxury-gray p-2 px-3 rounded focus:outline-none focus:border-luxury-gold text-black font-medium placeholder-gray-400 bg-white"
                    placeholder="15"
                  />
                </div>

                {/* Category selector */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm border-2 border-luxury-gray p-2 px-3 rounded focus:outline-none focus:border-luxury-gold text-black font-medium bg-white"
                  >
                    <option value="" disabled>Select a Category *</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Size Manager */}
                <div className="sm:col-span-3 bg-gray-50/80 border border-luxury-gray p-4 rounded space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2">
                    <div>
                      <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark block">
                        Product Sizes (Presets + Custom)
                      </label>
                      <p className="text-[10px] text-luxury-textGray">
                        Click quick presets (Abaya 50-60 or Alpha S/M/L) or type your own custom sizes.
                      </p>
                    </div>

                    {/* Size category selector tabs */}
                    <div className="flex items-center space-x-1 bg-white p-1 border border-gray-200 rounded text-[10px] font-bold uppercase tracking-wider">
                      <button
                        type="button"
                        onClick={() => setSizeTab('universal')}
                        className={`px-2 py-1 rounded transition-colors ${sizeTab === 'universal' ? 'bg-luxury-dark text-white' : 'text-gray-600 hover:text-black'}`}
                      >
                        Standard / Free
                      </button>
                      <button
                        type="button"
                        onClick={() => setSizeTab('numeric')}
                        className={`px-2 py-1 rounded transition-colors ${sizeTab === 'numeric' ? 'bg-luxury-dark text-white' : 'text-gray-600 hover:text-black'}`}
                      >
                        Abaya (50-60)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSizeTab('alpha')}
                        className={`px-2 py-1 rounded transition-colors ${sizeTab === 'alpha' ? 'bg-luxury-dark text-white' : 'text-gray-600 hover:text-black'}`}
                      >
                        Alpha (S, M, L)
                      </button>
                    </div>
                  </div>

                  {/* Preset chips for active tab */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-500 mr-1">Quick Presets:</span>
                    {(sizeTab === 'numeric' ? NUMERIC_SIZES : sizeTab === 'alpha' ? ALPHA_SIZES : UNIVERSAL_SIZES).map((sz) => {
                      const isSelected = selectedSizesList.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleToggleSize(sz)}
                          className={`text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider border transition-all ${
                            isSelected
                              ? 'bg-luxury-gold text-luxury-dark border-luxury-goldDark shadow-sm'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-luxury-gold hover:bg-luxury-cream/30'
                          }`}
                        >
                          {isSelected ? `✓ ${sz}` : `+ ${sz}`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Size input row */}
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSize();
                        }
                      }}
                      placeholder="Type custom size (e.g. Small, Medium, Large, 48, Semi-Stitched)..."
                      className="flex-1 text-xs border border-gray-300 p-2 rounded bg-white font-medium focus:outline-none focus:border-luxury-gold"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSize}
                      disabled={!customSizeInput.trim()}
                      className="bg-luxury-dark text-white px-3 py-2 text-xs font-bold uppercase tracking-wider rounded hover:bg-luxury-gold hover:text-luxury-dark disabled:opacity-50 transition-colors"
                    >
                      + Add Size
                    </button>
                  </div>

                  {/* Active Selected Sizes display */}
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-600 block mb-1.5">
                      Selected Sizes for this Product ({selectedSizesList.length}):
                    </span>
                    {selectedSizesList.length === 0 ? (
                      <p className="text-[11px] text-amber-700 italic">No sizes selected yet. Click presets above or type a size.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSizesList.map((sz) => (
                          <span
                            key={sz}
                            className="inline-flex items-center space-x-1.5 bg-luxury-dark text-white text-xs px-2.5 py-1 rounded font-bold tracking-wider shadow-sm"
                          >
                            <span>{sz}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleSize(sz)}
                              className="text-gray-300 hover:text-red-400 font-bold ml-1"
                              title={`Remove size ${sz}`}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Color Input */}
                <div className="sm:col-span-3 bg-gray-50/80 border border-luxury-gray p-4 rounded space-y-2">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <div>
                      <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark block">
                        Product Color(s)
                      </label>
                      <p className="text-[10px] text-luxury-textGray">
                        Is item ka color yahan enter karein (maslan: Black ya Beige). Koi bhi color khud se add nahi hoga.
                      </p>
                    </div>
                    {colors && (
                      <button
                        type="button"
                        onClick={() => setColors('')}
                        className="text-[10px] uppercase font-bold text-red-600 hover:underline"
                      >
                        Clear Color
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                    placeholder="e.g. Black (agar 1 se zyada hon to: Black, Beige)"
                    className="w-full text-sm border-2 border-luxury-gray p-2 px-3 rounded focus:outline-none focus:border-luxury-gold text-black font-medium placeholder-gray-400 bg-white"
                  />

                  {/* Quick Click Color chips */}
                  <div className="flex flex-wrap gap-1.5 items-center pt-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500 mr-1">Quick Select (optional):</span>
                    {['Black', 'White', 'Beige', 'Navy Blue', 'Emerald Green', 'Maroon', 'Brown', 'Grey', 'Lilac', 'Dusty Rose', 'Deep Plum', 'Olive Green', 'Pink', 'Teal'].map((cName) => {
                      const currentArr = colors ? colors.split(',').map((s) => s.trim().toLowerCase()) : [];
                      const isSelected = currentArr.includes(cName.toLowerCase());
                      return (
                        <button
                          key={cName}
                          type="button"
                          onClick={() => {
                            const list = colors ? colors.split(',').map((s) => s.trim()).filter(Boolean) : [];
                            const exists = list.some((s) => s.toLowerCase() === cName.toLowerCase());
                            if (exists) {
                              setColors(list.filter((s) => s.toLowerCase() !== cName.toLowerCase()).join(', '));
                            } else {
                              setColors([...list, cName].join(', '));
                            }
                          }}
                          className={`text-xs px-2.5 py-1 rounded font-semibold border transition-all ${
                            isSelected
                              ? 'bg-luxury-gold text-luxury-dark border-luxury-goldDark font-bold shadow-sm'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-luxury-gold hover:bg-luxury-cream/30'
                          }`}
                        >
                          {isSelected ? `✓ ${cName}` : `+ ${cName}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">Detailed Description *</label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-sm border-2 border-luxury-gray p-2 px-3 rounded focus:outline-none focus:border-luxury-gold text-black font-medium placeholder-gray-400 bg-white"
                    placeholder="Fabric details, sleeve styles, package inclusions..."
                  />
                </div>

                {/* Product Images & Sequence Gallery */}
                <div className="sm:col-span-3 space-y-3 bg-gray-50/90 border border-luxury-gray p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2.5">
                    <div>
                      <div className="flex items-center space-x-2">
                        <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">
                          Product Images Sequence ({imageList.length})
                        </label>
                        {imageList.length > 0 && (
                          <span className="bg-luxury-gold/20 text-luxury-dark text-[10px] font-bold px-2 py-0.5 rounded border border-luxury-gold/40">
                            Strict Order Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-luxury-textGray mt-0.5">
                        Images will display on the store in this exact sequence. <strong>#1 COVER</strong> is the primary catalog photo.
                      </p>
                    </div>

                    {/* Add More Images Button */}
                    <label className="cursor-pointer inline-flex items-center space-x-1.5 bg-luxury-dark text-white hover:bg-luxury-gold hover:text-luxury-dark transition-colors px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider shadow-sm flex-shrink-0">
                      <Plus size={14} />
                      <span>Add Photos</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Empty state or upload dropzone if no images */}
                  {imageList.length === 0 ? (
                    <label className="border-2 border-dashed border-luxury-gray bg-white p-6 rounded flex flex-col justify-center items-center text-center space-y-2 hover:border-luxury-gold cursor-pointer transition-colors block">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <ImageIcon size={32} className="text-luxury-gold" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-luxury-dark">
                        Select Product Photos
                      </span>
                      <span className="text-[10px] text-luxury-textGray leading-relaxed max-w-sm">
                        Select multiple photos at once or add them one by one. You can arrange their sequence using the Left / Right controls.
                      </span>
                    </label>
                  ) : (
                    <div className="space-y-3">
                      {/* Grid of image sequence cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {imageList.map((item, idx) => {
                          const isCover = idx === 0;
                          return (
                            <div
                              key={item.id}
                              className={`relative bg-white rounded-lg border overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
                                isCover
                                  ? 'border-2 border-luxury-gold ring-2 ring-luxury-gold/30 shadow-md'
                                  : 'border-luxury-gray hover:border-gray-400'
                              }`}
                            >
                              {/* Top Bar: Position Badge & Remove Button */}
                              <div className="absolute top-1.5 left-1.5 right-1.5 z-10 flex items-center justify-between pointer-events-none">
                                {isCover ? (
                                  <span className="pointer-events-auto bg-luxury-gold text-luxury-dark font-black text-[9px] px-2 py-0.5 rounded shadow flex items-center space-x-1">
                                    <Star size={10} className="fill-luxury-dark" />
                                    <span>#1 COVER</span>
                                  </span>
                                ) : (
                                  <span className="pointer-events-auto bg-luxury-dark/90 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow">
                                    #{idx + 1} {idx === 1 ? '• Hover' : ''}
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="pointer-events-auto w-5 h-5 rounded-full bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center text-[10px] font-bold shadow transition-transform hover:scale-110"
                                  title="Remove image"
                                >
                                  ✕
                                </button>
                              </div>

                              {/* Thumbnail preview */}
                              <div className="aspect-[3/4] bg-luxury-cream overflow-hidden">
                                <img
                                  src={item.url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Card Controls Footer */}
                              <div className="p-1.5 bg-gray-50 border-t border-gray-100 flex flex-col space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                  {/* Move Left */}
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, 'left')}
                                    disabled={idx === 0}
                                    className="flex-1 py-1 px-1.5 bg-white border border-gray-300 rounded text-[10px] font-bold text-gray-700 hover:bg-luxury-gold hover:text-luxury-dark hover:border-luxury-gold disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-700 transition-colors flex items-center justify-center space-x-0.5"
                                    title="Move earlier in sequence"
                                  >
                                    <ArrowLeft size={10} />
                                    <span>Left</span>
                                  </button>

                                  {/* Move Right */}
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, 'right')}
                                    disabled={idx === imageList.length - 1}
                                    className="flex-1 py-1 px-1.5 bg-white border border-gray-300 rounded text-[10px] font-bold text-gray-700 hover:bg-luxury-gold hover:text-luxury-dark hover:border-luxury-gold disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-700 transition-colors flex items-center justify-center space-x-0.5"
                                    title="Move later in sequence"
                                  >
                                    <span>Right</span>
                                    <ArrowRight size={10} />
                                  </button>
                                </div>

                                {/* Set as Cover button if not already cover */}
                                {!isCover && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetCover(idx)}
                                    className="w-full py-0.5 px-1 bg-luxury-light hover:bg-luxury-gold hover:text-luxury-dark text-luxury-goldDark border border-luxury-gold/40 rounded text-[9px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-1"
                                    title="Make this photo the primary cover image"
                                  >
                                    <Star size={9} />
                                    <span>Set as Cover</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Helper status text */}
                      <p className="text-[10px] text-gray-500 italic">
                        Tip: Click <strong>"Left"</strong> or <strong>"Right"</strong> arrows to change sequence, or click <strong>"Set as Cover"</strong> to make any photo the #1 primary photo.
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Toggles check list */}
              <div className="border-t border-luxury-gray pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold uppercase tracking-wider">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newArrival}
                    onChange={(e) => setNewArrival(e.target.checked)}
                    className="accent-luxury-dark h-4 w-4"
                  />
                  <span>New Arrival</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bestseller}
                    onChange={(e) => setBestseller(e.target.checked)}
                    className="accent-luxury-dark h-4 w-4"
                  />
                  <span>Best Seller</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="accent-luxury-dark h-4 w-4"
                  />
                  <span>Featured Slide</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-luxury-dark h-4 w-4"
                  />
                  <span>Active Catalog</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="border-t border-luxury-gray pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="luxury-btn-outline py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="luxury-btn py-2 text-xs"
                >
                  {submitLoading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Homepage Showcase Curator Modal */}
      {showcaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-luxury-dark w-full max-w-5xl rounded-lg shadow-2xl my-auto flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-luxury-gray flex items-center justify-between bg-luxury-cream">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-luxury-gold flex items-center justify-center text-luxury-dark shadow-sm">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="font-sans text-base sm:text-lg font-bold uppercase tracking-wider text-luxury-dark">
                    Curate Homepage Products (16 & 16)
                  </h2>
                  <p className="text-[11px] text-luxury-textGray">
                    Select exactly which 16 articles appear on your Home page for New Arrivals and Best Sellers.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowcaseModalOpen(false)}
                className="text-gray-400 hover:text-black p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Showcase Type Tabs & Progress Bar */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 pt-3">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
                <div className="flex items-center space-x-2 bg-white p-1 border border-gray-200 rounded-lg text-xs font-bold uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => setShowcaseType('newArrival')}
                    className={`px-3.5 py-1.5 rounded transition-all flex items-center space-x-1.5 ${
                      showcaseType === 'newArrival'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <span>✦ New Arrivals</span>
                    <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px]">
                      {showcaseNewArrivals.length} / 16
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowcaseType('bestseller')}
                    className={`px-3.5 py-1.5 rounded transition-all flex items-center space-x-1.5 ${
                      showcaseType === 'bestseller'
                        ? 'bg-blue-700 text-white shadow-sm'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <span>★ Best Sellers</span>
                    <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px]">
                      {showcaseBestsellers.length} / 16
                    </span>
                  </button>
                </div>

                {/* Status Counter Badge */}
                {(() => {
                  const count = showcaseType === 'newArrival' ? showcaseNewArrivals.length : showcaseBestsellers.length;
                  if (count === 16) {
                    return (
                      <span className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded text-xs font-bold">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>Perfect! Exact 16 of 16 articles selected</span>
                      </span>
                    );
                  }
                  if (count < 16) {
                    return (
                      <span className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-800 border border-amber-300 px-3 py-1 rounded text-xs font-semibold">
                        <AlertCircle size={14} className="text-amber-600" />
                        <span>{count} of 16 selected ({16 - count} more needed to fill 4×4 grid)</span>
                      </span>
                    );
                  }
                  return (
                    <span className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-800 border border-blue-300 px-3 py-1 rounded text-xs font-semibold">
                      <AlertCircle size={14} className="text-blue-600" />
                      <span>{count} selected (First 16 will display on homepage)</span>
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

              {/* 1. CURRENT HOMEPAGE QUEUE */}
              {(() => {
                const currentList = showcaseType === 'newArrival' ? showcaseNewArrivals : showcaseBestsellers;
                const activeProducts = currentList
                  .map((id) => products.find((p) => p._id === id))
                  .filter(Boolean);

                return (
                  <div className="bg-gray-50 border border-luxury-gray p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-luxury-dark">
                          Current Homepage {showcaseType === 'newArrival' ? 'New Arrivals' : 'Best Sellers'} ({activeProducts.length})
                        </h3>
                        <p className="text-[10px] text-luxury-textGray">
                          Items will appear on the storefront in this sequence (Slot #1 to #16). Use ▲ and ▼ to reorder.
                        </p>
                      </div>
                      {currentList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Clear all selected ${showcaseType === 'newArrival' ? 'New Arrivals' : 'Best Sellers'}?`)) {
                              if (showcaseType === 'newArrival') setShowcaseNewArrivals([]);
                              else setShowcaseBestsellers([]);
                            }
                          }}
                          className="text-[10px] uppercase font-bold text-red-600 hover:underline"
                        >
                          Clear Selection
                        </button>
                      )}
                    </div>

                    {activeProducts.length === 0 ? (
                      <div className="text-center py-6 bg-white border border-dashed border-gray-300 rounded text-xs text-gray-500">
                        No articles selected yet for {showcaseType === 'newArrival' ? 'New Arrivals' : 'Best Sellers'}. Click <strong>"+ Select for Home"</strong> on products below.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                        {activeProducts.map((prod, idx) => {
                          const isExcess = idx >= 16;
                          return (
                            <div
                              key={prod._id}
                              className={`relative bg-white border rounded p-2 flex items-center space-x-2.5 shadow-sm transition-all ${
                                isExcess ? 'border-amber-300 bg-amber-50/50' : 'border-gray-200 hover:border-luxury-gold'
                              }`}
                            >
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded flex-shrink-0 ${
                                isExcess ? 'bg-amber-200 text-amber-800' : 'bg-luxury-dark text-white'
                              }`}>
                                #{idx + 1}
                              </span>
                              <img
                                src={prod.images?.[0]}
                                alt=""
                                className="w-9 h-11 object-cover rounded border flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <h5 className="font-bold text-[11px] truncate text-luxury-dark">{prod.name}</h5>
                                <p className="text-[10px] text-gray-500 font-mono">{prod.sku}</p>
                              </div>
                              <div className="flex flex-col space-y-1 flex-shrink-0">
                                <div className="flex items-center space-x-0.5">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveShowcaseItem(showcaseType, idx, 'up')}
                                    className="p-1 text-gray-500 hover:text-black disabled:opacity-20 transition-colors"
                                    title="Move earlier"
                                  >
                                    <ArrowUp size={11} />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === activeProducts.length - 1}
                                    onClick={() => handleMoveShowcaseItem(showcaseType, idx, 'down')}
                                    className="p-1 text-gray-500 hover:text-black disabled:opacity-20 transition-colors"
                                    title="Move later"
                                  >
                                    <ArrowDown size={11} />
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleToggleShowcaseItem(showcaseType, prod._id)}
                                  className="text-red-500 hover:text-red-700 text-[10px] font-bold text-center"
                                  title="Remove from showcase"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 2. AVAILABLE PRODUCTS TO SELECT FROM */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-luxury-dark">
                    Available Catalog Articles
                  </h3>
                  {/* Search and Category Filters */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <input
                      type="text"
                      value={showcaseSearch}
                      onChange={(e) => setShowcaseSearch(e.target.value)}
                      placeholder="Search article name or SKU..."
                      className="text-xs border border-gray-300 p-2 rounded bg-white w-full sm:w-56 focus:outline-none focus:border-luxury-gold"
                    />
                    <select
                      value={showcaseCategory}
                      onChange={(e) => setShowcaseCategory(e.target.value)}
                      className="text-xs border border-gray-300 p-2 rounded bg-white focus:outline-none focus:border-luxury-gold"
                    >
                      <option value="">All Categories</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Grid of catalog products */}
                {(() => {
                  const currentList = showcaseType === 'newArrival' ? showcaseNewArrivals : showcaseBestsellers;
                  const filteredCatalog = products.filter((prod) => {
                    if (showcaseCategory && prod.category?._id !== showcaseCategory && prod.category !== showcaseCategory) return false;
                    if (showcaseSearch) {
                      const q = showcaseSearch.toLowerCase();
                      const matchName = prod.name?.toLowerCase().includes(q);
                      const matchSku = prod.sku?.toLowerCase().includes(q);
                      if (!matchName && !matchSku) return false;
                    }
                    return true;
                  });

                  if (filteredCatalog.length === 0) {
                    return (
                      <div className="text-center py-10 bg-white border border-gray-200 rounded text-xs text-gray-500">
                        No matching articles found.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto pr-1">
                      {filteredCatalog.map((prod) => {
                        const isSelected = currentList.includes(prod._id);
                        const pos = currentList.indexOf(prod._id);

                        return (
                          <div
                            key={prod._id}
                            className={`bg-white border rounded-lg p-2.5 flex flex-col justify-between space-y-2 transition-all shadow-sm ${
                              isSelected
                                ? 'border-2 border-luxury-gold ring-1 ring-luxury-gold/30 bg-luxury-cream/20'
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <div className="relative aspect-[3/4] bg-gray-100 rounded overflow-hidden">
                              <img
                                src={prod.images?.[0]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              {isSelected && (
                                <span className="absolute top-1 left-1 bg-luxury-gold text-luxury-dark text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                                  #{pos + 1} On Home
                                </span>
                              )}
                            </div>

                            <div>
                              <h4 className="font-sans font-bold text-xs truncate text-luxury-dark" title={prod.name}>
                                {prod.name}
                              </h4>
                              <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mt-0.5">
                                <span>{prod.sku}</span>
                                <span className="font-sans font-bold text-luxury-dark">PKR {prod.salePrice || prod.price}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleShowcaseItem(showcaseType, prod._id)}
                              className={`w-full py-1.5 px-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-1 ${
                                isSelected
                                  ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                                  : 'bg-luxury-dark hover:bg-luxury-gold hover:text-luxury-dark text-white'
                              }`}
                            >
                              {isSelected ? (
                                <span>✕ Remove</span>
                              ) : (
                                <span>+ Select for Home</span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-luxury-gray flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50">
              <span className="text-xs text-luxury-textGray">
                {showcaseType === 'newArrival' ? showcaseNewArrivals.length : showcaseBestsellers.length} articles selected for Homepage {showcaseType === 'newArrival' ? 'New Arrivals' : 'Best Sellers'}.
              </span>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowcaseModalOpen(false)}
                  className="luxury-btn-outline py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={showcaseSaving}
                  onClick={() => handleSaveShowcase(showcaseType)}
                  className="luxury-btn py-2 px-6 text-xs font-bold uppercase tracking-wider disabled:opacity-50 flex items-center space-x-2"
                >
                  <Check size={14} />
                  <span>
                    {showcaseSaving
                      ? 'Saving...'
                      : `Save Homepage ${showcaseType === 'newArrival' ? 'New Arrivals' : 'Best Sellers'}`}
                  </span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
