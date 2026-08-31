import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, RefreshCw, Image as ImageIcon } from 'lucide-react';
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
  
  // Toggles
  const [featured, setFeatured] = useState(false);
  const [bestseller, setBestseller] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Files
  const [files, setFiles] = useState([]);
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
    setFiles([]);
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
    setFiles([]);
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !sku || !price || !stock || !category || !description) {
      addToast('Please fill in all required fields', 'warning');
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

    if (files.length > 0) {
      files.forEach((file) => {
        formData.append('images', file);
      });
    }

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
        addToast(res.data.message, 'success');
        setModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save product', 'error');
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
          <h1 className="text-3xl font-serif font-bold uppercase tracking-wider">Products Catalog</h1>
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
                        <h4 className="font-serif font-bold text-luxury-dark leading-tight line-clamp-1">{prod.name}</h4>
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
              <h3 className="font-serif text-lg font-bold uppercase tracking-wider">
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
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sizes comma list */}
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">Available Sizes (Comma List)</label>
                  <input
                    type="text"
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                    className="w-full text-sm border-2 border-luxury-gray p-2 px-3 rounded focus:outline-none focus:border-luxury-gold text-black font-medium placeholder-gray-400 bg-white"
                    placeholder="52, 54, 56, 58"
                  />
                </div>

                {/* Colors comma list */}
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">Available Colors (Comma List)</label>
                  <input
                    type="text"
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                    className="w-full text-sm border-2 border-luxury-gray p-2 px-3 rounded focus:outline-none focus:border-luxury-gold text-black font-medium placeholder-gray-400 bg-white"
                    placeholder="Black, Blue, Beige"
                  />
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

                {/* File Uploader */}
                <div className="sm:col-span-3 space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">Product Images Upload (Max 5)</label>
                  <div className="border border-dashed border-luxury-gray bg-white p-4 rounded flex flex-col justify-center items-center text-center space-y-2 hover:border-luxury-gold cursor-pointer transition-colors relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <ImageIcon size={28} className="text-luxury-gold" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-luxury-dark">
                      Select Files
                    </span>
                    <span className="text-[10px] text-luxury-textGray leading-relaxed">
                      Select up to 5 images (JPEG, PNG, WEBP, max 5MB each).
                    </span>
                  </div>
                  {files.length > 0 && (
                    <div className="text-[10px] uppercase tracking-wider text-green-700 font-bold bg-green-50 border border-green-100 p-2.5 rounded">
                      Selected {files.length} images: {files.map(f => f.name).join(', ')}
                    </div>
                  )}
                  {editingId && files.length === 0 && (
                    <div className="text-[10px] uppercase tracking-wider text-luxury-textGray font-semibold bg-gray-50 border border-luxury-gray p-2.5 rounded">
                      Leave empty to retain existing product images.
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
