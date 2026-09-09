import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  Info,
  CheckCircle2,
  Sliders,
  ExternalLink,
  ArrowUpDown,
} from 'lucide-react';
import axios from 'axios';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

const POSITION_PRESETS = [
  { label: 'Center (Default)', value: 'center' },
  { label: 'Top', value: 'top' },
  { label: 'Bottom', value: 'bottom' },
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
  { label: 'Custom % Coordinates', value: 'custom' },
];

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
  const [ctaText, setCtaText] = useState('Shop Collection');
  const [ctaUrl, setCtaUrl] = useState('/shop');
  const [altText, setAltText] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [type, setType] = useState('hero');
  const [isActive, setIsActive] = useState(true);

  // Desktop Banner State
  const [desktopFile, setDesktopFile] = useState(null);
  const [desktopPreview, setDesktopPreview] = useState(null);
  const [desktopPositionPreset, setDesktopPositionPreset] = useState('center');
  const [desktopCustomPosition, setDesktopCustomPosition] = useState('50% 50%');

  // Mobile Banner State
  const [mobileFile, setMobileFile] = useState(null);
  const [mobilePreview, setMobilePreview] = useState(null);
  const [mobilePositionPreset, setMobilePositionPreset] = useState('center');
  const [mobileCustomPosition, setMobileCustomPosition] = useState('50% 50%');

  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchBannersList = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/banners?all=true');
      if (res.data.success) {
        setBannersList(res.data.data);
      }
    } catch (err) {
      console.error('Error loading banners list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannersList();
  }, [banners]);

  // Read and validate image metadata (dimensions, aspect ratio, size)
  const processImageFile = (file, callback) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const ratio = (width / height).toFixed(2);
      const sizeKB = (file.size / 1024).toFixed(0);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

      callback({
        file,
        url,
        width,
        height,
        ratio,
        sizeDisplay: file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`,
        sizeBytes: file.size,
      });
    };
    img.src = url;
  };

  const handleDesktopFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDesktopFile(file);
    processImageFile(file, (data) => setDesktopPreview(data));
  };

  const handleMobileFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMobileFile(file);
    processImageFile(file, (data) => setMobilePreview(data));
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setCtaText('Shop Collection');
    setCtaUrl('/shop');
    setAltText('');
    setSortOrder(bannersList.length);
    setType('hero');
    setIsActive(true);

    setDesktopFile(null);
    setDesktopPreview(null);
    setDesktopPositionPreset('center');
    setDesktopCustomPosition('50% 50%');

    setMobileFile(null);
    setMobilePreview(null);
    setMobilePositionPreset('center');
    setMobileCustomPosition('50% 50%');

    setModalOpen(true);
  };

  const handleOpenEditModal = (banner) => {
    setEditingId(banner._id);
    setTitle(banner.title || '');
    setSubtitle(banner.subtitle || '');
    setCtaText(banner.ctaText || 'Shop Collection');
    setCtaUrl(banner.ctaUrl || banner.link || '/shop');
    setAltText(banner.altText || '');
    setSortOrder(banner.sortOrder !== undefined ? banner.sortOrder : 0);
    setType(banner.type || 'hero');
    setIsActive(banner.isActive !== false);

    // Desktop Image Preload
    setDesktopFile(null);
    setDesktopPreview(
      banner.desktopImage || banner.image
        ? {
            url: banner.desktopImage || banner.image,
            isExisting: true,
          }
        : null
    );

    const dPos = banner.desktopPosition || 'center';
    if (['center', 'top', 'bottom', 'left', 'right'].includes(dPos)) {
      setDesktopPositionPreset(dPos);
    } else {
      setDesktopPositionPreset('custom');
      setDesktopCustomPosition(dPos);
    }

    // Mobile Image Preload
    setMobileFile(null);
    setMobilePreview(
      banner.mobileImage
        ? {
            url: banner.mobileImage,
            isExisting: true,
          }
        : null
    );

    const mPos = banner.mobilePosition || 'center';
    if (['center', 'top', 'bottom', 'left', 'right'].includes(mPos)) {
      setMobilePositionPreset(mPos);
    } else {
      setMobilePositionPreset('custom');
      setMobileCustomPosition(mPos);
    }

    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // For new banners, desktop image is strictly required
    if (!editingId && !desktopFile) {
      addToast('Please upload a Desktop Banner image (recommended 2560 × 1280 px)', 'warning');
      return;
    }

    setSubmitLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('ctaText', ctaText);
    formData.append('ctaUrl', ctaUrl);
    formData.append('link', ctaUrl);
    formData.append('altText', altText);
    formData.append('sortOrder', sortOrder);
    formData.append('type', type);
    formData.append('isActive', isActive ? 'true' : 'false');

    // Object positioning
    const finalDesktopPosition =
      desktopPositionPreset === 'custom' ? desktopCustomPosition : desktopPositionPreset;
    const finalMobilePosition =
      mobilePositionPreset === 'custom' ? mobileCustomPosition : mobilePositionPreset;

    formData.append('desktopPosition', finalDesktopPosition);
    formData.append('mobilePosition', finalMobilePosition);

    if (desktopFile) {
      formData.append('desktopImage', desktopFile);
      formData.append('image', desktopFile); // legacy fallback
    }

    if (mobileFile) {
      formData.append('mobileImage', mobileFile);
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
        refreshBanners();
        fetchBannersList();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save banner', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner? All variants will be removed from Cloudinary.')) return;

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
    <div className="space-y-8 animate-fade-in font-sans pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-luxury-gray pb-4 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold uppercase tracking-wider text-luxury-dark">
            Hero & Promo Banners (CMS)
          </h1>
          <p className="text-xs text-luxury-textGray uppercase tracking-widest mt-1">
            Manage responsive Desktop (2:1) and Mobile (3:4) banner slides with WebP/AVIF auto-optimization
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="luxury-btn py-2.5 px-5 text-xs font-semibold tracking-widest flex items-center justify-center space-x-2 shadow-sm"
        >
          <Plus size={15} />
          <span>Add Hero Banner</span>
        </button>
      </div>

      {/* Info Notice Card */}
      <div className="bg-luxury-cream/60 border border-luxury-gold/30 rounded-lg p-4 flex items-start space-x-3 text-xs text-luxury-dark">
        <Info size={18} className="text-luxury-goldDark flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold uppercase tracking-wider text-[11px] text-luxury-dark">
            Responsive Dual-Image System Activated:
          </p>
          <p className="text-luxury-textGray leading-relaxed">
            Upload a wide <strong>Desktop Banner (2:1 / 2560×1280 px)</strong> for laptops, tablets, and monitors, plus a vertical <strong>Mobile Banner (3:4 / 900×1200 px)</strong> for phones. The website serves high-speed WebP and AVIF versions automatically according to each visitor's screen without blurred side extensions.
          </p>
        </div>
      </div>

      {/* Table list */}
      {loading ? (
        <div className="py-20 text-center flex flex-col justify-center items-center text-xs uppercase tracking-widest text-luxury-textGray">
          <RefreshCw size={24} className="animate-spin text-luxury-gold mb-2" />
          <span>Loading banners...</span>
        </div>
      ) : bannersList.length === 0 ? (
        <div className="bg-white border border-luxury-gray rounded-lg p-12 text-center text-xs text-luxury-textGray uppercase tracking-wider shadow-sm">
          No banners found in the database. Click <strong>"Add Hero Banner"</strong> to configure your first responsive slide!
        </div>
      ) : (
        <div className="bg-white border border-luxury-gray rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-luxury-gray">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-luxury-goldDark font-bold">
                  <th className="p-4 w-12 text-center">Order</th>
                  <th className="p-4">Desktop Banner (2:1)</th>
                  <th className="p-4">Mobile Banner (3:4)</th>
                  <th className="p-4">Headline / SEO Details</th>
                  <th className="p-4">CTA Button</th>
                  <th className="p-4 text-center">Type</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-gray">
                {bannersList.map((banner) => (
                  <tr key={banner._id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Sort Order */}
                    <td className="p-4 text-center font-mono font-bold text-luxury-dark">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-luxury-dark text-xs border border-luxury-gray">
                        {banner.sortOrder || 0}
                      </span>
                    </td>

                    {/* Desktop Preview */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <img
                          src={banner.desktopImage || banner.image}
                          alt=""
                          className="w-28 h-14 object-cover border border-luxury-gray rounded bg-gray-100 shadow-sm"
                        />
                        <div className="text-[9px] text-luxury-textGray font-mono">
                          pos: {banner.desktopPosition || 'center'}
                        </div>
                      </div>
                    </td>

                    {/* Mobile Preview */}
                    <td className="p-4">
                      {banner.mobileImage ? (
                        <div className="space-y-1">
                          <img
                            src={banner.mobileImage}
                            alt=""
                            className="w-12 h-16 object-cover border border-luxury-gray rounded bg-gray-100 shadow-sm"
                          />
                          <div className="text-[9px] text-green-700 font-medium">
                            3:4 Active
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded max-w-[140px] leading-tight">
                          ⚠️ Single image. Add Mobile 3:4 variant.
                        </div>
                      )}
                    </td>

                    {/* Headline and SEO metadata */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <h4 className="font-serif font-bold text-luxury-dark text-xs uppercase tracking-wider">
                          {banner.title || '(No Headline)'}
                        </h4>
                        {banner.subtitle && (
                          <p className="text-[10px] text-luxury-textGray truncate max-w-xs">{banner.subtitle}</p>
                        )}
                        {banner.altText && (
                          <p className="text-[9px] text-luxury-goldDark font-mono truncate max-w-xs">
                            Alt: {banner.altText}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* CTA Button Info */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-luxury-dark text-[11px] block">
                          {banner.ctaText || 'Shop Collection'}
                        </span>
                        <span className="text-[9.5px] text-luxury-textGray font-mono block truncate max-w-[120px]">
                          {banner.ctaUrl || banner.link || '/shop'}
                        </span>
                      </div>
                    </td>

                    {/* Type hero vs promo */}
                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full border ${
                          banner.type === 'hero'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                      >
                        {banner.type}
                      </span>
                    </td>

                    {/* Status active */}
                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full border ${
                          banner.isActive
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-600 border-red-200'
                        }`}
                      >
                        {banner.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(banner)}
                        className="p-2 border border-luxury-gray text-luxury-dark hover:bg-luxury-cream transition-colors rounded"
                        title="Edit Banner"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(banner._id)}
                        className="p-2 border border-red-200 text-red-600 hover:bg-red-50 transition-colors rounded"
                        title="Delete Banner"
                      >
                        <Trash2 size={13} />
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
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-luxury-dark/80 backdrop-blur-sm p-3 sm:p-6 py-8 sm:py-12 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-4xl bg-white p-6 sm:p-8 shadow-2xl rounded-lg border border-luxury-gray animate-fade-in space-y-6 my-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-luxury-gray pb-4">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold uppercase tracking-wider text-luxury-dark">
                  {editingId ? 'Edit Responsive Hero Banner' : 'Create Responsive Hero Banner'}
                </h3>
                <p className="text-[11px] text-luxury-textGray uppercase tracking-widest mt-0.5">
                  Dual Desktop (2:1) & Mobile (3:4) banner configuration
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-luxury-dark hover:text-luxury-gold transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Dual Upload Section: Desktop vs Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-luxury-light p-5 rounded-lg border border-luxury-gray">
                
                {/* 1. Desktop Banner Upload */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Monitor size={16} className="text-luxury-goldDark" />
                      <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">
                        Desktop Banner *
                      </label>
                    </div>
                    <span className="text-[10px] font-bold bg-white text-luxury-goldDark border border-luxury-gold/40 px-2 py-0.5 rounded-full font-mono">
                      2560 × 1280 (2:1)
                    </span>
                  </div>

                  {/* Dropzone / File Picker */}
                  <div className="border-2 border-dashed border-luxury-gray hover:border-luxury-gold bg-white p-4 rounded-lg flex flex-col justify-center items-center text-center cursor-pointer transition-colors relative min-h-[140px]">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={handleDesktopFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {desktopPreview ? (
                      <div className="w-full space-y-2">
                        <img
                          src={desktopPreview.url}
                          alt="Desktop Preview"
                          className="w-full h-28 object-cover rounded border border-luxury-gray shadow-sm"
                          style={{
                            objectPosition:
                              desktopPositionPreset === 'custom'
                                ? desktopCustomPosition
                                : desktopPositionPreset,
                          }}
                        />
                        <div className="flex items-center justify-between text-[10px] font-mono text-luxury-dark bg-gray-50 p-1.5 rounded border border-luxury-gray/60">
                          <span>
                            {desktopPreview.width
                              ? `${desktopPreview.width} × ${desktopPreview.height} px (${desktopPreview.ratio}:1)`
                              : 'Existing Desktop Image'}
                          </span>
                          {desktopPreview.sizeDisplay && <span>{desktopPreview.sizeDisplay}</span>}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <ImageIcon size={28} className="mx-auto text-luxury-gold" />
                        <p className="text-xs font-bold uppercase tracking-wider text-luxury-dark">
                          Choose Desktop Banner
                        </p>
                        <p className="text-[10px] text-luxury-textGray">
                          JPG, PNG, WebP, AVIF up to 5MB
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Resolution Warning */}
                  {desktopPreview?.width && desktopPreview.width < 1600 && (
                    <div className="flex items-start space-x-1.5 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[10.5px]">
                      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                      <span>
                        ⚠️ Width ({desktopPreview.width}px) is below 1600px. Image may appear soft on Retina/4K screens. Recommended: 2560 × 1280 px.
                      </span>
                    </div>
                  )}

                  {/* Desktop Object Position Controls */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] uppercase font-bold tracking-wider text-luxury-dark flex items-center space-x-1">
                      <Sliders size={12} className="text-luxury-goldDark" />
                      <span>Desktop Focal / Object Position</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={desktopPositionPreset}
                        onChange={(e) => setDesktopPositionPreset(e.target.value)}
                        className="text-xs border border-luxury-gray p-2 rounded bg-white font-medium text-luxury-dark focus:outline-none focus:border-luxury-gold"
                      >
                        {POSITION_PRESETS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      {desktopPositionPreset === 'custom' ? (
                        <input
                          type="text"
                          value={desktopCustomPosition}
                          onChange={(e) => setDesktopCustomPosition(e.target.value)}
                          placeholder="e.g. 50% 35%"
                          className="text-xs border border-luxury-gray p-2 rounded bg-white font-mono text-luxury-dark focus:outline-none focus:border-luxury-gold"
                        />
                      ) : (
                        <div className="text-[10px] text-luxury-textGray flex items-center px-2 bg-gray-50 border border-luxury-gray rounded font-mono">
                          CSS: {desktopPositionPreset}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Mobile Banner Upload */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Smartphone size={16} className="text-luxury-goldDark" />
                      <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">
                        Mobile Banner (Below 768px)
                      </label>
                    </div>
                    <span className="text-[10px] font-bold bg-white text-luxury-goldDark border border-luxury-gold/40 px-2 py-0.5 rounded-full font-mono">
                      900 × 1200 (3:4)
                    </span>
                  </div>

                  {/* Dropzone / File Picker */}
                  <div className="border-2 border-dashed border-luxury-gray hover:border-luxury-gold bg-white p-4 rounded-lg flex flex-col justify-center items-center text-center cursor-pointer transition-colors relative min-h-[140px]">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={handleMobileFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {mobilePreview ? (
                      <div className="w-full space-y-2">
                        <img
                          src={mobilePreview.url}
                          alt="Mobile Preview"
                          className="w-24 h-28 mx-auto object-cover rounded border border-luxury-gray shadow-sm"
                          style={{
                            objectPosition:
                              mobilePositionPreset === 'custom'
                                ? mobileCustomPosition
                                : mobilePositionPreset,
                          }}
                        />
                        <div className="flex items-center justify-between text-[10px] font-mono text-luxury-dark bg-gray-50 p-1.5 rounded border border-luxury-gray/60">
                          <span>
                            {mobilePreview.width
                              ? `${mobilePreview.width} × ${mobilePreview.height} px (${mobilePreview.ratio}:1)`
                              : 'Existing Mobile Image'}
                          </span>
                          {mobilePreview.sizeDisplay && <span>{mobilePreview.sizeDisplay}</span>}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <ImageIcon size={28} className="mx-auto text-luxury-gold" />
                        <p className="text-xs font-bold uppercase tracking-wider text-luxury-dark">
                          Choose Mobile Banner
                        </p>
                        <p className="text-[10px] text-luxury-textGray">
                          Portrait 3:4 ratio for smartphone screens
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Resolution Warning */}
                  {mobilePreview?.width && mobilePreview.width < 600 && (
                    <div className="flex items-start space-x-1.5 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[10.5px]">
                      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                      <span>
                        ⚠️ Width ({mobilePreview.width}px) is below 600px. Recommended: 900 × 1200 px for crisp mobile display.
                      </span>
                    </div>
                  )}

                  {/* Mobile Object Position Controls */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] uppercase font-bold tracking-wider text-luxury-dark flex items-center space-x-1">
                      <Sliders size={12} className="text-luxury-goldDark" />
                      <span>Mobile Focal / Object Position</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={mobilePositionPreset}
                        onChange={(e) => setMobilePositionPreset(e.target.value)}
                        className="text-xs border border-luxury-gray p-2 rounded bg-white font-medium text-luxury-dark focus:outline-none focus:border-luxury-gold"
                      >
                        {POSITION_PRESETS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      {mobilePositionPreset === 'custom' ? (
                        <input
                          type="text"
                          value={mobileCustomPosition}
                          onChange={(e) => setMobileCustomPosition(e.target.value)}
                          placeholder="e.g. 50% 25%"
                          className="text-xs border border-luxury-gray p-2 rounded bg-white font-mono text-luxury-dark focus:outline-none focus:border-luxury-gold"
                        />
                      ) : (
                        <div className="text-[10px] text-luxury-textGray flex items-center px-2 bg-gray-50 border border-luxury-gray rounded font-mono">
                          CSS: {mobilePositionPreset}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Text & Content Fields */}
              <div className="space-y-4">
                {/* Title & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark flex items-center justify-between">
                      <span>Hero Headline (H1 on Slide 1)</span>
                      <span className="text-[10px] text-luxury-goldDark font-semibold">SEO Optimized</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full text-sm border-2 border-luxury-gray p-2.5 px-3 rounded focus:outline-none focus:border-luxury-gold text-luxury-dark font-serif font-bold placeholder-gray-400 bg-white"
                      placeholder="e.g. Haute Couture Signature Collection"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">
                      Hero Subtitle / Description
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full text-sm border-2 border-luxury-gray p-2.5 px-3 rounded focus:outline-none focus:border-luxury-gold text-luxury-dark font-medium placeholder-gray-400 bg-white"
                      placeholder="e.g. Effortless elegance designed for the modern modest woman."
                    />
                  </div>
                </div>

                {/* CTA Button Text & Destination URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="w-full text-sm border-2 border-luxury-gray p-2.5 px-3 rounded focus:outline-none focus:border-luxury-gold text-luxury-dark font-medium placeholder-gray-400 bg-white"
                      placeholder="e.g. Shop Collection"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark flex items-center justify-between">
                      <span>CTA Destination URL</span>
                      <span className="text-[10px] text-luxury-textGray font-mono">internal / link</span>
                    </label>
                    <input
                      type="text"
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      className="w-full text-sm border-2 border-luxury-gray p-2.5 px-3 rounded focus:outline-none focus:border-luxury-gold text-luxury-dark font-mono placeholder-gray-400 bg-white"
                      placeholder="e.g. /shop or /shop?category=abayas"
                    />
                  </div>
                </div>

                {/* SEO Image Alt Text & Sort Order */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark flex items-center justify-between">
                      <span>Image Alt Text (Accessibility & Google Images SEO)</span>
                      <span className="text-[10px] text-luxury-goldDark font-semibold">Recommended</span>
                    </label>
                    <input
                      type="text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      className="w-full text-sm border-2 border-luxury-gray p-2.5 px-3 rounded focus:outline-none focus:border-luxury-gold text-luxury-dark font-medium placeholder-gray-400 bg-white"
                      placeholder="e.g. Luxury Silk Black Abaya with Gold Embroidery"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark flex items-center space-x-1">
                      <ArrowUpDown size={13} className="text-luxury-goldDark" />
                      <span>Slide Sort Order</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full text-sm border-2 border-luxury-gray p-2.5 px-3 rounded focus:outline-none focus:border-luxury-gold text-luxury-dark font-mono font-bold bg-white"
                    />
                  </div>
                </div>

                {/* Placement Type & Active Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 items-center">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold tracking-wider text-luxury-dark">
                      Banner Placement
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full text-sm border-2 border-luxury-gray p-2.5 px-3 rounded focus:outline-none bg-white font-medium text-luxury-dark"
                    >
                      <option value="hero">Homepage Top Hero Carousel</option>
                      <option value="promo">Middle Promotional Banner Card</option>
                    </select>
                  </div>

                  <div className="pt-4 sm:pt-6">
                    <label className="flex items-center space-x-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="h-5 w-5 rounded accent-luxury-dark"
                      />
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-luxury-dark block">
                          Banner Active Status
                        </span>
                        <span className="text-[10px] text-luxury-textGray">
                          {isActive ? 'Visible on live storefront' : 'Disabled / Hidden from visitors'}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

              </div>

              {/* Actions Footer */}
              <div className="border-t border-luxury-gray pt-4 flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="luxury-btn-outline py-2.5 px-6 text-xs font-semibold tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="luxury-btn py-2.5 px-8 text-xs font-semibold tracking-widest flex items-center space-x-2"
                >
                  {submitLoading && <RefreshCw size={14} className="animate-spin" />}
                  <span>{submitLoading ? 'Optimizing & Saving...' : 'Save Banner Slide'}</span>
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
