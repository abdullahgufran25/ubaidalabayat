import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, CreditCard, Landmark, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
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

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('Online');
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
          <div className="bg-white border border-luxury-gray p-6 rounded space-y-4">
            <h2 className="font-serif text-sm uppercase tracking-widest font-bold text-luxury-gold border-b border-luxury-gray pb-2">
              Payment Method
            </h2>

            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded text-[11px] flex items-center space-x-2.5 font-bold uppercase tracking-wider">
              <CreditCard size={14} className="text-green-600" />
              <span>Secure Credit/Debit Card Gateway</span>
            </div>

            {/* Card Payment Info Box */}
            <div className="bg-luxury-light border border-luxury-gray p-5 rounded space-y-4 text-xs">
              <p className="font-bold text-luxury-dark uppercase tracking-wider text-[10px] flex items-center">
                <CreditCard size={14} className="mr-1.5 text-luxury-gold" />
                <span>Credit Card Billing Details</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-luxury-textGray block">Cardholder Name *</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold bg-white"
                    placeholder="Ayesha Fatima"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-luxury-textGray block">Card Number (16 Digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength="19"
                    value={cardNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                      setCardNumber(val);
                    }}
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold bg-white font-mono"
                    placeholder="1234 5678 1234 5678"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-luxury-textGray block">Expiry Date *</label>
                  <input
                    type="text"
                    required
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
                    required
                    maxLength="4"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold bg-white font-mono"
                    placeholder="•••"
                  />
                </div>
              </div>
            </div>
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
