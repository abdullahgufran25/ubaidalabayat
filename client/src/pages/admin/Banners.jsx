import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, RefreshCw, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

const Banners = () => {
  const { banners, refreshBanners } = useSettings();
  const { addToast } = useToast();

  const [bannersList, setBannersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [link, setLink] = useState('');
  const [type, setType] = useState('hero');
  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchBannersList = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/banners?all=true'); // load all for admin including inactive
      if (res.data.success) {
        setBannersList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannersList();
  }, [banners]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setLink('');
    setType('hero');
    setIsActive(true);
    setFile(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (banner) => {
    setEditingId(banner._id);
    setTitle(banner.title || '');
    setSubtitle(banner.subtitle || '');
    setLink(banner.link || '');
    setType(banner.type || 'hero');
    setIsActive(banner.isActive);
    setFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingId && !file) {
      addToast('Please upload a banner image file', 'warning');
      return;
    }

    setSubmitLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('link', link);
    formData.append('type', type);
    formData.append('isActive', isActive ? 'true' : 'false');
    if (file) {
      formData.append('image', file);
    }

    try {
      let res;
      if (editingId) {
        res = await axios.put(`/api/banners/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await axios.post('/api/banners', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data.success) {
        addToast(res.data.message, 'success');
        setModalOpen(false);
        refreshBanners(); // update global header settings
        fetchBannersList();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save banner', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promotional banner?')) return;

    try {
      const res = await axios.delete(`/api/banners/${id}`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        refreshBanners();
        fetchBannersList();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete banner', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-luxury-gray pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold uppercase tracking-wider">Banners Manager</h1>
          <p className="text-xs text-luxury-textGray uppercase tracking-widest mt-1">
            Configure homepage Hero sliders and middle promotional banners
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="luxury-btn py-2.5 text-xs font-semibold tracking-widest flex items-center justify-center space-x-2"
        >
          <Plus size={14} />
          <span>Add Banner</span>
        </button>
      </div>

      {/* Table list */}
      {loading ? (
        <div className="py-20 text-center flex flex-col justify-center items-center text-xs uppercase tracking-widest text-luxury-textGray">
          <RefreshCw size={24} className="animate-spin text-luxury-gold mb-2" />
          <span>Loading banners...</span>
        </div>
      ) : bannersList.length === 0 ? (
        <div className="bg-white border border-luxury-gray rounded p-12 text-center text-xs text-luxury-textGray uppercase tracking-wider">
          No banners found. Click "Add Banner" to upload slider.
        </div>
      ) : (
        <div className="bg-white border border-luxury-gray rounded overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-luxury-gray">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-luxury-goldDark font-bold">
                  <th className="p-4">Banner Preview</th>
                  <th className="p-4">Headline Text</th>
                  <th className="p-4">Redirect Link</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-gray">
                {bannersList.map((banner) => (
                  <tr key={banner._id} className="hover:bg-gray-55 transition-colors">
                    {/* Image preview */}
                    <td className="p-4">
                      <img src={banner.image} alt="" className="w-20 h-10 object-cover border border-luxury-gray rounded" />
                    </td>

                    {/* Headline and subtitle */}
                    <td className="p-4">
                      <div>
                        <h4 className="font-serif font-bold text-luxury-dark text-xs uppercase tracking-wider">{banner.title || '(No title)'}</h4>
                        <p className="text-[10px] text-luxury-textGray truncate max-w-xs">{banner.subtitle}</p>
                      </div>
                    </td>

                    {/* Link */}
                    <td className="p-4 text-luxury-textGray font-mono">{banner.link || '/'}</td>

                    {/* Type hero vs promo */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${
                        banner.type === 'hero' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {banner.type}
                      </span>
                    </td>

                    {/* Status active */}
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${
                        banner.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {banner.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(banner)}
                        className="p-2 border border-luxury-gray text-luxury-dark hover:bg-luxury-cream transition-colors inline-block"
                        title="Edit Banner"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(banner._id)}
                        className="p-2 border border-red-200 text-red-600 hover:bg-red-50 transition-colors inline-block"
                        title="Delete Banner"
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
          <div className="relative w-full max-w-2xl bg-luxury-light p-6 sm:p-8 shadow-2xl rounded border border-luxury-gray animate-fade-in space-y-5">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-luxury-gray pb-3">
              <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-luxury-dark">
                {editingId ? 'Edit Banner Details' : 'Add New Banner'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-luxury-dark hover:text-luxury-gold transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Row 1: Title and Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">Title / Heading</label>
                  <input
                    type="text"
                    value={title}
                    required={type === 'hero'}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-sm border-2 border-luxury-gray p-2 px-3 rounded focus:outline-none focus:border-luxury-gold text-black font-medium placeholder-gray-400 bg-white"
                    placeholder="e.g. Signature Abayas"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">Subtitle / Description</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full text-sm border-2 border-luxury-gray p-2 px-3 rounded focus:outline-none focus:border-luxury-gold text-black font-medium placeholder-gray-400 bg-white"
                    placeholder="e.g. Tailored from premium fabric"
                  />
                </div>
              </div>

              {/* Row 2: Link and Placement Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">Link Destination URL</label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full text-sm border-2 border-luxury-gray p-2 px-3 rounded focus:outline-none focus:border-luxury-gold text-black font-medium placeholder-gray-400 bg-white"
                    placeholder="e.g. /shop?category=abayas"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">Placement Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full text-sm border-2 border-luxury-gray p-2 px-3 rounded focus:outline-none bg-white font-medium text-black"
                  >
                    <option value="hero">Homepage Hero Slider Banner</option>
                    <option value="promo">Middle Promotional Banner Card</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Image Upload and Active Checkbox */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark block">Banner Image File *</label>
                  <div className="border border-dashed border-luxury-gray bg-white p-3 rounded flex flex-col justify-center items-center text-center hover:border-luxury-gold cursor-pointer transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center space-x-2">
                      <ImageIcon size={16} className="text-luxury-gold" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-luxury-dark">Select File</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 md:pt-4">
                  <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-bold uppercase tracking-wider text-luxury-dark">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="accent-luxury-dark h-4 w-4"
                    />
                    <span>Active Banner Status</span>
                  </label>
                  
                  {file && (
                    <div className="text-[9px] uppercase tracking-wider text-green-700 font-bold bg-green-50 border border-green-100 p-1 rounded truncate">
                      File: {file.name}
                    </div>
                  )}
                  {editingId && !file && (
                    <div className="text-[9px] text-luxury-textGray bg-gray-50 p-1 rounded border border-luxury-gray font-semibold uppercase tracking-wider">
                      Retains current image file.
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="border-t border-luxury-gray pt-4 flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="luxury-btn-outline py-2 px-6 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="luxury-btn py-2 px-6 text-xs"
                >
                  {submitLoading ? 'Saving...' : 'Save Banner'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Banners;
