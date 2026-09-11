import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, CreditCard, Landmark, CheckCircle, AlertCircle, ArrowLeft, Truck, Copy, Check } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';

const Checkout = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    coupon,
    discountAmount,
    couponError,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getShippingCharges,
    getTotal,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { settings } = useSettings();

  // Coupon state in Checkout
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponLocalError, setCouponLocalError] = useState('');

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponLocalError('');
    const success = await applyCoupon(couponInput.trim());
    setCouponLoading(false);
    if (success) {
      addToast(`Coupon '${couponInput.trim().toUpperCase()}' applied successfully!`, 'success');
      setCouponInput('');
    } else {
      setCouponLocalError(couponError || 'Invalid or expired coupon code');
    }
  };

  // Form Shipping States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');

  // Payment State (COD is default in Pakistan)
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    addToast(`${fieldName} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedField(''), 2000);
  };

  // Ensure active payment method is an enabled one
  useEffect(() => {
    if (settings) {
      const cod = settings.codEnabled !== false;
      const bank = settings.bankTransferEnabled !== false;
      const card = settings.cardPaymentEnabled === true;
      if (paymentMethod === 'COD' && !cod) {
        if (bank) setPaymentMethod('Bank Transfer');
        else if (card) setPaymentMethod('Online');
      } else if (paymentMethod === 'Bank Transfer' && !bank) {
        if (cod) setPaymentMethod('COD');
        else if (card) setPaymentMethod('Online');
      } else if (paymentMethod === 'Online' && !card) {
        if (cod) setPaymentMethod('COD');
        else if (bank) setPaymentMethod('Bank Transfer');
      }
    }
  }, [settings, paymentMethod]);

  // Mock Credit Card States
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Pre-populate if customer logged in
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      if (user.address) {
        setAddress(user.address.addressLine || '');
        setCity(user.address.city || '');
        setPostalCode(user.address.postalCode || '');
      }
    }
  }, [user]);

  // If cart is empty, redirect to shop
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/shop');
    }
  }, [cartItems, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !phone || !email || !address || !city || !postalCode) {
      addToast('Please fill in all required shipping fields', 'warning');
      return;
    }

    if (paymentMethod === 'Online') {
      if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        addToast('Please enter credit card billing details', 'warning');
        return;
      }
      const rawCard = cardNumber.replace(/\s/g, '');
      if (rawCard.length < 15 || isNaN(Number(rawCard))) {
        addToast('Invalid credit card number', 'warning');
        return;
      }
      if (cardCvv.length < 3 || isNaN(Number(cardCvv))) {
        addToast('Invalid CVV code', 'warning');
        return;
      }
    }

    setPlacingOrder(true);

    // Format shipping address object
    const shippingAddress = {
      fullName,
      phone,
      email,
      address,
      city,
      postalCode,
    };

    // Format items array matching backend schema
    const orderItems = cartItems.map((item) => ({
      product: item.product,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
      color: item.color,
    }));

    try {
      const res = await axios.post('/api/orders', {
        items: orderItems,
        shippingAddress,
        paymentMethod,
        couponCode: coupon ? coupon.code : undefined,
        notes,
      });

      if (res.data.success) {
        addToast('Order placed successfully!', 'success');
        const createdOrder = res.data.data;
        clearCart();
        navigate(`/order-success/${createdOrder.orderNumber}`);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  const subtotal = getSubtotal();
  const shipping = getShippingCharges();
  const total = getTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <h1 className="text-3xl font-sans font-bold uppercase tracking-wider border-b border-luxury-gray pb-4">
        Checkout
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Left Columns: Form Fields */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Shipping Address Section */}
          <div className="bg-white border border-luxury-gray p-6 rounded space-y-4">
            <h2 className="font-sans text-sm uppercase tracking-widest font-bold text-luxury-gold border-b border-luxury-gray pb-2">
              Shipping Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder="Ayesha Khan"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder="03001234567"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder="ayesha@gmail.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder="Karachi"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Complete Mailing Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder="House 42-B, Street 5, Phase 6, DHA"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Postal Code / Zip *</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder="75500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Special Instructions / Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder="Any delivery details (e.g. Ring bell, deliver to front desk)"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="bg-white border border-luxury-gray p-6 rounded space-y-5">
            <h2 className="font-sans text-sm uppercase tracking-widest font-bold text-luxury-gold border-b border-luxury-gray pb-2">
              Select Payment Method *
            </h2>

            {/* Payment Method Radio Options */}
            <div className="grid grid-cols-1 gap-3">
              
              {/* 1. Cash On Delivery */}
              {settings?.codEnabled !== false && (
                <label 
                  className={`flex items-start p-4 border rounded cursor-pointer transition-all ${
                    paymentMethod === 'COD' 
                      ? 'border-luxury-gold bg-luxury-cream/30 shadow-sm' 
                      : 'border-luxury-gray hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 text-luxury-gold focus:ring-luxury-gold"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Truck size={16} className="text-luxury-gold" />
                        <span className="font-sans font-bold text-xs uppercase tracking-wider text-luxury-dark">
                          Cash on Delivery (COD)
                        </span>
                      </div>
                      <span className="bg-green-100 text-green-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        Most Popular
                      </span>
                    </div>
                    <p className="text-[11px] text-luxury-textGray mt-1 leading-relaxed">
                      Pay in cash directly to the courier when your order arrives at your doorstep. No advance payment required.
                    </p>
                  </div>
                </label>
              )}

              {/* 2. Direct Bank Transfer */}
              {settings?.bankTransferEnabled !== false && (
                <label 
                  className={`flex items-start p-4 border rounded cursor-pointer transition-all ${
                    paymentMethod === 'Bank Transfer' 
                      ? 'border-luxury-gold bg-luxury-cream/30 shadow-sm' 
                      : 'border-luxury-gray hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Bank Transfer"
                    checked={paymentMethod === 'Bank Transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 text-luxury-gold focus:ring-luxury-gold"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Landmark size={16} className="text-luxury-gold" />
                        <span className="font-sans font-bold text-xs uppercase tracking-wider text-luxury-dark">
                          Direct Bank Transfer / EasyPaisa / Raast
                        </span>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        Extra 5% Privilege
                      </span>
                    </div>
                    <p className="text-[11px] text-luxury-textGray mt-1 leading-relaxed">
                      Transfer directly to our official {settings?.bankName || 'bank'} account via Bank App, ATM, Raast, or Mobile Wallet.
                    </p>
                  </div>
                </label>
              )}

              {/* 3. Credit / Debit Card (Shown only if enabled in CMS) */}
              {settings?.cardPaymentEnabled === true && (
                <label 
                  className={`flex items-start p-4 border rounded cursor-pointer transition-all ${
                    paymentMethod === 'Online' 
                      ? 'border-luxury-gold bg-luxury-cream/30 shadow-sm' 
                      : 'border-luxury-gray hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online"
                    checked={paymentMethod === 'Online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 text-luxury-gold focus:ring-luxury-gold"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CreditCard size={16} className="text-luxury-gold" />
                        <span className="font-sans font-bold text-xs uppercase tracking-wider text-luxury-dark">
                          Credit / Debit Card
                        </span>
                      </div>
                      <span className="bg-purple-100 text-purple-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        Visa / Mastercard
                      </span>
                    </div>
                    <p className="text-[11px] text-luxury-textGray mt-1 leading-relaxed">
                      Pay securely using any Pakistani or International Visa / Mastercard debit or credit card.
                    </p>
                  </div>
                </label>
              )}

            </div>

            {/* Dynamic Bank Transfer Details Box (Shown when Bank Transfer selected) */}
            {paymentMethod === 'Bank Transfer' && (
              <div className="bg-luxury-cream/50 border border-luxury-gold/40 p-5 rounded space-y-4 text-xs animate-fade-in">
                <div className="flex items-center justify-between border-b border-luxury-gold/20 pb-2">
                  <div className="flex items-center space-x-2">
                    <Landmark size={18} className="text-luxury-goldDark" />
                    <h4 className="font-sans font-bold text-luxury-dark uppercase tracking-wider text-xs">
                      Official Bank Coordinates
                    </h4>
                  </div>
                  <span className="text-[10px] text-luxury-goldDark font-semibold uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-luxury-gold/30">
                    Prepayment Account
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-white p-3 rounded border border-luxury-gold/30">
                    <span className="text-luxury-textGray block text-[9px] uppercase font-bold tracking-wider">Bank Name:</span>
                    <strong className="text-luxury-dark font-sans text-xs">{settings?.bankName || 'Faysal Bank Limited (FBL)'}</strong>
                  </div>

                  <div className="bg-white p-3 rounded border border-luxury-gold/30">
                    <span className="text-luxury-textGray block text-[9px] uppercase font-bold tracking-wider">Account Title:</span>
                    <strong className="text-luxury-dark font-sans text-xs">{settings?.accountTitle || 'UBAID ULLAH'}</strong>
                  </div>

                  {settings?.accountNumber && (
                    <div className="sm:col-span-2 flex items-center justify-between bg-white p-3 rounded border border-luxury-gold/30">
                      <div>
                        <span className="text-luxury-textGray block text-[9px] uppercase font-bold tracking-wider">Account Number:</span>
                        <strong className="text-luxury-dark font-mono text-sm tracking-widest">{settings.accountNumber}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settings.accountNumber, 'Account Number')}
                        className="flex items-center space-x-1.5 text-[10px] uppercase font-bold tracking-wider bg-luxury-cream text-luxury-dark px-3 py-1.5 rounded hover:bg-luxury-gold hover:text-white transition-all shadow-sm"
                      >
                        {copiedField === 'Account Number' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                        <span>{copiedField === 'Account Number' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  )}

                  {settings?.iban && (
                    <div className="sm:col-span-2 flex items-center justify-between bg-white p-3 rounded border border-luxury-gold/30">
                      <div>
                        <span className="text-luxury-textGray block text-[9px] uppercase font-bold tracking-wider">IBAN Number:</span>
                        <strong className="text-luxury-dark font-mono text-xs tracking-wider break-all">{settings.iban}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settings.iban, 'IBAN')}
                        className="flex items-center space-x-1.5 text-[10px] uppercase font-bold tracking-wider bg-luxury-cream text-luxury-dark px-3 py-1.5 rounded hover:bg-luxury-gold hover:text-white transition-all shadow-sm flex-shrink-0 ml-2"
                      >
                        {copiedField === 'IBAN' ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                        <span>{copiedField === 'IBAN' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  )}

                  {settings?.bankBranch && (
                    <div className="sm:col-span-2 bg-white p-2.5 rounded border border-luxury-gold/30">
                      <span className="text-luxury-textGray block text-[9px] uppercase font-bold tracking-wider">Branch Details:</span>
                      <p className="text-[11px] text-luxury-dark font-medium">{settings.bankBranch}</p>
                    </div>
                  )}

                  <div className="sm:col-span-2 bg-white p-3 rounded border border-luxury-gold/30 space-y-1">
                    <span className="text-luxury-textGray block text-[9px] uppercase font-bold tracking-wider">Instructions:</span>
                    <p className="text-[11px] text-luxury-dark leading-relaxed">
                      {settings?.bankInstructions || 'Please transfer the exact order amount and share the payment screenshot on WhatsApp with your Order ID for instant dispatch.'}
                    </p>
                    <p className="text-[11px] text-luxury-dark pt-1 border-t border-gray-100">
                      Amount to transfer: <strong className="text-luxury-goldDark font-bold font-sans text-xs">PKR {getTotal()}</strong> | WhatsApp for proof: <strong className="text-luxury-dark font-mono">{settings?.whatsappNumber || '03287512751'}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Card Payment Info Box (Shown when Online selected) */}
            {paymentMethod === 'Online' && (
              <div className="bg-luxury-light border border-luxury-gray p-5 rounded space-y-4 text-xs animate-fade-in">
                <p className="font-bold text-luxury-dark uppercase tracking-wider text-[10px] flex items-center">
                  <CreditCard size={14} className="mr-1.5 text-luxury-gold" />
                  <span>Card Billing Details</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-luxury-textGray block">Cardholder Name *</label>
                    <input
                      type="text"
                      required={paymentMethod === 'Online'}
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold bg-white"
                      placeholder="Ubaid Ullah"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-luxury-textGray block">Card Number (16 Digits) *</label>
                    <input
                      type="text"
                      required={paymentMethod === 'Online'}
                      maxLength="19"
                      value={cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                        setCardNumber(val);
                      }}
                      className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold bg-white font-mono"
                      placeholder="5475 •••• •••• ••••"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-luxury-textGray block">Expiry Date *</label>
                    <input
                      type="text"
                      required={paymentMethod === 'Online'}
                      maxLength="5"
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\//g, '');
                        if (val.length > 2) {
                          val = val.substring(0, 2) + '/' + val.substring(2);
                        }
                        setCardExpiry(val);
                      }}
                      className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold bg-white font-mono"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-luxury-textGray block">CVV (Security Code) *</label>
                    <input
                      type="password"
                      required={paymentMethod === 'Online'}
                      maxLength="4"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold bg-white font-mono"
                      placeholder="•••"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Checkout Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-luxury-gray p-6 rounded space-y-6">
            
            <h2 className="font-sans text-sm uppercase tracking-widest font-bold border-b border-luxury-gray pb-3">
              Checkout Summary
            </h2>

            {/* Line Items List */}
            <div className="divide-y divide-luxury-gray max-h-60 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.cartId} className="py-3 flex space-x-3 text-xs">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-12 object-cover border border-luxury-gray flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h4 className="font-sans font-semibold line-clamp-1">{item.name}</h4>
                    <p className="text-[9px] text-luxury-textGray uppercase tracking-wider mt-0.5">
                      Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold font-sans">PKR {item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Promo / Coupon Code Section */}
            <div className="border-t border-luxury-gray pt-4 space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-dark block">
                Have a Coupon / Promo Code?
              </label>

              {coupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2.5 rounded text-xs">
                  <div className="flex items-center text-green-800">
                    <Check size={14} className="mr-2 flex-shrink-0 text-green-600" />
                    <span className="font-medium text-[11px]">
                      Coupon <strong className="uppercase font-bold">{coupon.code}</strong> applied!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[10px] text-red-500 hover:text-red-700 font-semibold uppercase tracking-wider ml-2 underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="COUPON CODE"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      if (couponLocalError) setCouponLocalError('');
                    }}
                    className="flex-1 border border-luxury-gray px-3 py-2 text-xs uppercase tracking-wider rounded focus:outline-none focus:border-luxury-gold font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="bg-luxury-dark text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded hover:bg-luxury-gold hover:text-luxury-dark transition-colors disabled:opacity-50 flex items-center"
                  >
                    {couponLoading ? '...' : 'APPLY'}
                  </button>
                </div>
              )}

              {(couponLocalError || couponError) && !coupon && (
                <div className="flex items-center text-[10px] text-red-600 font-semibold uppercase tracking-wider mt-1">
                  <AlertCircle size={11} className="mr-1 flex-shrink-0" />
                  <span>{couponLocalError || couponError}</span>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 text-xs uppercase tracking-wider font-semibold border-t border-luxury-gray pt-4 pb-4">
              <div className="flex justify-between text-luxury-textGray">
                <span>Subtotal</span>
                <span>PKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-luxury-textGray">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `PKR ${shipping.toLocaleString()}`}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-700 font-bold">
                  <span>Coupon Discount ({coupon?.code})</span>
                  <span>- PKR {discountAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-sm font-bold uppercase font-sans border-t border-luxury-gray pt-4">
              <span>Total Amount</span>
              <span className="font-sans text-base">PKR {total}</span>
            </div>

            {/* Submit Order Action */}
            <button
              type="submit"
              disabled={placingOrder}
              className="w-full luxury-btn py-4 text-center text-xs tracking-[0.2em]"
            >
              {placingOrder ? 'Processing...' : 'Place Order'}
            </button>

            <Link
              to="/cart"
              className="block text-center text-[10px] uppercase tracking-widest font-semibold text-luxury-textGray hover:text-luxury-dark"
            >
              Modify Cart Items
            </Link>

          </div>
        </div>

      </form>
    </div>
  );
};

export default Checkout;
