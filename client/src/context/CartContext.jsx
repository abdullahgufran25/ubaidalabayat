import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children, shippingChargesDefault = 200, freeShippingThresholdDefault = 5000 }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('appliedCoupon');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [discountAmount, setDiscountAmount] = useState(() => {
    try {
      const saved = localStorage.getItem('appliedCoupon');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.calculatedDiscount || 0;
      }
      return 0;
    } catch (e) {
      return 0;
    }
  });
  const [couponError, setCouponError] = useState('');
  
  // Settings sync from SettingsContext if available, otherwise fallback
  const [shippingCharges, setShippingCharges] = useState(shippingChargesDefault);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(freeShippingThresholdDefault);

  // Sync cart and coupon to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('appliedCoupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('appliedCoupon');
    }
  }, [coupon]);

  // Recalculate coupon discount whenever cart items or coupon changes
  useEffect(() => {
    if (!coupon) {
      setDiscountAmount(0);
      return;
    }

    const sub = getSubtotal();
    let discount = 0;

    if (coupon.discountType === 'percentage') {
      discount = (coupon.discountValue / 100) * sub;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    if (discount > sub) {
      discount = sub;
    }

    setDiscountAmount(discount);
  }, [cartItems, coupon]);

  // Add to cart
  const addToCart = (product, quantity, size, color) => {
    // Generate a unique cart item ID based on product ID + size + color
    const cartId = `${product._id}-${size}-${color}`;

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.cartId === cartId);

      if (existingItem) {
        // Check stock limit
        const newQty = existingItem.quantity + quantity;
        if (newQty > product.stock) {
          alert(`Cannot add more. Insufficient stock in inventory (Available: ${product.stock})`);
          return prevItems;
        }
        return prevItems.map((item) =>
          item.cartId === cartId ? { ...item, quantity: newQty } : item
        );
      }

      // If new item, add
      if (quantity > product.stock) {
        alert(`Cannot add. Insufficient stock in inventory (Available: ${product.stock})`);
        return prevItems;
      }

      return [
        ...prevItems,
        {
          cartId,
          product: product._id,
          name: product.name,
          image: product.images[0],
          price: product.salePrice && product.salePrice > 0 ? product.salePrice : product.price,
          originalPrice: product.price,
          size,
          color,
          quantity,
          stock: product.stock,
          sku: product.sku,
          slug: product.slug,
        },
      ];
    });
  };

  // Remove from cart
  const removeFromCart = (cartId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartId !== cartId));
  };

  // Update item quantity
  const updateQuantity = (cartId, quantity) => {
    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      removeFromCart(cartId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.cartId === cartId) {
          if (qty > item.stock) {
            alert(`Cannot update quantity. Only ${item.stock} items are available in stock.`);
            return item;
          }
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    setDiscountAmount(0);
    setCouponError('');
    localStorage.removeItem('cart');
    localStorage.removeItem('appliedCoupon');
  };

  // Calculate totals
  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const getShippingCharges = () => {
    const sub = getSubtotal();
    if (sub === 0 || sub >= freeShippingThreshold) return 0;
    return shippingCharges;
  };

  const getTotal = () => {
    const sub = getSubtotal();
    const ship = getShippingCharges();
    return Math.max(0, sub + ship - discountAmount);
  };

  // Apply Coupon
  const applyCoupon = async (code) => {
    setCouponError('');
    const cleanCode = code ? code.trim().toUpperCase() : '';
    if (!cleanCode) {
      const msg = 'Please enter a coupon code';
      setCouponError(msg);
      return { success: false, message: msg };
    }

    const sub = getSubtotal();
    if (sub === 0) {
      const msg = 'Cart is empty. Please add items to apply a coupon.';
      setCouponError(msg);
      return { success: false, message: msg };
    }

    try {
      const res = await axios.post('/api/coupons/validate', {
        code: cleanCode,
        orderAmount: sub,
      });

      if (res.data.success) {
        setCoupon(res.data.data);
        setDiscountAmount(res.data.data.calculatedDiscount || 0);
        return { success: true, message: res.data.message || `Coupon '${cleanCode}' applied!`, data: res.data.data };
      }
      return { success: false, message: res.data.message || 'Failed to apply coupon' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired coupon code';
      setCouponError(msg);
      setCoupon(null);
      setDiscountAmount(0);
      return { success: false, message: msg };
    }
  };

  // Remove Coupon
  const removeCoupon = () => {
    setCoupon(null);
    setDiscountAmount(0);
    setCouponError('');
    localStorage.removeItem('appliedCoupon');
  };

  // Dynamically update shipping settings (fetched by SettingsContext)
  const updateShippingSettings = (charges, threshold) => {
    setShippingCharges(charges);
    setFreeShippingThreshold(threshold);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        coupon,
        discountAmount,
        couponError,
        shippingCharges,
        freeShippingThreshold,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getSubtotal,
        getShippingCharges,
        getTotal,
        applyCoupon,
        removeCoupon,
        updateShippingSettings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
