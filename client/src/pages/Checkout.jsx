import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, CreditCard, Landmark, CheckCircle, AlertCircle, ArrowLeft, Truck } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, coupon, discountAmount, getSubtotal, getShippingCharges, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();

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
      <h1 className="text-3xl font-serif font-bold uppercase tracking-wider border-b border-luxury-gray pb-4">
        Checkout
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Left Columns: Form Fields */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Shipping Address Section */}
          <div className="bg-white border border-luxury-gray p-6 rounded space-y-4">
            <h2 className="font-serif text-sm uppercase tracking-widest font-bold text-luxury-gold border-b border-luxury-gray pb-2">
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
            <h2 className="font-serif text-sm uppercase tracking-widest font-bold text-luxury-gold border-b border-luxury-gray pb-2">
              Select Payment Method *
            </h2>

            {/* Payment Method Radio Options */}
            <div className="grid grid-cols-1 gap-3">
              
              {/* 1. Cash On Delivery */}
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
                      <span className="font-serif font-bold text-xs uppercase tracking-wider text-luxury-dark">
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

              {/* 2. Direct Bank Transfer (Faysal Bank) */}
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
                      <span className="font-serif font-bold text-xs uppercase tracking-wider text-luxury-dark">
                        Faysal Bank Transfer / EasyPaisa
                      </span>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      Direct Transfer
                    </span>
                  </div>
                  <p className="text-[11px] text-luxury-textGray mt-1 leading-relaxed">
                    Transfer directly to our official Faysal Bank account via Faysal Digibank App, ATM, Raast, or JazzCash/EasyPaisa.
                  </p>
                </div>
              </label>

              {/* 3. Credit / Debit Card */}
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
                      <span className="font-serif font-bold text-xs uppercase tracking-wider text-luxury-dark">
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

            </div>

            {/* Faysal Bank Details Box (Shown when Bank Transfer selected) */}
            {paymentMethod === 'Bank Transfer' && (
              <div className="bg-luxury-cream/50 border border-luxury-gold/40 p-5 rounded space-y-3 text-xs animate-fade-in">
                <div className="flex items-center space-x-2 border-b border-luxury-gold/20 pb-2">
                  <Landmark size={18} className="text-luxury-goldDark" />
                  <h4 className="font-serif font-bold text-luxury-dark uppercase tracking-wider text-xs">
                    Official Faysal Bank Account Details
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-luxury-textGray block text-[9px] uppercase font-bold tracking-wider">Bank Name:</span>
                    <strong className="text-luxury-dark font-sans text-xs">Faysal Bank Limited (FBL)</strong>
                  </div>
                  <div>
                    <span className="text-luxury-textGray block text-[9px] uppercase font-bold tracking-wider">Account Title:</span>
                    <strong className="text-luxury-dark font-sans text-xs">UBAID ULLAH</strong>
                  </div>
                  <div className="sm:col-span-2 bg-white p-2.5 rounded border border-luxury-gold/30">
                    <span className="text-luxury-textGray block text-[9px] uppercase font-bold tracking-wider">Instructions:</span>
                    <p className="text-[11px] text-luxury-dark mt-0.5 leading-relaxed">
                      Please transfer the exact order amount (<strong className="text-luxury-goldDark font-bold font-sans">PKR {total}</strong>) and share the transaction screenshot on WhatsApp <strong className="text-luxury-dark">03287512751</strong> along with your Order ID for instant dispatch.
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
            
            <h2 className="font-serif text-sm uppercase tracking-widest font-bold border-b border-luxury-gray pb-3">
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
                    <h4 className="font-serif font-semibold line-clamp-1">{item.name}</h4>
                    <p className="text-[9px] text-luxury-textGray uppercase tracking-wider mt-0.5">
                      Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold font-sans">PKR {item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 text-xs uppercase tracking-wider font-semibold border-t border-luxury-gray pt-4 pb-4">
              <div className="flex justify-between text-luxury-textGray">
                <span>Subtotal</span>
                <span>PKR {subtotal}</span>
              </div>
              <div className="flex justify-between text-luxury-textGray">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `PKR ${shipping}`}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span>- PKR {discountAmount}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-sm font-bold uppercase font-serif border-t border-luxury-gray pt-4">
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
