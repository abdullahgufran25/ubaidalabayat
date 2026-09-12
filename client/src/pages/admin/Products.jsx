import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, RefreshCw, Image as ImageIcon, ArrowLeft, ArrowRight, Star } from 'lucide-react';
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

  // Form States
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [sizes, setSizes] = useState('');
  const [colors, setColors] = useState('');
  const [description, setDescription] = useState('');
  
  // Custom Size & Color State
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customColorInput, setCustomColorInput] = useState('');
  const [sizeTab, setSizeTab] = useState('numeric'); // 'numeric' | 'alpha' | 'universal'

  // Presets
  const NUMERIC_SIZES = ['50', '52', '54', '56', '58', '60'];
  const ALPHA_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
  const UNIVERSAL_SIZES = ['Standard', 'Free Size', 'Custom'];
  const POPULAR_COLORS = [
    { name: 'Black', hex: '#111827' },
    { name: 'Beige', hex: '#D2B48C' },
    { name: 'Emerald Green', hex: '#065F46' },
    { name: 'Navy Blue', hex: '#1E3A8A' },
    { name: 'Deep Plum', hex: '#581C87' },
    { name: 'Mocha', hex: '#78350F' },
    { name: 'Sand Beige', hex: '#E6D7B9' },
    { name: 'Dusty Rose', hex: '#BE185D' },
    { name: 'Maroon', hex: '#831843' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Olive Green', hex: '#3F6212' },
    { name: 'Brown', hex: '#713F12' },
    { name: 'Grey', hex: '#6B7280' },
    { name: 'Lilac', hex: '#C084FC' },
    { name: 'Burgundy', hex: '#881337' },
    { name: 'Teal', hex: '#0F766E' },
  ];

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

  const selectedColorsList = colors
    ? colors.split(',').map((c) => c.trim()).filter(Boolean)
    : [];

  const handleToggleColor = (colorVal) => {
    if (selectedColorsList.includes(colorVal)) {
      const next = selectedColorsList.filter((c) => c !== colorVal);
      setColors(next.join(', '));
    } else {
      setColors([...selectedColorsList, colorVal].join(', '));
    }
  };

  const handleAddCustomColor = (e) => {
    if (e) e.preventDefault();
    const val = customColorInput.trim();
    if (!val) return;
    if (!selectedColorsList.includes(val)) {
      setColors([...selectedColorsList, val].join(', '));
    }
    setCustomColorInput('');
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
      const res = await axios.get('/api/products?limit=100'); // Load all for admin list
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      addToast('Failed to fetch products', 'error');
    } finally {
      setLoading(false);
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
    setSalePrice('');
    setStock('');
    setCategory(categories[0]?._id || '');
    setSizes('52,54,56,58');
    setColors('Black,Beige,Navy');
    setDescription('');
    setFeatured(false);
    setBestseller(false);
    setNewArrival(true);
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

  const handleCoverFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const coverItem = {
      id: `new-cover-${Date.now()}`,
      type: 'new',
      url: URL.createObjectURL(file),
      file: file,
      name: file.name,
    };
    setImageList((prev) => [coverItem, ...prev]);
    e.target.value = '';
    addToast('Front Cover photo added as #1!', 'success');
  };

  const handleJumpToPosition = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= imageList.length) return;
    setImageList((prev) => {
      const updated = [...prev];
      const [item] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, item);
      return updated;
    });
    if (toIndex === 0) {
      addToast('Photo set as #1 Front Cover!', 'success');
    }
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
    for (let i = 0; i < imageList.length; i++) {
      const item = imageList[i];
      if (item.type === 'new' && item.file) {
        const processedFile = await compressImage(item.file);
        const indexedFilename = `${String(i).padStart(2, '0')}_${processedFile.name}`;
        formData.append('images', processedFile, indexedFilename);
        sequenceOrder.push({ type: 'new', name: indexedFilename });
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

        <button
          onClick={handleOpenCreateModal}
          className="luxury-btn py-2.5 text-xs font-semibold tracking-widest flex items-center justify-center space-x-2"
        >
          <Plus size={14} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Grid List Products Table */}
      {loading ? (
        <div className="py-20 text-center flex flex-col justify-center items-center text-xs uppercase tracking-widest text-luxury-textGray">
          <RefreshCw size={24} className="animate-spin text-luxury-gold mb-2" />
          <span>Loading products catalog...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-luxury-gray rounded p-12 text-center text-xs text-luxury-textGray uppercase tracking-wider">
          No products inside catalog database. Click "Add Product" to create your first article.
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
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-gray">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-gray-55 transition-colors">
                    {/* Thumbnail & Name */}
                    <td className="p-4 flex items-center space-x-3">
                      <img src={prod.images[0]} alt="" className="w-10 h-12 object-cover border border-luxury-gray" />
                      <div>
                        <h4 className="font-sans font-bold text-luxury-dark leading-tight line-clamp-1">{prod.name}</h4>
                        <div className="flex space-x-2 mt-1">
                          {prod.featured && <span className="bg-purple-100 text-purple-700 text-[8px] font-bold uppercase tracking-wider px-1">Featured</span>}
                          {prod.bestseller && <span className="bg-blue-100 text-blue-700 text-[8px] font-bold uppercase tracking-wider px-1">Best</span>}
                          {prod.newArrival && <span className="bg-green-100 text-green-700 text-[8px] font-bold uppercase tracking-wider px-1">New</span>}
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
                          <span className="text-red-600 font-bold">PKR {prod.salePrice}</span>
                          <span className="line-through text-[10px] text-luxury-textGray">PKR {prod.price}</span>
                        </div>
                      ) : (
                        <span>PKR {prod.price}</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="p-4 text-center font-bold font-sans">
                      <span className={prod.stock === 0 ? 'text-red-600' : prod.stock <= 5 ? 'text-yellow-600' : 'text-luxury-dark'}>
                        {prod.stock}
                      </span>
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

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">Original Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-sm border-2 border-luxury-gray p-2 px-3 rounded focus:outline-none focus:border-luxury-gold text-black font-medium placeholder-gray-400 bg-white"
                    placeholder="7500"
                  />
                </div>

                {/* Sale Price */}
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">Sale Price (PKR - Optional)</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full text-sm border-2 border-luxury-gray p-2 px-3 rounded focus:outline-none focus:border-luxury-gold text-black font-medium placeholder-gray-400 bg-white"
                    placeholder="6500"
                  />
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
                <div className="space-y-1">
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
                      <button
                        type="button"
                        onClick={() => setSizeTab('universal')}
                        className={`px-2 py-1 rounded transition-colors ${sizeTab === 'universal' ? 'bg-luxury-dark text-white' : 'text-gray-600 hover:text-black'}`}
                      >
                        Standard / Free
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

                {/* Dynamic Color Manager */}
                <div className="sm:col-span-3 bg-gray-50/80 border border-luxury-gray p-4 rounded space-y-3">
                  <div className="border-b border-gray-200 pb-2">
                    <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark block">
                      Product Colors (Presets + Custom)
                    </label>
                    <p className="text-[10px] text-luxury-textGray">
                      Select popular abaya colors or type any custom color shades.
                    </p>
                  </div>

                  {/* Popular Color presets */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-500 mr-1">Popular:</span>
                    {POPULAR_COLORS.map((col) => {
                      const isSelected = selectedColorsList.includes(col.name);
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => handleToggleColor(col.name)}
                          className={`text-xs px-2.5 py-1 rounded font-semibold uppercase tracking-wider border transition-all inline-flex items-center space-x-1.5 ${
                            isSelected
                              ? 'bg-luxury-gold text-luxury-dark border-luxury-goldDark shadow-sm font-bold'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-luxury-gold hover:bg-luxury-cream/30'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-gray-400 flex-shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span>{isSelected ? `✓ ${col.name}` : col.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Color input row */}
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      value={customColorInput}
                      onChange={(e) => setCustomColorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomColor();
                        }
                      }}
                      placeholder="Type custom color (e.g. Lavender, Rose Gold, Champagne, Charcoal)..."
                      className="flex-1 text-xs border border-gray-300 p-2 rounded bg-white font-medium focus:outline-none focus:border-luxury-gold"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomColor}
                      disabled={!customColorInput.trim()}
                      className="bg-luxury-dark text-white px-3 py-2 text-xs font-bold uppercase tracking-wider rounded hover:bg-luxury-gold hover:text-luxury-dark disabled:opacity-50 transition-colors"
                    >
                      + Add Color
                    </button>
                  </div>

                  {/* Active Selected Colors display */}
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-600 block mb-1.5">
                      Selected Colors for this Product ({selectedColorsList.length}):
                    </span>
                    {selectedColorsList.length === 0 ? (
                      <p className="text-[11px] text-amber-700 italic">No colors selected yet. Click popular colors above or type a color.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedColorsList.map((col) => (
                          <span
                            key={col}
                            className="inline-flex items-center space-x-1.5 bg-luxury-dark text-white text-xs px-2.5 py-1 rounded font-bold tracking-wider shadow-sm"
                          >
                            <span>{col}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleColor(col)}
                              className="text-gray-300 hover:text-red-400 font-bold ml-1"
                              title={`Remove color ${col}`}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
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
                        The photo marked <strong className="text-luxury-dark">#1 FRONT COVER</strong> will display as the main picture on your website.
                      </p>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {/* 1. Add Front Cover Photo */}
                      <label className="cursor-pointer inline-flex items-center space-x-1.5 bg-luxury-gold text-luxury-dark hover:bg-opacity-90 transition-all px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider shadow-sm">
                        <Star size={13} className="fill-luxury-dark" />
                        <span>Add Front Cover</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverFileChange}
                          className="hidden"
                        />
                      </label>

                      {/* 2. Add More Photos */}
                      <label className="cursor-pointer inline-flex items-center space-x-1.5 bg-luxury-dark text-white hover:bg-luxury-gold hover:text-luxury-dark transition-colors px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider shadow-sm">
                        <Plus size={13} />
                        <span>Add More Photos</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Empty state or upload dropzone if no images */}
                  {imageList.length === 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {/* Box 1: Select Main Front Photo */}
                      <label className="border-2 border-dashed border-luxury-gold bg-luxury-gold/5 p-6 rounded-lg flex flex-col justify-center items-center text-center space-y-2 hover:bg-luxury-gold/10 cursor-pointer transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverFileChange}
                          className="hidden"
                        />
                        <div className="p-3 bg-luxury-gold/20 text-luxury-dark rounded-full">
                          <Star size={24} className="fill-luxury-dark" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-luxury-dark">
                          1. Select Front Cover Photo
                        </span>
                        <span className="text-[10px] text-luxury-textGray leading-relaxed max-w-xs">
                          Click here to pick your main front-facing photo. It is guaranteed to be photo #1!
                        </span>
                      </label>

                      {/* Box 2: Select All Photos at Once */}
                      <label className="border-2 border-dashed border-luxury-gray bg-white p-6 rounded-lg flex flex-col justify-center items-center text-center space-y-2 hover:border-luxury-gold cursor-pointer transition-colors">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="p-3 bg-gray-100 text-luxury-dark rounded-full">
                          <ImageIcon size={24} className="text-luxury-dark" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-luxury-dark">
                          2. Or Upload All Photos Together
                        </span>
                        <span className="text-[10px] text-luxury-textGray leading-relaxed max-w-xs">
                          Select all views at once. You can easily click "Set as Front Cover" on the front photo!
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Guide Alert */}
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start space-x-2">
                        <AlertCircle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-relaxed">
                          <strong>Front Cover Tip:</strong> The photo labeled <span className="bg-luxury-gold text-luxury-dark font-bold px-1 py-0.5 rounded text-[10px]">#1 FRONT COVER</span> will show on your website catalog. If the back or side photo is currently #1, simply click <strong>"Set as Front Cover"</strong> on the front photo!
                        </span>
                      </div>

                      {/* Grid of image sequence cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {imageList.map((item, idx) => {
                          const isCover = idx === 0;
                          return (
                            <div
                              key={item.id}
                              className={`relative bg-white rounded-lg border overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
                                isCover
                                  ? 'border-2 border-luxury-gold ring-2 ring-luxury-gold/40 shadow-md'
                                  : 'border-luxury-gray hover:border-gray-400'
                              }`}
                            >
                              {/* Top Bar: Position Badge & Remove Button */}
                              <div className="absolute top-1.5 left-1.5 right-1.5 z-10 flex items-center justify-between pointer-events-none">
                                {isCover ? (
                                  <span className="pointer-events-auto bg-luxury-gold text-luxury-dark font-black text-[9px] px-2 py-0.5 rounded shadow flex items-center space-x-1">
                                    <Star size={10} className="fill-luxury-dark" />
                                    <span>#1 FRONT COVER</span>
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
                              <div className="p-2 bg-gray-50 border-t border-gray-100 flex flex-col space-y-1.5">
                                {/* Set as Cover button if not already cover */}
                                {!isCover ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSetCover(idx)}
                                    className="w-full py-1 px-1.5 bg-luxury-gold text-luxury-dark hover:bg-opacity-90 font-bold text-[10px] rounded uppercase tracking-wider transition-all flex items-center justify-center space-x-1 shadow-sm"
                                    title="Make this photo the primary front cover image"
                                  >
                                    <Star size={10} className="fill-luxury-dark text-luxury-dark" />
                                    <span>Set as Front Cover</span>
                                  </button>
                                ) : (
                                  <div className="text-center py-0.5">
                                    <span className="text-[9px] uppercase font-bold text-emerald-700 tracking-wider">
                                      ✓ Active Main Photo
                                    </span>
                                  </div>
                                )}

                                {/* Jump to Position Selector & Left/Right Arrows */}
                                <div className="flex items-center justify-between gap-1 pt-1 border-t border-gray-200">
                                  {/* Left Arrow */}
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, 'left')}
                                    disabled={idx === 0}
                                    className="py-1 px-1.5 bg-white border border-gray-300 rounded text-[10px] font-bold text-gray-700 hover:bg-luxury-gold hover:text-luxury-dark hover:border-luxury-gold disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-700 transition-colors flex items-center justify-center"
                                    title="Move earlier"
                                  >
                                    <ArrowLeft size={10} />
                                  </button>

                                  {/* Slot Position Selector */}
                                  <select
                                    value={idx}
                                    onChange={(e) => handleJumpToPosition(idx, Number(e.target.value))}
                                    className="flex-1 text-[10px] bg-white border border-gray-300 rounded px-1 py-0.5 font-bold text-luxury-dark text-center"
                                  >
                                    {imageList.map((_, pIdx) => (
                                      <option key={pIdx} value={pIdx}>
                                        {pIdx === 0 ? 'Pos 1 (Cover)' : pIdx === 1 ? 'Pos 2 (Hover)' : `Pos ${pIdx + 1}`}
                                      </option>
                                    ))}
                                  </select>

                                  {/* Right Arrow */}
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, 'right')}
                                    disabled={idx === imageList.length - 1}
                                    className="py-1 px-1.5 bg-white border border-gray-300 rounded text-[10px] font-bold text-gray-700 hover:bg-luxury-gold hover:text-luxury-dark hover:border-luxury-gold disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-700 transition-colors flex items-center justify-center"
                                    title="Move later"
                                  >
                                    <ArrowRight size={10} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
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

    </div>
  );
};

export default Products;
