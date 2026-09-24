import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Settings as SettingsIcon, 
  Landmark, 
  Mail, 
  DollarSign, 
  Facebook, 
  CreditCard, 
  ShieldCheck, 
  Megaphone,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const [bankTransferDiscountPercentage, setBankTransferDiscountPercentage] = useState(5);
  const [bankTransferDiscountEnabled, setBankTransferDiscountEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);
  const [cardPaymentEnabled, setCardPaymentEnabled] = useState(false);
  const [cardDiscountPercentage, setCardDiscountPercentage] = useState(10);
  const [cardDiscountEnabled, setCardDiscountEnabled] = useState(true);

  // Dynamic Social Links State
  const [socialLinks, setSocialLinks] = useState([]);
  const [newPlatform, setNewPlatform] = useState('Facebook');
  const [newUrl, setNewUrl] = useState('');

  const [aboutUsText, setAboutUsText] = useState('');
  const [footerText, setFooterText] = useState('');

  const [submitLoading, setSubmitLoading] = useState(false);

  // Sync settings when loaded
  useEffect(() => {
    if (settings) {
      setWhatsappNumber(settings.whatsappNumber || '');
      setShippingCharges(settings.shippingCharges !== undefined ? settings.shippingCharges : 200);
      setFreeShippingThreshold(settings.freeShippingThreshold !== undefined ? settings.freeShippingThreshold : 5000);
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
      setBankTransferDiscountPercentage(settings.bankTransferDiscountPercentage !== undefined ? settings.bankTransferDiscountPercentage : 5);
      setBankTransferDiscountEnabled(settings.bankTransferDiscountEnabled !== false);
      setCodEnabled(settings.codEnabled !== false);
      setCardPaymentEnabled(settings.cardPaymentEnabled === true);
      setCardDiscountPercentage(settings.cardDiscountPercentage !== undefined ? settings.cardDiscountPercentage : 10);
      setCardDiscountEnabled(settings.cardDiscountEnabled !== false);
    }
  }, [settings]);

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
    if (e && e.preventDefault) e.preventDefault();
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
      bankTransferDiscountPercentage: Number(bankTransferDiscountPercentage),
      bankTransferDiscountEnabled,
      codEnabled,
      cardPaymentEnabled,
      cardDiscountPercentage: Number(cardDiscountPercentage),
      cardDiscountEnabled,
    };

    try {
      const res = await axios.put('/api/settings', payload);
      if (res.data.success) {
        addToast(res.data.message || 'Store settings updated successfully', 'success');
        if (reloadAll) reloadAll();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update store settings', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      {/* Header Bar with Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-luxury-gray gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold uppercase tracking-wider text-luxury-dark">
            Store Settings
          </h1>
          <p className="text-xs text-luxury-textGray tracking-wide mt-1">
            Configure contact coordinates, payment accounts, shipping thresholds, and social channels.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitLoading}
          className="luxury-btn py-2.5 px-6 text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all self-start sm:self-auto"
        >
          {submitLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-luxury-dark border-t-transparent rounded-full animate-spin mr-1" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={15} />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>

      {/* Banner directing to Promotions CMS */}
      <div className="bg-gradient-to-r from-luxury-dark to-[#1f1f1f] text-white p-4 sm:p-5 rounded-lg border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-full bg-luxury-gold/15 text-luxury-gold flex items-center justify-center flex-shrink-0 border border-luxury-gold/30">
            <Megaphone size={18} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              Top Announcement & Promotions Slider (CMS)
            </h3>
            <p className="text-[11px] text-gray-300 mt-0.5">
              Manage your rotating announcements, discount codes, and banner speeds in its dedicated section.
            </p>
          </div>
        </div>

        <Link
          to="/admin/promotions"
          className="luxury-btn-gold py-2 px-4 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 flex-shrink-0 self-start sm:self-auto"
        >
          <span>Open Promotions Manager</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: General & Shipping Coordinates (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* General Store Configs Card */}
          <div className="bg-white border border-luxury-gray p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-luxury-dark flex items-center border-b border-luxury-gray pb-3">
              <SettingsIcon size={16} className="mr-2 text-luxury-gold" />
              <span>General Store Configs</span>
            </h2>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">
                  WhatsApp Stylist Number
                </label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder="923287512751"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">
                  Store Currency
                </label>
                <input
                  type="text"
                  value={currency}
                  disabled
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded bg-gray-50 text-gray-400 cursor-not-allowed font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">
                    Default Shipping Fee (PKR)
                  </label>
                  <input
                    type="number"
                    required
                    value={shippingCharges}
                    onChange={(e) => setShippingCharges(e.target.value)}
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                    placeholder="200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">
                    Free Shipping Threshold (PKR)
                  </label>
                  <input
                    type="number"
                    required
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                    placeholder="5000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Coordinates Card */}
          <div className="bg-white border border-luxury-gray p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-luxury-dark flex items-center border-b border-luxury-gray pb-3">
              <Mail size={16} className="mr-2 text-luxury-gold" />
              <span>Contact Coordinates</span>
            </h2>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">
                  Public Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder="+92 328 7512751"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">
                  Public Email Address
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder="sales@ubaidalabayat.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">
                  Boutique Mailing Address
                </label>
                <input
                  type="text"
                  required
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder="123 Fashion Street, Karachi, Pakistan"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Section 2: Payment Methods & Direct Bank Transfer CMS */}
        <div className="bg-white border border-luxury-gray p-6 sm:p-8 rounded-lg shadow-sm space-y-6">
          <div className="border-b border-luxury-gray pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-luxury-dark flex items-center">
                <Landmark size={18} className="mr-2 text-luxury-gold" />
                <span>Payment Methods & Direct Bank Account (CMS)</span>
              </h2>
              <p className="text-[11px] text-luxury-textGray mt-0.5">
                Enable or disable checkout payment channels, configure direct bank transfer details, and set online payment discounts.
              </p>
            </div>
          </div>

          {/* 3 Payment Methods Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Direct Bank Transfer Channel */}
            <div className={`p-4 rounded-lg border transition-all ${
              bankTransferEnabled ? 'border-luxury-gold/60 bg-luxury-cream/20 shadow-sm' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-luxury-dark flex items-center">
                  <Landmark size={14} className="mr-1.5 text-luxury-gold" />
                  Bank Transfer
                </span>
                <input
                  type="checkbox"
                  checked={bankTransferEnabled}
                  onChange={(e) => setBankTransferEnabled(e.target.checked)}
                  className="rounded text-luxury-gold focus:ring-luxury-gold h-4 w-4"
                />
              </div>
              <p className="text-[10px] text-luxury-textGray mt-1.5 leading-relaxed">
                Customers transfer funds directly to your verified bank account and upload receipt.
              </p>
              {bankTransferEnabled && (
                <div className="mt-3 pt-3 border-t border-luxury-gray/60 space-y-2">
                  <label className="flex items-center space-x-2 text-[10px] font-bold text-luxury-dark cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bankTransferDiscountEnabled}
                      onChange={(e) => setBankTransferDiscountEnabled(e.target.checked)}
                      className="rounded text-luxury-gold h-3.5 w-3.5"
                    />
                    <span>Offer Instant Discount</span>
                  </label>
                  {bankTransferDiscountEnabled && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={bankTransferDiscountPercentage}
                        onChange={(e) => setBankTransferDiscountPercentage(e.target.value)}
                        className="w-16 text-xs border border-luxury-gray p-1.5 rounded text-center font-bold"
                      />
                      <span className="text-[11px] text-luxury-textGray">% Off Order Total</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cash on Delivery Channel */}
            <div className={`p-4 rounded-lg border transition-all ${
              codEnabled ? 'border-luxury-gold/60 bg-luxury-cream/20 shadow-sm' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-luxury-dark flex items-center">
                  <DollarSign size={14} className="mr-1.5 text-luxury-gold" />
                  Cash on Delivery
                </span>
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={(e) => setCodEnabled(e.target.checked)}
                  className="rounded text-luxury-gold focus:ring-luxury-gold h-4 w-4"
                />
              </div>
              <p className="text-[10px] text-luxury-textGray mt-1.5 leading-relaxed">
                Customer pays cash upon doorstep package delivery nationwide.
              </p>
            </div>

            {/* Card Payment Channel */}
            <div className={`p-4 rounded-lg border transition-all ${
              cardPaymentEnabled ? 'border-luxury-gold/60 bg-luxury-cream/20 shadow-sm' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-luxury-dark flex items-center">
                  <CreditCard size={14} className="mr-1.5 text-luxury-gold" />
                  Debit / Credit Card
                </span>
                <input
                  type="checkbox"
                  checked={cardPaymentEnabled}
                  onChange={(e) => setCardPaymentEnabled(e.target.checked)}
                  className="rounded text-luxury-gold focus:ring-luxury-gold h-4 w-4"
                />
              </div>
              <p className="text-[10px] text-luxury-textGray mt-1.5 leading-relaxed">
                Online payment via Visa/Mastercard payment gateway.
              </p>
              {cardPaymentEnabled && (
                <div className="mt-3 pt-3 border-t border-luxury-gray/60 space-y-2">
                  <label className="flex items-center space-x-2 text-[10px] font-bold text-luxury-dark cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cardDiscountEnabled}
                      onChange={(e) => setCardDiscountEnabled(e.target.checked)}
                      className="rounded text-luxury-gold h-3.5 w-3.5"
                    />
                    <span>Card Discount</span>
                  </label>
                  {cardDiscountEnabled && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={cardDiscountPercentage}
                        onChange={(e) => setCardDiscountPercentage(e.target.value)}
                        className="w-16 text-xs border border-luxury-gray p-1.5 rounded text-center font-bold"
                      />
                      <span className="text-[11px] text-luxury-textGray">% Off Order Total</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bank Account Details Inputs */}
          {bankTransferEnabled && (
            <div className="bg-luxury-light p-5 rounded-lg border border-luxury-gray space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-luxury-goldDark">
                Direct Bank Account Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-bold text-luxury-textGray">Bank Name *</label>
                  <input
                    type="text"
                    required={bankTransferEnabled}
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded bg-white"
                    placeholder="Faysal Bank Limited (FBL)"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-bold text-luxury-textGray">Account Title *</label>
                  <input
                    type="text"
                    required={bankTransferEnabled}
                    value={accountTitle}
                    onChange={(e) => setAccountTitle(e.target.value)}
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded bg-white uppercase"
                    placeholder="UBAID ULLAH"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-bold text-luxury-textGray">Account Number *</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded bg-white font-mono"
                    placeholder="301012345678"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-bold text-luxury-textGray">IBAN (International Bank Account Number)</label>
                  <input
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded bg-white font-mono uppercase"
                    placeholder="PK36FAYS0000301012345678"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-bold text-luxury-textGray">Branch Name / Code</label>
                  <input
                    type="text"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded bg-white"
                    placeholder="DHA Phase 5 Branch, Karachi"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] uppercase font-bold text-luxury-textGray">Payment Instructions for Customer</label>
                <textarea
                  rows={2}
                  value={bankInstructions}
                  onChange={(e) => setBankInstructions(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded bg-white"
                  placeholder="Please transfer the exact order amount and share screenshot on WhatsApp..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Social Media Channels CMS */}
        <div className="bg-white border border-luxury-gray p-6 sm:p-8 rounded-lg shadow-sm space-y-6">
          <div className="border-b border-luxury-gray pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-luxury-dark flex items-center">
                <Facebook size={16} className="mr-2 text-luxury-gold" />
                <span>Social Media Channels (CMS)</span>
              </h2>
              <p className="text-[11px] text-luxury-textGray mt-0.5">
                Active social links are displayed in the footer and contact sections across the storefront.
              </p>
            </div>
            <span className="text-[11px] text-luxury-gold font-bold">
              {socialLinks.length} Active Links
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Active links list */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">
                Configured Channels
              </label>
              {socialLinks.length === 0 ? (
                <p className="text-xs text-luxury-textGray italic p-3 bg-luxury-light rounded border border-dashed border-luxury-gray">
                  No social links added yet. Add one on the right.
                </p>
              ) : (
                <div className="space-y-2">
                  {socialLinks.map((link) => (
                    <div key={link.platform} className="flex justify-between items-center bg-luxury-light border border-luxury-gray p-2.5 rounded text-xs hover:border-luxury-gold/50 transition-colors">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-luxury-dark text-luxury-gold flex items-center justify-center flex-shrink-0 shadow-sm">
                          <SocialIcon platform={link.platform} url={link.url} size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-luxury-dark uppercase tracking-wider text-[10px]">{link.platform}</p>
                          <p className="text-[10px] text-luxury-textGray truncate max-w-[180px] sm:max-w-[220px]" title={link.url}>{link.url}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSocial(link.platform, e)}
                        className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase tracking-wider p-1.5 flex-shrink-0"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add new link form */}
            <div className="bg-luxury-light p-4 rounded-lg border border-luxury-gray space-y-3">
              <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-dark block">
                Add New Social Link
              </label>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold tracking-wider text-luxury-textGray block">Select Platform</label>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded bg-luxury-dark text-luxury-gold flex items-center justify-center flex-shrink-0 shadow-sm">
                    <SocialIcon platform={newPlatform} url={newUrl} size={15} />
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

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold tracking-wider text-luxury-textGray block">URL *</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded bg-white focus:outline-none"
                  placeholder="https://instagram.com/ubaidalabayat"
                />
              </div>

              <button
                type="button"
                onClick={handleAddSocial}
                className="w-full luxury-btn-outline py-2.5 text-[10px] font-bold uppercase tracking-widest mt-1"
              >
                + Add Social Channel
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Brand Text & Footer Coordinates */}
        <div className="bg-white border border-luxury-gray p-6 sm:p-8 rounded-lg shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-luxury-dark flex items-center border-b border-luxury-gray pb-3">
            <ShieldCheck size={16} className="mr-2 text-luxury-gold" />
            <span>Brand Story & Footer Metadata</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">
                About Us Snippet
              </label>
              <textarea
                rows={3}
                value={aboutUsText}
                onChange={(e) => setAboutUsText(e.target.value)}
                className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                placeholder="Ubaid Al Abayat is a premium fashion destination dedicated to elegant, minimal, and high-quality Abayas, Hijabs, and luxury accessories."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">
                Footer Copyright Text
              </label>
              <textarea
                rows={3}
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold font-mono text-[11px]"
                placeholder="© 2026 Ubaid Al Abayat. All Rights Reserved. Designed for elegance."
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-end pt-2 pb-6">
          <button
            type="submit"
            disabled={submitLoading}
            className="luxury-btn py-3 px-8 text-xs font-bold uppercase tracking-widest flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
          >
            {submitLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-luxury-dark border-t-transparent rounded-full animate-spin mr-1" />
                <span>Saving All Settings...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save Store Settings</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Settings;
