import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Settings as SettingsIcon, 
  Landmark, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Facebook, 
  Instagram, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle,
  Megaphone,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Sparkles,
  Eye,
  Sliders
} from 'lucide-react';
import axios from 'axios';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import SocialIcon from '../../components/SocialIcon';

const Settings = () => {
  const { settings, reloadAll } = useSettings();
  const { addToast } = useToast();

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [shippingCharges, setShippingCharges] = useState('');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('');
  const [currency, setCurrency] = useState('PKR');
  
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');

  // Payment & Bank Transfer CMS State
  const [bankName, setBankName] = useState('Faysal Bank Limited (FBL)');
  const [accountTitle, setAccountTitle] = useState('UBAID ULLAH');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [bankInstructions, setBankInstructions] = useState('');
  const [bankTransferEnabled, setBankTransferEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);
  const [cardPaymentEnabled, setCardPaymentEnabled] = useState(false);

  // Dynamic Social Links State
  const [socialLinks, setSocialLinks] = useState([]);
  const [newPlatform, setNewPlatform] = useState('Facebook');
  const [newUrl, setNewUrl] = useState('');

  const [aboutUsText, setAboutUsText] = useState('');
  const [footerText, setFooterText] = useState('');

  // Top Announcement Slider CMS State
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [announcementSpeed, setAnnouncementSpeed] = useState(4);
  const [announcements, setAnnouncements] = useState([
    { text: '10% OFF ON CARD & ONLINE PAYMENTS | USE CODE: LUXURY10', link: '/shop' },
    { text: 'FREE SHIPPING ON ALL ORDERS ABOVE RS. 10,000 NATIONWIDE', link: '/shop' },
    { text: 'BESPOKE SAUDI NIDHA FABRIC ABAYAS | HANDCRAFTED ELEGANCE', link: '/shop' },
  ]);
  const [newPromoText, setNewPromoText] = useState('');
  const [newPromoLink, setNewPromoLink] = useState('/shop');

  const [submitLoading, setSubmitLoading] = useState(false);

  // Sync settings when loaded
  useEffect(() => {
    if (settings) {
      setWhatsappNumber(settings.whatsappNumber || '');
      setShippingCharges(settings.shippingCharges || '');
      setFreeShippingThreshold(settings.freeShippingThreshold || '');
      setCurrency(settings.currency || 'PKR');
      setContactEmail(settings.contactEmail || '');
      setContactPhone(settings.contactPhone || '');
      setContactAddress(settings.contactAddress || '');
      setSocialLinks(settings.socialLinks || []);
      setAboutUsText(settings.aboutUsText || '');
      setFooterText(settings.footerText || '');
      // Bank & Payment states
      setBankName(settings.bankName || 'Faysal Bank Limited (FBL)');
      setAccountTitle(settings.accountTitle || 'UBAID ULLAH');
      setAccountNumber(settings.accountNumber || '');
      setIban(settings.iban || '');
      setBankBranch(settings.bankBranch || '');
      setBankInstructions(settings.bankInstructions || 'Please transfer the exact order amount and share the payment screenshot on WhatsApp with your Order ID for instant dispatch.');
      setBankTransferEnabled(settings.bankTransferEnabled !== false);
      setCodEnabled(settings.codEnabled !== false);
      setCardPaymentEnabled(settings.cardPaymentEnabled === true);
      // Top Announcement Bar CMS sync
      if (settings.announcementBar) {
        setAnnouncementEnabled(settings.announcementBar.enabled !== false);
        setAnnouncementSpeed(Math.round((settings.announcementBar.speed || 4000) / 1000));
        if (Array.isArray(settings.announcementBar.messages) && settings.announcementBar.messages.length > 0) {
          setAnnouncements(settings.announcementBar.messages);
        }
      }
    }
  }, [settings]);

  // Announcement Bar Handlers
  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (!newPromoText.trim()) {
      addToast('Please enter announcement / promotional message text', 'warning');
      return;
    }
    setAnnouncements([
      ...announcements,
      { text: newPromoText.trim(), link: newPromoLink.trim() },
    ]);
    setNewPromoText('');
    setNewPromoLink('/shop');
    addToast('Promotion message added to slider list', 'info');
  };

  const handleDeleteAnnouncement = (index, e) => {
    e.preventDefault();
    if (announcements.length <= 1) {
      addToast('Keep at least one announcement, or disable the bar above.', 'warning');
    }
    setAnnouncements(announcements.filter((_, i) => i !== index));
    addToast('Promotion message removed', 'info');
  };

  const handleMoveAnnouncement = (index, direction, e) => {
    e.preventDefault();
    if (direction === 'up' && index > 0) {
      const updated = [...announcements];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      setAnnouncements(updated);
    } else if (direction === 'down' && index < announcements.length - 1) {
      const updated = [...announcements];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      setAnnouncements(updated);
    }
  };

  const handleApplyPreset = (presetText, presetLink) => {
    setNewPromoText(presetText);
    setNewPromoLink(presetLink);
  };

  const handleAddSocial = (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      addToast('URL must start with http:// or https://', 'warning');
      return;
    }
    if (socialLinks.some((link) => link.platform === newPlatform)) {
      addToast(`Already added a link for ${newPlatform}`, 'warning');
      return;
    }
    setSocialLinks([...socialLinks, { platform: newPlatform, url: newUrl.trim() }]);
    setNewUrl('');
  };

  const handleDeleteSocial = (platformName, e) => {
    e.preventDefault();
    setSocialLinks(socialLinks.filter((link) => link.platform !== platformName));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const payload = {
      whatsappNumber,
      shippingCharges: Number(shippingCharges),
      freeShippingThreshold: Number(freeShippingThreshold),
      currency,
      contactEmail,
      contactPhone,
      contactAddress,
      socialLinks,
      aboutUsText,
      footerText,
      // Payment & Bank Transfer CMS
      bankName,
      accountTitle,
      accountNumber,
      iban,
      bankBranch,
      bankInstructions,
      bankTransferEnabled,
      codEnabled,
      cardPaymentEnabled,
      // Top Announcement Bar / Promotional Slider CMS
      announcementBar: {
        enabled: announcementEnabled,
        speed: Math.max(1, Number(announcementSpeed)) * 1000,
        messages: announcements,
      },
    };

    try {
      const res = await axios.put('/api/settings', payload);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        reloadAll(); // Reload settings globally
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update store settings', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="border-b border-luxury-gray pb-4">
        <h1 className="text-3xl font-sans font-bold uppercase tracking-wider">Store Settings</h1>
        <p className="text-xs text-luxury-textGray uppercase tracking-widest mt-1">
          Customize contact details, social media URLs, shipping fees, and footer texts
        </p>
      </div>

      {/* Settings Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Core settings */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Top Announcement Bar & Promotions Slider (CMS) */}
          <div className="bg-white border border-luxury-gray p-6 sm:p-8 rounded space-y-6">
            <div className="border-b border-luxury-gray pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="font-sans text-base font-bold uppercase tracking-wider text-luxury-gold flex items-center">
                  <Megaphone size={18} className="mr-2" />
                  <span>Top Announcement Bar & Promotions Slider</span>
                </h2>
                <p className="text-[11px] text-luxury-textGray mt-0.5">
                  Manage the rotating announcement slider displayed at the very top of the website above the Navbar.
                </p>
              </div>

              {/* Status Badge */}
              <span className={`self-start sm:self-auto px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                announcementEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {announcementEnabled ? '● Active on Site' : '○ Disabled'}
              </span>
            </div>

            {/* Top Bar Config Controls (Toggle & Speed) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-luxury-light p-4 rounded border border-luxury-gray/70">
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={announcementEnabled}
                  onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                  className="rounded text-luxury-gold focus:ring-luxury-gold h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-luxury-dark block">Enable Announcement Slider</span>
                  <span className="text-[10px] text-luxury-textGray">Show promotional slider at top of website</span>
                </div>
              </label>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray flex items-center justify-between">
                  <span>Slide Duration (Seconds)</span>
                  <span className="text-luxury-gold font-bold">{announcementSpeed}s</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="1"
                    value={announcementSpeed}
                    onChange={(e) => setAnnouncementSpeed(Number(e.target.value))}
                    className="w-full accent-luxury-gold cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-luxury-dark w-6 text-center">{announcementSpeed}s</span>
                </div>
              </div>
            </div>

            {/* Live Store Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray flex items-center">
                  <Eye size={12} className="mr-1 text-luxury-gold" />
                  <span>Live Appearance Preview</span>
                </span>
                <span className="text-[10px] text-luxury-textGray">
                  {announcements.length} {announcements.length === 1 ? 'Message' : 'Messages'} in rotation
                </span>
              </div>
              
              {announcementEnabled && announcements.length > 0 ? (
                <div className="bg-[#0D0D0D] border border-[#222222] py-2.5 px-4 rounded text-center select-none shadow-inner">
                  <div className="flex items-center justify-center space-x-2 text-white/90">
                    <Sparkles size={11} className="text-luxury-gold flex-shrink-0 animate-pulse" />
                    <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-luxury-light truncate">
                      {announcements[0]?.text}
                    </span>
                    {announcements[0]?.link && (
                      <span className="text-[9px] text-luxury-gold underline underline-offset-2 ml-1">
                        Shop Now →
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 border border-dashed border-gray-300 py-2.5 px-4 rounded text-center text-xs text-gray-500 italic">
                  Top announcement bar is currently turned OFF.
                </div>
              )}
            </div>

            {/* Existing Announcements List */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">
                Active Promotional Messages ({announcements.length})
              </label>

              {announcements.length === 0 ? (
                <p className="text-xs text-luxury-textGray italic bg-luxury-light p-3 rounded">
                  No announcements configured. Add a promotion below to display it in the top slider.
                </p>
              ) : (
                <div className="space-y-2">
                  {announcements.map((promo, idx) => (
                    <div 
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-luxury-gray p-3 rounded hover:border-luxury-gold/50 transition-colors gap-2"
                    >
                      <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                        <span className="bg-luxury-cream text-luxury-goldDark font-mono text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 mt-0.5">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-luxury-dark uppercase tracking-wider break-words">
                            {promo.text}
                          </p>
                          {promo.link && (
                            <p className="text-[10px] text-luxury-textGray truncate mt-0.5 flex items-center">
                              <span className="text-luxury-gold mr-1 font-semibold">Link:</span> {promo.link}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Reorder and Delete Actions */}
                      <div className="flex items-center space-x-1 self-end sm:self-auto flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleMoveAnnouncement(idx, 'up', e)}
                          disabled={idx === 0}
                          className={`p-1.5 rounded transition-colors ${
                            idx === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-luxury-cream hover:text-luxury-dark'
                          }`}
                          title="Move Up in Rotation"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleMoveAnnouncement(idx, 'down', e)}
                          disabled={idx === announcements.length - 1}
                          className={`p-1.5 rounded transition-colors ${
                            idx === announcements.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-luxury-cream hover:text-luxury-dark'
                          }`}
                          title="Move Down in Rotation"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAnnouncement(idx, e)}
                          className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded transition-colors"
                          title="Delete message"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Announcement Form Panel */}
            <div className="border-t border-luxury-gray pt-4 space-y-4">
              <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-luxury-dark flex items-center">
                <Plus size={14} className="mr-1.5 text-luxury-gold" />
                <span>Add New Promotional Message</span>
              </h3>

              {/* Quick Fill Suggestion Chips */}
              <div>
                <p className="text-[9px] uppercase font-bold tracking-wider text-luxury-textGray mb-1.5">Quick Inspiration Presets:</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('10% OFF ON CARD & ONLINE PAYMENTS | USE CODE: LUXURY10', '/shop')}
                    className="text-[10px] bg-luxury-cream hover:bg-luxury-gold/20 text-luxury-dark px-2.5 py-1 rounded transition-colors font-medium border border-luxury-gold/30"
                  >
                    + 10% Off Card Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('FREE SHIPPING ON ORDERS ABOVE RS. 10,000 NATIONWIDE', '/shop')}
                    className="text-[10px] bg-luxury-cream hover:bg-luxury-gold/20 text-luxury-dark px-2.5 py-1 rounded transition-colors font-medium border border-luxury-gold/30"
                  >
                    + Free Shipping Over Rs. 10,000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('NEW ARRIVALS: LUXURY BESPOKE SAUDI NIDHA ABAYAS', '/shop?newArrival=true')}
                    className="text-[10px] bg-luxury-cream hover:bg-luxury-gold/20 text-luxury-dark px-2.5 py-1 rounded transition-colors font-medium border border-luxury-gold/30"
                  >
                    + New Arrivals
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('RAMADAN SPECIAL: COMPLIMENTARY HIJAB WITH EVERY ABAYA', '/shop')}
                    className="text-[10px] bg-luxury-cream hover:bg-luxury-gold/20 text-luxury-dark px-2.5 py-1 rounded transition-colors font-medium border border-luxury-gold/30"
                  >
                    + Complimentary Gift Promo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">
                    Promotional Text *
                  </label>
                  <input
                    type="text"
                    value={newPromoText}
                    onChange={(e) => setNewPromoText(e.target.value)}
                    placeholder="e.g. 10% OFF ON CARD PAYMENT | FREE SHIPPING OVER 10,000"
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">
                    Target Page Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={newPromoLink}
                    onChange={(e) => setNewPromoLink(e.target.value)}
                    placeholder="e.g. /shop or /shop?category=abayas"
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddAnnouncement}
                className="luxury-btn-outline py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center space-x-1.5"
              >
                <Plus size={14} />
                <span>Add Message to Slider</span>
              </button>
            </div>
          </div>

          {/* General Metadata */}
          <div className="bg-white border border-luxury-gray p-6 sm:p-8 rounded space-y-6">
            <h2 className="font-sans text-base font-bold uppercase tracking-wider text-luxury-gold border-b border-luxury-gray pb-2 flex items-center">
              <SettingsIcon size={16} className="mr-2" />
              <span>General Store Configs</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">WhatsApp Stylist Number</label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none"
                  placeholder="923001234567"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Store Currency</label>
                <input
                  type="text"
                  required
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none bg-gray-50 text-gray-400 cursor-not-allowed"
                  disabled
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Default Shipping Fee (PKR)</label>
                <input
                  type="number"
                  required
                  value={shippingCharges}
                  onChange={(e) => setShippingCharges(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none"
                  placeholder="200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Free Shipping Threshold Limit (PKR)</label>
                <input
                  type="number"
                  required
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none"
                  placeholder="5000"
                />
              </div>
            </div>
          </div>

          {/* Contact coordinates */}
          <div className="bg-white border border-luxury-gray p-6 sm:p-8 rounded space-y-6">
            <h2 className="font-sans text-base font-bold uppercase tracking-wider text-luxury-gold border-b border-luxury-gray pb-2 flex items-center">
              <Mail size={16} className="mr-2" />
              <span>Contact Coordinates</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Public Phone Number</label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none"
                  placeholder="+92 300 1234567"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Public Email Address</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none"
                  placeholder="sales@ubaidalabayat.com"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Boutique Mailing Address</label>
                <input
                  type="text"
                  required
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none"
                  placeholder="Street 10, DHA Karachi"
                />
              </div>
            </div>
          </div>

          {/* Payment Methods & Direct Bank Transfer CMS */}
          <div className="bg-white border border-luxury-gray p-6 sm:p-8 rounded space-y-6">
            <div className="border-b border-luxury-gray pb-3">
              <h2 className="font-sans text-base font-bold uppercase tracking-wider text-luxury-gold flex items-center">
                <Landmark size={18} className="mr-2" />
                <span>Payment Methods & Direct Bank Account (CMS)</span>
              </h2>
              <p className="text-[11px] text-luxury-textGray mt-1">
                Manage your official bank account details for direct customer transfers and enable/disable checkout payment options.
              </p>
            </div>

            {/* Payment Method Active Toggles */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">
                Active Checkout Payment Methods
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* COD Toggle */}
                <label className={`flex items-center p-3 border rounded cursor-pointer transition-all ${
                  codEnabled ? 'border-green-500 bg-green-50/40' : 'border-gray-200 bg-gray-50 opacity-60'
                }`}>
                  <input
                    type="checkbox"
                    checked={codEnabled}
                    onChange={(e) => setCodEnabled(e.target.checked)}
                    className="rounded text-green-600 focus:ring-green-500 h-4 w-4"
                  />
                  <div className="ml-2.5">
                    <span className="text-xs font-bold text-luxury-dark block">Cash on Delivery</span>
                    <span className="text-[10px] text-luxury-textGray">{codEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </label>

                {/* Bank Transfer Toggle */}
                <label className={`flex items-center p-3 border rounded cursor-pointer transition-all ${
                  bankTransferEnabled ? 'border-luxury-gold bg-luxury-cream/40' : 'border-gray-200 bg-gray-50 opacity-60'
                }`}>
                  <input
                    type="checkbox"
                    checked={bankTransferEnabled}
                    onChange={(e) => setBankTransferEnabled(e.target.checked)}
                    className="rounded text-luxury-gold focus:ring-luxury-gold h-4 w-4"
                  />
                  <div className="ml-2.5">
                    <span className="text-xs font-bold text-luxury-dark block">Bank Transfer</span>
                    <span className="text-[10px] text-luxury-textGray">{bankTransferEnabled ? 'Enabled (Manual)' : 'Disabled'}</span>
                  </div>
                </label>

                {/* Card Payment Toggle */}
                <label className={`flex items-center p-3 border rounded cursor-pointer transition-all ${
                  cardPaymentEnabled ? 'border-purple-500 bg-purple-50/40' : 'border-gray-200 bg-gray-50 opacity-60'
                }`}>
                  <input
                    type="checkbox"
                    checked={cardPaymentEnabled}
                    onChange={(e) => setCardPaymentEnabled(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                  <div className="ml-2.5">
                    <span className="text-xs font-bold text-luxury-dark block">Credit / Debit Card</span>
                    <span className="text-[10px] text-luxury-textGray">
                      {cardPaymentEnabled ? 'Enabled (Simulation)' : 'Off (Gateway Needed)'}
                    </span>
                  </div>
                </label>
              </div>

              {!cardPaymentEnabled && (
                <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded flex items-center">
                  <AlertCircle size={12} className="mr-1.5 flex-shrink-0" />
                  <span>
                    Card payment is kept OFF by default to prevent fraud orders until a payment gateway (Safepay / Paymob) is linked.
                  </span>
                </p>
              )}
            </div>

            {/* Bank Account Details Grid */}
            <div className="border-t border-luxury-gray pt-4 space-y-4">
              <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-luxury-dark flex items-center">
                <span>Official Bank Coordinates (Shown to Customers)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none"
                    placeholder="e.g. Faysal Bank Limited (FBL) or Meezan Bank"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">
                    Account Title / Beneficiary Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={accountTitle}
                    onChange={(e) => setAccountTitle(e.target.value)}
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none"
                    placeholder="e.g. UBAID ULLAH"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none font-mono"
                    placeholder="e.g. 3010123456789012"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">
                    IBAN (International Bank Account Number)
                  </label>
                  <input
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value.toUpperCase())}
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none font-mono uppercase"
                    placeholder="e.g. PK36FAYS0000001234567890"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">
                    Branch Name / Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none"
                    placeholder="e.g. Main Boulevard Branch, Lahore"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">
                    Transfer & WhatsApp Instructions for Buyer
                  </label>
                  <textarea
                    rows={2}
                    value={bankInstructions}
                    onChange={(e) => setBankInstructions(e.target.value)}
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none"
                    placeholder="Please transfer the exact amount and share the screenshot on WhatsApp..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* About us text */}
          <div className="bg-white border border-luxury-gray p-6 sm:p-8 rounded space-y-6">
            <h2 className="font-sans text-base font-bold uppercase tracking-wider text-luxury-dark border-b border-luxury-gray pb-2">
              Website Texts
            </h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Boutique Brand Story (About Us Summary)</label>
                <textarea
                  rows={4}
                  required
                  value={aboutUsText}
                  onChange={(e) => setAboutUsText(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Footer Copyright Notice</label>
                <input
                  type="text"
                  required
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: socials */}
        <div className="space-y-6">
          <div className="bg-white border border-luxury-gray p-6 rounded space-y-6">
            <h2 className="font-sans text-base font-bold uppercase tracking-wider text-luxury-gold border-b border-luxury-gray pb-2 flex items-center">
              <Landmark size={16} className="mr-2" />
              <span>Social Links CMS</span>
            </h2>

            {/* List of active social links */}
            {socialLinks.length === 0 ? (
              <p className="text-xs italic text-luxury-textGray">No social links configured yet.</p>
            ) : (
              <div className="space-y-2.5">
                {socialLinks.map((link) => (
                  <div key={link.platform} className="flex justify-between items-center bg-luxury-light border border-luxury-gray p-2.5 rounded text-xs">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-luxury-dark text-luxury-gold flex items-center justify-center flex-shrink-0 shadow-sm">
                        <SocialIcon platform={link.platform} url={link.url} size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-luxury-dark uppercase tracking-wider text-[10px]">{link.platform}</p>
                        <p className="text-[10px] text-luxury-textGray truncate max-w-[130px] sm:max-w-[160px]" title={link.url}>{link.url}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSocial(link.platform, e)}
                      className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase tracking-wider p-1.5 flex-shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new link form panel */}
            <div className="border-t border-luxury-gray pt-4 space-y-3.5">
              <p className="text-[10px] uppercase font-bold tracking-wider text-luxury-dark">Add New Platform Link</p>
              
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold tracking-wider text-luxury-textGray block font-semibold">Select Social Media *</label>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded bg-luxury-dark text-luxury-gold flex items-center justify-center flex-shrink-0 shadow-sm">
                    <SocialIcon platform={newPlatform} url={newUrl} size={16} />
                  </div>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="w-full text-xs border border-luxury-gray p-2 rounded bg-white font-semibold focus:outline-none"
                  >
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Pinterest">Pinterest</option>
                    <option value="Twitter/X">Twitter/X</option>
                    <option value="Snapchat">Snapchat</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Threads">Threads</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold tracking-wider text-luxury-textGray block">Platform URL *</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none"
                  placeholder="https://tiktok.com/@ubaidalabayat"
                />
              </div>

              <button
                type="button"
                onClick={handleAddSocial}
                className="w-full luxury-btn-outline py-2 text-[10px] font-bold uppercase tracking-widest"
              >
                + Add Social Link
              </button>
            </div>

            {/* Submit button */}
            <div className="border-t border-luxury-gray pt-4">
              <button
                type="submit"
                disabled={submitLoading}
                className="w-full luxury-btn py-3 text-xs tracking-widest font-semibold flex items-center justify-center space-x-2"
              >
                <Save size={14} />
                <span>{submitLoading ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default Settings;
