import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import Wishlist from './pages/Wishlist';
import Contact from './pages/Contact';
import About from './pages/About';
import PolicyPage from './pages/PolicyPage'; // Unified for privacy, terms, refunds

// Customer Dashboard
import Account from './pages/customer/Account';
import MyOrders from './pages/customer/MyOrders';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminOrders from './pages/admin/Orders';
import AdminInventory from './pages/admin/Inventory';
import AdminCoupons from './pages/admin/Coupons';
import AdminReviews from './pages/admin/Reviews';
import AdminSettings from './pages/admin/Settings';
import AdminBanners from './pages/admin/Banners';
import AdminCustomers from './pages/admin/Customers';
import AdminMessages from './pages/admin/Messages';

// Route Guards
const CustomerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-luxury-light">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isStaff } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-luxury-light">Loading...</div>;
  return user && isStaff ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <SettingsProvider>
            <CartProvider>
            <Routes>
              {/* Public & Customer Routes under Main Layout */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="product/:slug" element={<ProductDetails />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="order-success/:orderNumber" element={<OrderSuccess />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="contact" element={<Contact />} />
                <Route path="about" element={<About />} />
                
                {/* Policy Page Routes */}
                <Route path="privacy" element={<PolicyPage type="privacy" />} />
                <Route path="terms" element={<PolicyPage type="terms" />} />
                <Route path="returns" element={<PolicyPage type="returns" />} />

                {/* Customer Account Routes (Protected) */}
                <Route path="account" element={<CustomerRoute><Account /></CustomerRoute>} />
                <Route path="account/orders" element={<CustomerRoute><MyOrders /></CustomerRoute>} />
              </Route>

              {/* Admin Dashboard Routes (Protected) */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="banners" element={<AdminBanners />} />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
