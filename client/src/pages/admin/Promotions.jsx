import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

const PRESET_TEMPLATES = [
  { text: '10% OFF ON CARD & ONLINE PAYMENTS | USE CODE: LUXURY10', link: '/shop' },
  { text: 'FREE SHIPPING ON ALL ORDERS ABOVE RS. 10,000 NATIONWIDE', link: '/shop' },
  { text: 'BESPOKE SAUDI NIDHA FABRIC ABAYAS | HANDCRAFTED ELEGANCE', link: '/shop' },
  { text: 'NEW ARRIVALS: EXCLUSIVE FESTIVE & FORMAL COLLECTION 2026', link: '/shop?newArrival=true' },
  { text: 'COMPLIMENTARY MATCHING HIJAB WITH EVERY LUXURY ABAYA ORDER', link: '/shop' },
];

const Promotions = () => {
  const { settings, reloadAll } = useSettings();
  const { addToast } = useToast();

  const [enabled, setEnabled] = useState(true);
  const [speed, setSpeed] = useState(4); // in seconds
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New message form state
  const [newText, setNewText] = useState('');
  const [newLink, setNewLink] = useState('/shop');

  // Inline editing state
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState('');
  const [editLink, setEditLink] = useState('');

  // Live preview slider state
  const [previewIndex, setPreviewIndex] = useState(0);

  // Sync state from settings on mount or update
  useEffect(() => {
    if (settings) {
      if (settings.announcementBar) {
        setEnabled(settings.announcementBar.enabled !== false);
        setSpeed(Math.round((settings.announcementBar.speed || 4000) / 1000));
        if (Array.isArray(settings.announcementBar.messages)) {
          setMessages(settings.announcementBar.messages);
        }
      }
      setLoading(false);
    }
  }, [settings]);

  // Preview cycle timer
  useEffect(() => {
    if (!enabled || messages.length <= 1) return;
    const interval = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % messages.length);
    }, speed * 1000);
    return () => clearInterval(interval);
  }, [enabled, messages.length, speed]);

  // Add new promotion to state
  const handleAdd = (e) => {
    e.preventDefault();
    if (!newText.trim()) {
      addToast('Please enter promotion message text', 'warning');
      return;
    }
    const updated = [
      ...messages,
      { text: newText.trim(), link: newLink.trim() },
    ];
    setMessages(updated);
    setNewText('');
    setNewLink('/shop');
    addToast('Promotion added! Click "Save & Publish Changes" to apply to live store.', 'info');
  };

  // Start editing a message
  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditText(messages[index].text);
    setEditLink(messages[index].link || '');
  };

  // Save inline edit
  const handleSaveEdit = (index) => {
    if (!editText.trim()) {
      addToast('Message text cannot be empty', 'warning');
      return;
    }
    const updated = [...messages];
    updated[index] = { text: editText.trim(), link: editLink.trim() };
    setMessages(updated);
    setEditingIndex(null);
    addToast('Message updated! Click "Save & Publish Changes" to push to live store.', 'info');
  };

  // Cancel inline edit
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditText('');
    setEditLink('');
  };

  // Delete message
  const handleDelete = (index) => {
    if (messages.length <= 1) {
      if (!window.confirm('Deleting this will leave 0 promotions in the top slider. Continue?')) {
        return;
      }
    }
    const updated = messages.filter((_, i) => i !== index);
    setMessages(updated);
    if (previewIndex >= updated.length) {
      setPreviewIndex(0);
    }
    addToast('Promotion removed from list. Remember to save changes.', 'info');
  };

  // Move message up or down
  const handleMove = (index, direction) => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= messages.length) return;
    const updated = [...messages];
    const temp = updated[newIdx];
    updated[newIdx] = updated[index];
    updated[index] = temp;
    setMessages(updated);
  };

  // Apply preset template
  const handleApplyPreset = (item) => {
    setNewText(item.text);
    setNewLink(item.link);
  };

  // Save to Database (PUT /api/settings)
  const handleSaveToDatabase = async () => {
    setSaving(true);
    try {
      const payload = {
        announcementBar: {
          enabled,
          speed: Math.max(1, Number(speed)) * 1000,
          messages: messages.map((m) => ({
            text: m.text.trim(),
            link: m.link ? m.link.trim() : '',
          })),
        },
      };

      const res = await axios.put('/api/settings', payload);
      if (res.data.success) {
        addToast('Top Promotion Bar saved and published live to website!', 'success');
        if (reloadAll) reloadAll();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save promotion settings to database', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="animate-spin text-luxury-gold" size={28} />
          <p className="text-xs uppercase tracking-widest text-luxury-textGray">Loading Database Promotions...</p>
        </div>
      </div>
    );
  }

  const currentPreviewMsg = messages[previewIndex] || messages[0];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="border-b border-luxury-gray pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold uppercase tracking-wider text-luxury-dark flex items-center">
            <Megaphone size={26} className="mr-3 text-luxury-gold" />
            <span>Top Promotion Bar (CMS)</span>
          </h1>
          <p className="text-xs text-luxury-textGray tracking-wide mt-1">
            Manage the dynamic promotional announcements running at the very top of your storefront from MongoDB database.
          </p>
        </div>

        {/* Action Button Group */}
        <div className="flex items-center space-x-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="luxury-btn-outline py-2.5 px-4 text-xs tracking-wider flex items-center space-x-1.5"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">View Live Site</span>
          </a>

          <button
            type="button"
            onClick={handleSaveToDatabase}
            disabled={saving}
            className="luxury-btn py-2.5 px-6 text-xs font-bold uppercase tracking-widest flex items-center space-x-2 shadow-md hover:shadow-lg transition-all"
          >
            {saving ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Saving to DB...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save & Publish Live</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Management (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Master Controls & Status */}
          <div className="bg-white border border-luxury-gray p-6 rounded shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-luxury-gray pb-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-luxury-dark">
                  Bar Display Controls
                </h2>
                <p className="text-[11px] text-luxury-textGray mt-0.5">
                  Turn the top bar on/off and adjust the rotation duration between promotions.
                </p>
              </div>

              {/* Status pill */}
              <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                <span className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span>{enabled ? 'Active on Live Site' : 'Disabled (Hidden)'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-luxury-light p-4 rounded border border-luxury-gray/70">
              {/* Enable Switch */}
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="rounded text-luxury-gold focus:ring-luxury-gold h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-luxury-dark block">Show Promotion Bar</span>
                  <span className="text-[10px] text-luxury-textGray">Display announcement slider at website top</span>
                </div>
              </label>

              {/* Speed Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">
                  <span>Slide Duration</span>
                  <span className="text-luxury-goldDark font-mono font-bold text-xs">{speed} Seconds</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="1"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full accent-luxury-gold cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-luxury-dark w-6 text-center">{speed}s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Messages List */}
          <div className="bg-white border border-luxury-gray p-6 rounded shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-luxury-gray pb-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-luxury-dark flex items-center">
                  <span>Active Promotions ({messages.length})</span>
                </h2>
                <p className="text-[11px] text-luxury-textGray mt-0.5">
                  Each message rotates sequentially in the top announcement bar.
                </p>
              </div>

              <span className="text-[11px] text-luxury-gold font-bold">
                {messages.length} Active in Database
              </span>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-8 bg-luxury-light rounded border border-dashed border-luxury-gray">
                <AlertCircle size={28} className="mx-auto text-luxury-gold mb-2" />
                <p className="text-xs font-semibold text-luxury-dark uppercase tracking-wider">No Promotions Active</p>
                <p className="text-[11px] text-luxury-textGray mt-1">Add a promotion below to start displaying it on the storefront.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((item, idx) => (
                  <div
                    key={idx}
                    className={`border rounded p-3.5 transition-all ${
                      editingIndex === idx
                        ? 'border-luxury-gold bg-luxury-cream/30 ring-1 ring-luxury-gold/50'
                        : 'border-luxury-gray bg-white hover:border-luxury-gold/60'
                    }`}
                  >
                    {editingIndex === idx ? (
                      /* Inline Edit Mode */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-luxury-goldDark">
                            Editing Promotion #{idx + 1}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-luxury-textGray block mb-1">
                              Promotional Text *
                            </label>
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full text-xs border border-luxury-gray p-2 rounded focus:outline-none focus:border-luxury-gold uppercase"
                              placeholder="e.g. 15% OFF ON ALL ORDERS | USE CODE: EID15"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-luxury-textGray block mb-1">
                              Target Link (Optional)
                            </label>
                            <input
                              type="text"
                              value={editLink}
                              onChange={(e) => setEditLink(e.target.value)}
                              className="w-full text-xs border border-luxury-gray p-2 rounded focus:outline-none focus:border-luxury-gold"
                              placeholder="e.g. /shop or /shop?category=abayas"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(idx)}
                            className="luxury-btn py-1.5 px-4 text-[10px] font-bold uppercase tracking-wider"
                          >
                            Update Message
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="luxury-btn-outline py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <span className="bg-luxury-cream text-luxury-goldDark font-mono text-[11px] font-bold px-2 py-0.5 rounded flex-shrink-0 mt-0.5">
                            #{idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-luxury-dark tracking-wide uppercase break-words">
                              {item.text}
                            </p>
                            {item.link ? (
                              <p className="text-[10px] text-luxury-textGray mt-0.5 truncate flex items-center">
                                <span className="text-luxury-gold font-semibold mr-1">Target Link:</span>
                                <span className="font-mono text-luxury-dark">{item.link}</span>
                              </p>
                            ) : (
                              <p className="text-[10px] text-luxury-textGray/60 italic mt-0.5">
                                No link attached (Text display only)
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-1 self-end sm:self-auto flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMove(idx, 'up')}
                            disabled={idx === 0}
                            className={`p-1.5 rounded transition-colors ${
                              idx === 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-luxury-cream hover:text-luxury-dark'
                            }`}
                            title="Move Up"
                          >
                            <ArrowUp size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMove(idx, 'down')}
                            disabled={idx === messages.length - 1}
                            className={`p-1.5 rounded transition-colors ${
                              idx === messages.length - 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-luxury-cream hover:text-luxury-dark'
                            }`}
                            title="Move Down"
                          >
                            <ArrowDown size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(idx)}
                            className="p-1.5 text-luxury-goldDark hover:bg-luxury-cream rounded transition-colors"
                            title="Edit Message"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Delete Message"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Promotion Panel */}
          <div className="bg-white border border-luxury-gray p-6 rounded shadow-sm space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-luxury-dark flex items-center">
              <Plus size={16} className="mr-2 text-luxury-gold" />
              <span>Add New Promotion</span>
            </h2>

            {/* Quick Presets */}
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray mb-2">
                Quick Template Presets (Click to Auto-fill):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyPreset(tpl)}
                    className="text-[10px] bg-luxury-cream hover:bg-luxury-gold/20 text-luxury-dark px-2.5 py-1 rounded transition-colors font-medium border border-luxury-gold/30 text-left"
                  >
                    + {tpl.text.split('|')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">
                    Promotional Text *
                  </label>
                  <input
                    type="text"
                    required
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="e.g. FLASH SALE: 20% OFF ON SAUDI ABAYAS | LIMITED TIME"
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">
                    Target Page Link
                  </label>
                  <input
                    type="text"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="e.g. /shop or /shop?category=sale"
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="luxury-btn-outline py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest flex items-center space-x-1.5"
              >
                <Plus size={14} />
                <span>Add To Promotion List</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Live Appearance Preview & Help (1 Col) */}
        <div className="space-y-6">

          {/* Live Appearance Preview Card */}
          <div className="bg-white border border-luxury-gray p-6 rounded shadow-sm space-y-4">
            <div className="border-b border-luxury-gray pb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-luxury-dark flex items-center">
                <Eye size={14} className="mr-1.5 text-luxury-gold" />
                <span>Live Appearance Preview</span>
              </h2>
              <span className="text-[10px] text-luxury-gold font-mono">
                {previewIndex + 1} / {Math.max(1, messages.length)}
              </span>
            </div>

            <p className="text-[11px] text-luxury-textGray leading-relaxed">
              This preview reflects exactly how your promotion will appear at the very top of the storefront.
            </p>

            {/* Storefront Top Bar Mock */}
            <div className="rounded overflow-hidden border border-gray-800 shadow-md">
              {enabled && messages.length > 0 ? (
                <div className="bg-[#0D0D0D] text-white py-2 px-3 text-center select-none relative">
                  <div className="flex items-center justify-between">
                    {/* Mock Arrow Left */}
                    <button
                      type="button"
                      onClick={() => setPreviewIndex((prev) => (prev - 1 + messages.length) % messages.length)}
                      className="text-gray-400 hover:text-white p-0.5"
                    >
                      <ChevronLeft size={12} />
                    </button>

                    {/* Mock Center Message */}
                    <div className="flex items-center justify-center space-x-1.5 px-2 overflow-hidden flex-1 min-w-0">
                      <Sparkles size={11} className="text-luxury-gold flex-shrink-0 animate-pulse" />
                      <span className="text-[10px] font-medium tracking-[0.14em] uppercase text-luxury-light truncate">
                        {currentPreviewMsg?.text}
                      </span>
                      {currentPreviewMsg?.link && (
                        <span className="text-[8.5px] text-luxury-gold font-bold tracking-widest uppercase ml-1 underline underline-offset-2 flex-shrink-0">
                          Shop Now →
                        </span>
                      )}
                    </div>

                    {/* Mock Arrow Right */}
                    <button
                      type="button"
                      onClick={() => setPreviewIndex((prev) => (prev + 1) % messages.length)}
                      className="text-gray-400 hover:text-white p-0.5"
                    >
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 py-3 text-center text-xs text-gray-500 italic">
                  Top promotion bar is currently disabled.
                </div>
              )}

              {/* Mini Mock Navbar below */}
              <div className="bg-white border-t border-gray-200 py-2 px-4 flex items-center justify-between text-[9px] text-gray-600 uppercase tracking-widest font-semibold">
                <span>SHOP • CATEGORIES • ABOUT</span>
                <span className="text-luxury-dark font-serif font-bold text-[10px]">UBAID AL ABAYAT</span>
              </div>
            </div>

            {/* Floating Save Button Reminder */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveToDatabase}
                disabled={saving}
                className="w-full luxury-btn py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2"
              >
                <Save size={14} />
                <span>{saving ? 'Publishing...' : 'Save & Publish Live'}</span>
              </button>
            </div>
          </div>

          {/* CMS Pro Tips */}
          <div className="bg-luxury-cream/40 border border-luxury-gold/30 p-5 rounded space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-luxury-goldDark flex items-center">
              <Sparkles size={13} className="mr-1.5" />
              <span>Pro Promotion Tips</span>
            </h3>
            <ul className="text-[11px] text-luxury-dark/80 space-y-2 leading-relaxed list-disc list-inside">
              <li>
                <strong>Clear Coupon Codes:</strong> Mention discount codes like <code className="bg-white px-1 py-0.5 rounded text-[10px]">LUXURY10</code> prominently.
              </li>
              <li>
                <strong>Free Shipping Highlight:</strong> Inform customers about your nationwide delivery perks.
              </li>
              <li>
                <strong>Keep It Concise:</strong> Highlighting 1-3 rotating messages gives customers the best reading experience.
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Promotions;
