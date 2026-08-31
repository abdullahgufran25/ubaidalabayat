import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

const Coupons = () => {
  const { addToast } = useToast();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('0');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/coupons');
      if (res.data.success) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      addToast('Failed to fetch coupons list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinOrderAmount('0');
    setMaxDiscount('');
    
    // Set default expiry date to 1 month from now
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setExpiryDate(nextMonth.toISOString().split('T')[0]);
    
    setUsageLimit('');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEditModal = (coupon) => {
    setEditingId(coupon._id);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue);
    setMinOrderAmount(coupon.minOrderAmount);
    setMaxDiscount(coupon.maxDiscount || '');
    setExpiryDate(new Date(coupon.expiryDate).toISOString().split('T')[0]);
    setUsageLimit(coupon.usageLimit || '');
    setIsActive(coupon.isActive);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code || !discountValue || !expiryDate) {
      addToast('Please enter coupon code, discount values, and expiry date', 'warning');
      return;
    }

    setSubmitLoading(true);

    const payload = {
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount),
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      expiryDate,
      usageLimit: usageLimit ? Number(usageLimit) : null, // null is unlimited
      isActive,
    };

    try {
      let res;
      if (editingId) {
        res = await axios.put(`/api/coupons/${editingId}`, payload);
      } else {
        res = await axios.post('/api/coupons', payload);
      }

      if (res.data.success) {
        addToast(res.data.message, 'success');
        setModalOpen(false);
        fetchCoupons();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save coupon', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount coupon?')) return;

    try {
      const res = await axios.delete(`/api/coupons/${id}`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchCoupons();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete coupon', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-luxury-gray pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold uppercase tracking-wider">Coupons Manager</h1>
          <p className="text-xs text-luxury-textGray uppercase tracking-widest mt-1">
            Create, Edit and activate percentage or fixed discount coupons
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="luxury-btn py-2.5 text-xs font-semibold tracking-widest flex items-center justify-center space-x-2"
        >
          <Plus size={14} />
          <span>Add Coupon</span>
        </button>
      </div>

      {/* Coupons Grid Table */}
      {loading ? (
        <div className="py-20 text-center flex flex-col justify-center items-center text-xs uppercase tracking-widest text-luxury-textGray">
          <RefreshCw size={24} className="animate-spin text-luxury-gold mb-2" />
          <span>Loading coupons...</span>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white border border-luxury-gray rounded p-12 text-center text-xs text-luxury-textGray uppercase tracking-wider">
          No coupons found in database. Click "Add Coupon" to create first promo.
        </div>
      ) : (
        <div className="bg-white border border-luxury-gray rounded overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-luxury-gray">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-luxury-goldDark font-bold">
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Discount Value</th>
                  <th className="p-4 text-center">Min Order Required</th>
                  <th className="p-4 text-center">Usage Count</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-gray">
                {coupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiryDate) < new Date();
                  
                  return (
                    <tr key={coupon._id} className="hover:bg-gray-55 transition-colors">
                      <td className="p-4 font-bold text-sm tracking-widest text-luxury-dark uppercase font-mono">{coupon.code}</td>
                      <td className="p-4 font-semibold font-sans">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}% Off`
                          : `PKR ${coupon.discountValue} Off`}
                      </td>
                      <td className="p-4 text-center font-bold font-sans">PKR {coupon.minOrderAmount}</td>
                      <td className="p-4 text-center font-bold font-sans text-xs">
                        {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : '(Unlimited)'}
                      </td>
                      <td className={`p-4 font-mono ${isExpired ? 'text-red-500 font-semibold' : ''}`}>
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                        {isExpired && ' (Expired)'}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${
                          coupon.isActive && !isExpired
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                          {coupon.isActive && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditModal(coupon)}
                          className="p-2 border border-luxury-gray text-luxury-dark hover:bg-luxury-cream transition-colors inline-block"
                          title="Edit Coupon"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="p-2 border border-red-200 text-red-600 hover:bg-red-50 transition-colors inline-block"
                          title="Delete Coupon"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxury-dark bg-opacity-70 p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-luxury-light p-6 sm:p-8 shadow-2xl rounded border border-luxury-gray animate-fade-in space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-luxury-gray pb-3">
              <h3 className="font-serif text-lg font-bold uppercase tracking-wider">
                {editingId ? 'Edit Coupon' : 'Create Coupon'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:text-luxury-gold">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Code */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold uppercase font-mono tracking-widest"
                  placeholder="WELCOME10"
                />
              </div>

              {/* Discount Type */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">Discount Model</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none bg-white font-semibold"
                >
                  <option value="percentage">Percentage (%) Discount</option>
                  <option value="fixed">Fixed Flat Amount (PKR) Discount</option>
                </select>
              </div>

              {/* Discount Value */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">
                  {discountType === 'percentage' ? 'Percentage Off (%) *' : 'Discount Value (PKR) *'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder={discountType === 'percentage' ? '15' : '1000'}
                />
              </div>

              {/* Min Order */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Minimum Order Value Required (PKR)</label>
                <input
                  type="number"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder="0"
                />
              </div>

              {/* Max Discount (Only percentage) */}
              {discountType === 'percentage' && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Maximum Discount Cap (PKR - Optional)</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                    placeholder="e.g. 2000"
                  />
                </div>
              )}

              {/* Expiry Date */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none"
                />
              </div>

              {/* Usage Limit */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Total Usage Limit Count (Leave empty for Unlimited)</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder="e.g. 100"
                />
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
                  <span>Active Promo Coupon</span>
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
                  {submitLoading ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Coupons;
