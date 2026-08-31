import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, Check, AlertCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
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

  const subtotal = getSubtotal();
  const total = getTotal();
  const shipping = getShippingCharges();
  const remainingForFreeShipping = freeShippingThreshold - subtotal;
  const progressPercent = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponLoading(true);
    const success = await applyCoupon(couponCode);
    setCouponLoading(false);
    if (success) setCouponCode('');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="inline-block p-6 bg-white border border-luxury-gray rounded-full text-luxury-gold shadow-sm">
            <ShoppingBag size={48} />
          </div>
          <h2 className="font-serif text-2xl font-bold uppercase tracking-wider">Your Cart is Empty</h2>
          <p className="text-xs text-luxury-textGray">
            You don't have any items in your shopping cart. Explore our latest luxury Abayas and Hijabs to find your perfect fit!
          </p>
          <Link to="/shop" className="inline-block luxury-btn text-xs tracking-widest font-semibold px-8 py-3.5">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-serif font-bold uppercase tracking-wider border-b border-luxury-gray pb-4">
        Shopping Cart
      </h1>

      {/* Cart Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Left Column: Items List */}
        <div className="lg:col-span-2 space-y-6 bg-white border border-luxury-gray p-6 rounded">
          
          {/* Free Shipping Alert */}
          <div className="bg-luxury-light p-4 border border-luxury-gray rounded text-xs space-y-2">
            {subtotal >= freeShippingThreshold ? (
              <p className="text-green-800 font-bold uppercase tracking-wider text-[10px]">
                🎉 Congratulations! You have unlocked FREE shipping.
              </p>
            ) : (
              <>
                <p className="text-luxury-textGray">
                  Add <span className="font-bold text-luxury-dark">PKR {remainingForFreeShipping}</span> more to unlock <span className="font-semibold text-luxury-goldDark">FREE SHIPPING</span>
                </p>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-luxury-gold h-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </>
            )}
          </div>

          {/* Table Header (Desktop Only) */}
          <div className="hidden sm:grid grid-cols-6 text-[10px] font-bold uppercase tracking-widest text-luxury-goldDark pb-4 border-b border-luxury-gray">
            <span className="col-span-3">Product Details</span>
            <span className="text-center">Price</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Subtotal</span>
          </div>

          {/* Cart Items */}
          <div className="divide-y divide-luxury-gray">
            {cartItems.map((item) => (
              <div key={item.cartId} className="py-6 grid grid-cols-1 sm:grid-cols-6 gap-4 items-center">
                
                {/* Details */}
                <div className="col-span-3 flex space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-20 object-cover border border-luxury-gray flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <Link
                      to={`/product/${item.slug}`}
                      className="font-serif text-xs sm:text-sm font-semibold text-luxury-dark hover:text-luxury-gold transition-colors leading-snug line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-[10px] text-luxury-textGray uppercase tracking-wider">
                      Size: {item.size} | Color: {item.color}
                    </p>
                    <p className="text-[10px] text-luxury-textGray font-mono uppercase">
                      SKU: {item.sku}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="text-center text-xs font-semibold font-sans sm:block flex justify-between items-center border-b sm:border-0 pb-1 border-luxury-gray">
                  <span className="sm:hidden text-[10px] text-luxury-textGray uppercase">Price:</span>
                  <span>PKR {item.price}</span>
                </div>

                {/* Quantity */}
                <div className="text-center flex justify-between sm:justify-center items-center border-b sm:border-0 pb-1 border-luxury-gray">
                  <span className="sm:hidden text-[10px] text-luxury-textGray uppercase">Quantity:</span>
                  <div className="flex items-center border border-luxury-gray bg-white">
                    <button
                      onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                      className="p-1 text-luxury-textGray hover:text-luxury-dark"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                      className="p-1 text-luxury-textGray hover:text-luxury-dark"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-right text-xs font-bold font-sans sm:block flex justify-between items-center pb-1">
                  <span className="sm:hidden text-[10px] text-luxury-textGray uppercase">Subtotal:</span>
                  <div className="flex items-center justify-end space-x-4">
                    <span>PKR {item.price * item.quantity}</span>
                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors ml-4"
                      title="Remove Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Bottom actions */}
          <div className="pt-6 border-t border-luxury-gray flex justify-between items-center">
            <Link
              to="/shop"
              className="text-xs uppercase tracking-widest font-semibold flex items-center hover:text-luxury-gold transition-colors"
            >
              <ArrowLeft size={14} className="mr-2" />
              Continue Shopping
            </Link>
          </div>

        </div>

        {/* Right Column: Checkout Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-luxury-gray p-6 rounded space-y-6">
            
            <h2 className="font-serif text-sm uppercase tracking-widest font-bold border-b border-luxury-gray pb-3">
              Order Summary
            </h2>

            {/* Coupons Form */}
            {coupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 rounded text-xs">
                <div className="flex items-center text-green-800">
                  <Check size={14} className="mr-2" />
                  <span>Coupon <strong className="uppercase">{coupon.code}</strong> applied!</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-500 hover:underline uppercase tracking-wider font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleCouponSubmit} className="flex">
                <input
                  type="text"
                  placeholder="COUPON CODE"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 border border-luxury-gray px-3 py-2 text-xs uppercase tracking-wider rounded-l focus:outline-none focus:border-luxury-gold"
                />
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="bg-luxury-dark text-white px-4 py-2 text-xs font-semibold rounded-r hover:bg-luxury-gold hover:text-luxury-dark transition-colors"
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

            {/* Proceed to checkout */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full luxury-btn py-4 text-center text-xs tracking-[0.2em]"
            >
              Proceed To Checkout
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
