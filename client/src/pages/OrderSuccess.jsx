import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Phone, MessageSquare, ArrowRight, Truck, Copy, Check, Landmark, Printer } from 'lucide-react';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const { settings } = useSettings();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState('');

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await axios.get(`/api/orders/${orderNumber}`);
        if (res.data.success) {
          setOrder(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching success order details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderNumber]);

  const handleWhatsAppStatus = () => {
    if (!order) return;
    const whatsappNum = settings.whatsappNumber || '03287512751';
    let cleanNumber = whatsappNum.replace(/[^\d]/g, '');
    if (cleanNumber.startsWith('03')) {
      cleanNumber = '92' + cleanNumber.substring(1);
    }
    const couponLine = (order.couponDiscount > 0 || order.couponCode)
      ? `\n*Coupon Discount (${order.couponCode || 'PROMO'}):* -PKR ${(order.couponDiscount || (order.cardDiscount ? order.discountAmount - order.cardDiscount : order.discountAmount)).toLocaleString()}`
      : '';
    const cardLine = (order.cardDiscount > 0 || (order.paymentMethod === 'Online' && order.discountAmount > 0 && !order.couponCode))
      ? `\n*Card Payment Discount:* -PKR ${(order.cardDiscount || order.discountAmount).toLocaleString()}`
      : '';

    const message = `Hello Ubaid Al Abayat, I placed an order recently. Here are my bill details:
*Order Number:* ${order.orderNumber}
*Name:* ${order.shippingAddress.fullName}
*Subtotal:* PKR ${order.subtotal?.toLocaleString()}
*Shipping:* ${order.shippingCharges === 0 ? 'FREE' : `PKR ${order.shippingCharges?.toLocaleString()}`}${couponLine}${cardLine}
*Total Payable:* PKR ${order.total?.toLocaleString()}
*Payment Method:* ${order.paymentMethod} (${order.paymentStatus})
Please confirm my order and let me know the status.`;

    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-light">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-t-luxury-gold border-luxury-gray rounded-full animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-widest font-bold text-luxury-textGray">Loading Order Confirmation...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-light text-center px-4">
        <div>
          <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
          <h2 className="font-sans text-lg font-bold uppercase tracking-wider mb-2">Order Confirmed!</h2>
          <p className="text-xs text-luxury-textGray max-w-sm mb-6">
            Your order has been recorded successfully. Please write down your order number: <strong className="text-luxury-dark">{orderNumber}</strong>.
          </p>
          <Link to="/" className="luxury-btn text-[10px]">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      
      {/* Visual Indicator Success */}
      <div className="text-center space-y-3">
        <CheckCircle size={56} className="text-green-600 mx-auto" />
        <h1 className="font-sans text-2xl sm:text-4xl font-bold uppercase tracking-wider text-luxury-dark">
          Thank you for your order!
        </h1>
        <p className="text-xs text-luxury-textGray max-w-md mx-auto">
          Your order has been placed and is currently pending confirmation. A verification call or SMS will be sent to your phone soon.
        </p>
      </div>

      {/* Payment Method Specific Instructions */}
      {order.paymentMethod === 'Bank Transfer' ? (
        <div className="bg-luxury-cream/50 border border-luxury-gold/50 p-6 rounded max-w-2xl mx-auto space-y-4 text-xs animate-fade-in text-left">
          <div className="flex items-center justify-between border-b border-luxury-gold/30 pb-2 text-center sm:text-left">
            <div className="flex items-center space-x-2">
              <Landmark size={18} className="text-luxury-goldDark" />
              <p className="font-sans font-bold text-luxury-dark uppercase tracking-wider text-sm">
                Bank Transfer Required: PKR {order.total}
              </p>
            </div>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded">
              Awaiting Payment
            </span>
          </div>

          <p className="text-luxury-dark leading-relaxed text-center sm:text-left">
            Please transfer <strong className="text-luxury-goldDark font-bold">PKR {order.total}</strong> to our official account below and click the WhatsApp button to share the payment receipt for instant confirmation.
          </p>

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
                  <span className="text-luxury-textGray block text-[9px] uppercase font-bold tracking-wider">IBAN:</span>
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
                <span className="text-luxury-textGray block text-[9px] uppercase font-bold tracking-wider">Branch:</span>
                <p className="text-[11px] text-luxury-dark font-medium">{settings.bankBranch}</p>
              </div>
            )}
          </div>

          <div className="pt-2 text-center sm:text-left">
            <button
              onClick={handleWhatsAppStatus}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              <MessageSquare size={14} />
              <span>Share Payment Screenshot on WhatsApp</span>
            </button>
          </div>
        </div>
      ) : order.paymentMethod === 'COD' ? (
        <div className="bg-green-50 border border-green-200 p-4 rounded max-w-2xl mx-auto text-center text-xs text-green-800 animate-fade-in">
          <p className="font-sans font-bold uppercase tracking-wider text-sm">
            Cash on Delivery (COD) Confirmed
          </p>
          <p className="mt-1 leading-relaxed">
            Please keep exact cash of <strong>PKR {order.total}</strong> ready for the courier. Our team will contact you shortly to verify your delivery address.
          </p>
        </div>
      ) : null}

      {/* Grid: Order details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Info Column */}
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="bg-white border border-luxury-gray p-6 rounded space-y-4">
            <h2 className="font-sans text-sm uppercase tracking-widest font-bold text-luxury-gold border-b border-luxury-gray pb-2 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="font-sans font-bold text-luxury-dark bg-luxury-cream px-2 py-0.5 text-[10px] rounded">
                {order.orderNumber}
              </span>
            </h2>

            <div className="space-y-3 text-xs uppercase tracking-wider text-luxury-dark font-semibold">
              <div className="flex items-center text-luxury-textGray">
                <Calendar size={14} className="mr-2" />
                <span>Date: <span className="font-sans font-medium text-luxury-dark">{new Date(order.createdAt).toLocaleDateString()}</span></span>
              </div>
              
              <div className="flex items-center text-luxury-textGray">
                <MapPin size={14} className="mr-2" />
                <span>Shipping address: 
                  <span className="font-sans font-medium text-luxury-dark block mt-1 normal-case font-normal text-luxury-textGray">
                    {order.shippingAddress.fullName}<br />
                    {order.shippingAddress.address}, {order.shippingAddress.city}<br />
                    Postal: {order.shippingAddress.postalCode}
                  </span>
                </span>
              </div>

              <div className="flex items-center text-luxury-textGray">
                <Phone size={14} className="mr-2" />
                <span>Contact: <span className="font-sans font-medium text-luxury-dark">{order.shippingAddress.phone}</span></span>
              </div>
            </div>
          </div>

          {/* Delivery & Tracking Box */}
          <div className="bg-white border border-luxury-gray p-6 rounded space-y-4">
            <h2 className="font-sans text-sm uppercase tracking-widest font-bold text-luxury-gold border-b border-luxury-gray pb-2 flex items-center">
              <Truck size={16} className="mr-2 text-luxury-goldDark" />
              <span>Courier Tracking</span>
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-luxury-textGray uppercase tracking-wider">Status:</span>
                <span className="bg-luxury-dark text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                  {order.orderStatus}
                </span>
              </div>

              {order.trackingNumber ? (
                <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded space-y-1.5">
                  <p className="font-bold">📦 Tracking Code Assigned:</p>
                  <p className="font-mono text-sm">{order.trackingNumber}</p>
                  <p className="text-[10px] normal-case">Please track your shipment on the logistics website using this code.</p>
                </div>
              ) : (
                <p className="text-xs text-luxury-textGray leading-relaxed pt-2">
                  Once your package is dispatched to the courier service (typically within 24-48 hours), you will receive a tracking ID here to track your package delivery real-time.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items Column */}
        <div className="bg-white border border-luxury-gray p-6 rounded space-y-6">
          <h2 className="font-sans text-sm uppercase tracking-widest font-bold border-b border-luxury-gray pb-2">
            Items Ordered
          </h2>

          <div className="divide-y divide-luxury-gray">
            {order.items.map((item, i) => (
              <div key={i} className="py-3 flex space-x-3 text-xs items-center">
                <div className="flex-1">
                  <h3 className="font-sans font-bold text-luxury-dark">{item.name}</h3>
                  <p className="text-[9px] text-luxury-textGray uppercase tracking-wider mt-0.5">
                    Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                  </p>
                </div>
                <span className="font-sans font-bold">PKR {item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Pricing calculations */}
          <div className="border-t border-luxury-gray pt-4 space-y-2 text-xs uppercase tracking-wider font-semibold text-luxury-textGray">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-luxury-dark font-sans font-medium">PKR {order.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-luxury-dark font-sans font-medium">{order.shippingCharges === 0 ? 'FREE' : `PKR ${order.shippingCharges?.toLocaleString()}`}</span>
            </div>
            {(order.couponDiscount > 0 || (order.couponCode && order.discountAmount > (order.paymentDiscount || order.cardDiscount || 0))) && (
              <div className="flex justify-between text-green-700 bg-green-50/70 p-2 rounded -mx-1 border border-green-200/50">
                <span>Coupon Discount ({order.couponCode || 'PROMO'})</span>
                <span className="font-sans font-medium">- PKR {(order.couponDiscount || (order.discountAmount - (order.paymentDiscount || order.cardDiscount || 0))).toLocaleString()}</span>
              </div>
            )}
            {((order.paymentDiscount && order.paymentDiscount > 0) || (order.cardDiscount && order.cardDiscount > 0) || (['Online', 'Bank Transfer'].includes(order.paymentMethod) && order.discountAmount > 0 && !order.couponCode)) && (
              <div className="flex justify-between text-emerald-700 bg-emerald-50/70 p-2 rounded -mx-1 border border-emerald-200/50">
                <span>{order.paymentDiscountType || (order.paymentMethod === 'Bank Transfer' ? 'Bank Transfer Privilege' : 'Card Payment Privilege')} ({order.paymentDiscountPercentage || order.cardDiscountPercentage || (order.paymentMethod === 'Bank Transfer' ? 5 : 10)}%)</span>
                <span className="font-sans font-medium">- PKR {(order.paymentDiscount || order.cardDiscount || order.discountAmount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm font-bold text-luxury-dark font-sans border-t border-luxury-gray pt-4">
              <div>
                <span>Total Amount ({order.paymentMethod})</span>
                {order.discountAmount > 0 && (
                  <span className="block text-[10px] text-green-700 normal-case font-normal">
                    (Total Savings: PKR {order.discountAmount.toLocaleString()})
                  </span>
                )}
              </div>
              <span className="font-sans text-base text-luxury-goldDark">PKR {order.total?.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Action Buttons footer */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 border-t border-luxury-gray pt-8">
        <button
          type="button"
          onClick={() => window.print()}
          className="w-full sm:w-auto border border-luxury-gray bg-white hover:bg-luxury-cream text-luxury-dark transition-colors font-bold px-6 py-3.5 uppercase tracking-widest text-[10px] rounded flex items-center justify-center shadow-sm"
        >
          <Printer size={15} className="mr-2 text-luxury-goldDark" />
          Print Original Bill / Invoice
        </button>

        <button
          onClick={handleWhatsAppStatus}
          className="w-full sm:w-auto border border-green-200 bg-green-50 text-green-800 hover:bg-green-100 transition-colors font-bold px-8 py-3.5 uppercase tracking-widest text-[10px] rounded flex items-center justify-center"
        >
          <MessageSquare size={16} className="mr-2" />
          Share Bill on WhatsApp
        </button>

        <Link
          to="/shop"
          className="w-full sm:w-auto luxury-btn-outline px-8 py-3.5 text-center flex items-center justify-center"
        >
          <span>Continue Shopping</span>
          <ArrowRight size={14} className="ml-2" />
        </Link>
      </div>

    </div>
  );
};

export default OrderSuccess;
