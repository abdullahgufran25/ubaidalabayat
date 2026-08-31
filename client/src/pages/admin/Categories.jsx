import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, RefreshCw, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

const Categories = () => {
  const { categories, refreshCategories } = useSettings();
  const { addToast } = useToast();

  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchCategoriesList = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/categories?all=true'); // fetch including inactive ones
      if (res.data.success) {
        setCategoriesList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesList();
  }, [categories]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setName('');
    setIsActive(true);
    setFile(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setIsActive(cat.isActive);
    setFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      addToast('Please enter category name', 'warning');
      return;
    }

    setSubmitLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('isActive', isActive ? 'true' : 'false');
    if (file) {
      formData.append('image', file);
    }

    try {
      let res;
      if (editingId) {
        res = await axios.put(`/api/categories/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await axios.post('/api/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data.success) {
        addToast(res.data.message, 'success');
        setModalOpen(false);
        refreshCategories(); // update global header settings
        fetchCategoriesList();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save category', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This will check for product safety associations.')) return;

    try {
      const res = await axios.delete(`/api/categories/${id}`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        refreshCategories();
        fetchCategoriesList();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-luxury-gray pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold uppercase tracking-wider">Categories Manager</h1>
          <p className="text-xs text-luxury-textGray uppercase tracking-widest mt-1">
            Create, Edit and organize product listing categories
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="luxury-btn py-2.5 text-xs font-semibold tracking-widest flex items-center justify-center space-x-2"
        >
          <Plus size={14} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Table list */}
      {loading ? (
        <div className="py-20 text-center flex flex-col justify-center items-center text-xs uppercase tracking-widest text-luxury-textGray">
          <RefreshCw size={24} className="animate-spin text-luxury-gold mb-2" />
          <span>Loading categories...</span>
        </div>
      ) : categoriesList.length === 0 ? (
        <div className="bg-white border border-luxury-gray rounded p-12 text-center text-xs text-luxury-textGray uppercase tracking-wider">
          No categories found. Click "Add Category" to initialize.
        </div>
      ) : (
        <div className="bg-white border border-luxury-gray rounded overflow-hidden shadow-sm max-w-4xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-luxury-gray">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-luxury-goldDark font-bold">
                  <th className="p-4">Category Image</th>
                  <th className="p-4">Category Name</th>
                  <th className="p-4">Slug (SEO)</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-gray">
                {categoriesList.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-55 transition-colors">
                    {/* Image */}
                    <td className="p-4">
                      <img
                        src={cat.image || 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&q=80&w=100'}
                        alt=""
                        className="w-10 h-12 object-cover border border-luxury-gray"
                      />
                    </td>

                    {/* Name */}
                    <td className="p-4 font-serif font-bold text-luxury-dark text-sm uppercase tracking-wider">{cat.name}</td>

                    {/* Slug */}
                    <td className="p-4 text-luxury-textGray font-mono">{cat.slug}</td>

                    {/* Status */}
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded ${
                        cat.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                      }`}>
                        {cat.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-2 border border-luxury-gray text-luxury-dark hover:bg-luxury-cream transition-colors inline-block"
                        title="Edit Category"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-2 border border-red-200 text-red-600 hover:bg-red-50 transition-colors inline-block"
                        title="Delete Category"
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

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-luxury-dark bg-opacity-70 p-4 py-8 sm:py-12 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-md bg-luxury-light p-5 sm:p-6 shadow-2xl rounded border border-luxury-gray animate-fade-in space-y-4">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-luxury-gray pb-3">
              <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-luxury-dark">
                {editingId ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-luxury-dark hover:text-luxury-gold transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm border-2 border-luxury-gray p-2 px-3 rounded focus:outline-none focus:border-luxury-gold text-black font-medium placeholder-gray-400 bg-white"
                  placeholder="e.g. Abayas"
                />
              </div>

              {/* File upload */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">Category Banner Image</label>
                <div className="border border-dashed border-luxury-gray bg-white p-4 rounded flex flex-col justify-center items-center text-center space-y-2 hover:border-luxury-gold cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <ImageIcon size={22} className="text-luxury-gold" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-luxury-dark">Select File</span>
                </div>
                {file && (
                  <div className="text-[10px] uppercase tracking-wider text-green-700 font-bold bg-green-50 border border-green-100 p-2 rounded">
                    Selected: {file.name}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="pt-2">
                <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-luxury-dark h-4 w-4"
                  />
                  <span>Active Category</span>
                </label>
              </div>

              {/* Actions */}
              <div className="border-t border-luxury-gray pt-4 flex justify-end space-x-3 mt-6">
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
                  {submitLoading ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Categories;
