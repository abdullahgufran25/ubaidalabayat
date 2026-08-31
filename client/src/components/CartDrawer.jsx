import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, Ticket, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    cartItems,
    coupon,
    discountAmount,
    couponError,
    shippingCharges,
    freeShippingThreshold,
    updateQuantity,
    removeFromCart,
    getSubtotal,
    getShippingCharges,
    getTotal,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const total = getTotal();
  const shipping = getShippingCharges();
  const freeShippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = freeShippingThreshold - subtotal;

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponLoading(true);
    const success = await applyCoupon(couponCode);
    setCouponLoading(false);
    if (success) setCouponCode('');
  };

  const handleCheckoutClick = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-luxury-dark bg-opacity-60 animate-fade-in">
      {/* Overlay Closer */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-luxury-light h-full shadow-2xl flex flex-col justify-between z-10 animate-fade-in">
        
        {/* Header */}
        <div className="p-5 border-b border-luxury-gray flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="font-serif text-lg font-bold uppercase tracking-wider">Your Cart</h2>
            <span className="bg-luxury-dark text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:text-luxury-gold transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {cartItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <p className="text-sm text-luxury-textGray mb-6">Your shopping cart is empty.</p>
              <button
                onClick={() => { onClose(); navigate('/shop'); }}
                className="luxury-btn text-[10px]"
              >
                Browse Shop
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Free Shipping Indicator */}
              <div className="bg-white p-3 border border-luxury-gray rounded shadow-sm text-xs">
                {subtotal >= freeShippingThreshold ? (
                  <p className="text-green-700 font-semibold uppercase tracking-wider text-[10px]">
                    🎉 You qualify for FREE shipping!
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-luxury-textGray">
                      Add <span className="font-bold text-luxury-dark">PKR {remainingForFreeShipping}</span> more for <span className="font-semibold text-luxury-goldDark">FREE SHIPPING</span>
                    </p>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-luxury-gold h-full transition-all duration-500 ease-out"
                        style={{ width: `${freeShippingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="divide-y divide-luxury-gray">
                {cartItems.map((item) => (
                  <div key={item.cartId} className="py-4 flex space-x-4">
                    {/* Image */}
                    <img
                      src={item.image}
                      alt={item.name}
                      onClick={() => { onClose(); navigate(`/product/${item.slug}`); }}
                      className="w-16 h-20 object-cover border border-luxury-gray cursor-pointer hover:opacity-95"
                    />

                    {/* Meta */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3
                          onClick={() => { onClose(); navigate(`/product/${item.slug}`); }}
                          className="font-serif text-xs font-semibold hover:text-luxury-gold cursor-pointer leading-tight"
                        >
                          {item.name}
                        </h3>
                        <p className="text-[10px] text-luxury-textGray uppercase tracking-wider mt-1">
                          Size: {item.size} | Color: {item.color}
                        </p>
                      </div>

                      {/* Quantity Action */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-luxury-gray bg-white">
                          <button
                            onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                            className="p-1 text-luxury-textGray hover:text-luxury-dark"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                            className="p-1 text-luxury-textGray hover:text-luxury-dark"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="text-xs font-bold font-sans">PKR {item.price * item.quantity}</span>
                      </div>
                    </div>

                    {/* Delete Icon */}
                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="text-red-500 hover:text-red-700 self-start p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-luxury-gray bg-white space-y-4">
            
            {/* Coupon Promo Field */}
            {coupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 rounded text-xs">
                <div className="flex items-center text-green-800">
                  <Check size={14} className="mr-2" />
                  <span>Coupon <strong className="uppercase">{coupon.code}</strong> applied!</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-500 hover:text-red-700 hover:underline uppercase tracking-wider font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleCouponSubmit} className="flex">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="ENTER COUPON CODE"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full border border-luxury-gray px-3 py-2 text-xs uppercase tracking-wider rounded-l focus:outline-none focus:border-luxury-gold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="bg-luxury-dark text-white px-4 py-2 text-xs rounded-r hover:bg-luxury-gold hover:text-luxury-dark font-medium transition-colors"
                >
                  APPLY
                </button>
              </form>
            )}

            {couponError && (
              <div className="flex items-center text-[10px] text-red-600 font-semibold uppercase tracking-wider">
                <AlertCircle size={10} className="mr-1" />
                <span>{couponError}</span>
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-2 text-xs uppercase tracking-wider font-semibold border-b border-luxury-gray pb-4">
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

            {/* Total */}
            <div className="flex justify-between items-center text-sm font-bold uppercase font-serif">
              <span>Total Amount</span>
              <span className="font-sans text-base">PKR {total}</span>
            </div>

            {/* Checkout Action */}
            <button
              onClick={handleCheckoutClick}
              className="w-full luxury-btn py-3 text-center text-xs tracking-[0.2em]"
            >
              Proceed To Checkout
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CartDrawer;
