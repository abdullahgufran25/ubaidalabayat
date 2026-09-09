import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import logoImg from '../assets/logo.png';
import AnnouncementBar from './AnnouncementBar';

const Navbar = ({ onCartOpen, onSearchOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isStaff } = useAuth();
  const { cartItems } = useCart();
  const { categories } = useSettings();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on path change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Wishlist count
  const [wishlistCount, setWishlistCount] = useState(0);
  useEffect(() => {
    const updateWishlistCount = () => {
      const wish = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(wish.length);
    };
    updateWishlistCount();
    window.addEventListener('storage', updateWishlistCount);
    // Custom event to update wishlist count from details page
    window.addEventListener('wishlistUpdated', updateWishlistCount);
    return () => {
      window.removeEventListener('storage', updateWishlistCount);
      window.removeEventListener('wishlistUpdated', updateWishlistCount);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50">
        {/* Top Promotional Announcement Slider (CMS Configurable) */}
        <AnnouncementBar />

        {/* Main Navbar Bar */}
        <div
          className={`w-full transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-luxury-gray/60 ${
            scrolled
              ? 'py-2 sm:py-2.5 lg:py-3 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08)]'
              : 'py-2.5 sm:py-3 lg:py-3.5 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.06)]'
          }`}
        >
          <div className="max-w-[1550px] mx-auto px-2.5 sm:px-4 lg:px-6">
          <div className="grid grid-cols-[auto_1fr_auto] lg:grid-cols-3 items-center gap-2 lg:gap-4">
            
            {/* Column 1: Mobile & Tablet Toggle (< 1024px) / Desktop Nav Links (>= 1024px) */}
            <div className="flex items-center justify-start">
              {/* Mobile & Tablet Menu Toggle */}
              <div className="lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="text-luxury-dark hover:text-luxury-gold p-1.5 transition-colors focus:outline-none"
                  aria-label="Open navigation menu"
                >
                  <Menu size={22} />
                </button>
              </div>

              {/* Navigation Links - Left (Desktop lg+) */}
              <nav className="hidden lg:flex space-x-6 xl:space-x-8 text-xs lg:text-sm font-semibold tracking-widest uppercase">
                <Link to="/" className="text-luxury-dark hover:text-luxury-gold transition-colors">
                  Home
                </Link>
                <Link to="/shop" className="text-luxury-dark hover:text-luxury-gold transition-colors">
                  Shop
                </Link>
                <div className="relative group">
                  <Link to="/shop" className="text-luxury-dark hover:text-luxury-gold transition-colors">
                    Categories
                  </Link>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-xl border border-luxury-gray opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="py-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat._id}
                          to={`/shop?category=${cat.slug}`}
                          className="block px-4 py-2 text-xs uppercase tracking-wider text-luxury-dark hover:bg-luxury-cream hover:text-luxury-goldDark"
                        >
                          {cat.name}
                        </Link>
                      ))}
                      <Link
                        to="/shop?newArrival=true"
                        className="block px-4 py-2 text-xs uppercase tracking-wider text-luxury-dark hover:bg-luxury-cream hover:text-luxury-goldDark font-semibold"
                      >
                        New Arrivals
                      </Link>
                    </div>
                  </div>
                </div>
                <Link to="/about" className="text-luxury-dark hover:text-luxury-gold transition-colors">
                  About
                </Link>
                <Link to="/contact" className="text-luxury-dark hover:text-luxury-gold transition-colors">
                  Contact
                </Link>
              </nav>
            </div>

            {/* Column 2: Logo and Brand Name (Centered across all screen sizes) */}
            <div className="flex items-center justify-center text-center px-1">
              <Link to="/" className="inline-flex items-center space-x-2 sm:space-x-2.5 lg:space-x-3 max-w-full group">
                <img 
                  src={logoImg} 
                  alt="Ubaid Al Abayat Logo" 
                  className="h-7 w-7 sm:h-9 sm:w-9 lg:h-11 lg:w-11 object-contain flex-shrink-0 animate-logo-shimmer" 
                />
                <div className="text-left whitespace-nowrap">
                  <h1 className="font-serif text-[12px] min-[360px]:text-[13px] sm:text-sm lg:text-base font-black tracking-[0.08em] sm:tracking-[0.12em] uppercase text-luxury-dark leading-tight group-hover:text-luxury-gold transition-colors whitespace-nowrap">
                    Ubaid Al Abayat
                  </h1>
                  <p className="text-[6.5px] min-[360px]:text-[7px] sm:text-[7.5px] lg:text-[8.5px] tracking-[0.16em] sm:tracking-[0.2em] text-luxury-gold font-bold uppercase leading-none mt-0.5 whitespace-nowrap">
                    Luxury Modest Fashion
                  </p>
                </div>
              </Link>
            </div>

            {/* Column 3: Action Icons (Right) */}
            <div className="flex items-center justify-end space-x-1.5 sm:space-x-3 lg:space-x-4">
              
              {/* Search */}
              <button
                onClick={onSearchOpen}
                className="text-luxury-dark hover:text-luxury-gold p-1.5 transition-colors"
                aria-label="Search"
              >
                <Search size={19} />
              </button>

              {/* Wishlist (Desktop: lg+) */}
              <Link
                to="/wishlist"
                className="hidden lg:inline-flex text-luxury-dark hover:text-luxury-gold p-1.5 transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart size={19} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-luxury-gold text-luxury-dark font-sans text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={onCartOpen}
                className="text-luxury-dark hover:text-luxury-gold p-1.5 transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag size={19} />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-luxury-dark text-white font-sans text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* User Dropdown (Desktop: lg+) */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="text-luxury-dark hover:text-luxury-gold p-1.5 transition-colors flex items-center"
                  aria-label="User Account"
                >
                  <User size={20} />
                </button>
                
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white shadow-2xl border border-luxury-gray z-50">
                    <div className="py-2">
                      {user ? (
                        <>
                          <div className="px-4 py-2 border-b border-luxury-gray">
                            <p className="text-xs font-semibold text-luxury-dark">{user.name}</p>
                            <p className="text-[10px] text-luxury-textGray truncate">{user.email}</p>
                          </div>
                          {isStaff && (
                            <Link
                              to="/admin"
                              className="flex items-center px-4 py-2.5 text-xs text-luxury-dark hover:bg-luxury-cream transition-colors"
                            >
                              <Shield size={14} className="mr-2 text-luxury-goldDark" />
                              Admin Dashboard
                            </Link>
                          )}
                          <Link
                            to="/account"
                            className="flex items-center px-4 py-2.5 text-xs text-luxury-dark hover:bg-luxury-cream transition-colors"
                          >
                            <User size={14} className="mr-2" />
                            My Profile
                          </Link>
                          <Link
                            to="/account/orders"
                            className="flex items-center px-4 py-2.5 text-xs text-luxury-dark hover:bg-luxury-cream transition-colors"
                          >
                            <ShoppingBag size={14} className="mr-2" />
                            My Orders
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2.5 text-xs text-red-600 hover:bg-luxury-cream transition-colors border-t border-luxury-gray"
                          >
                            <LogOut size={14} className="mr-2" />
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/login"
                            className="block px-4 py-2.5 text-xs uppercase tracking-wider text-luxury-dark hover:bg-luxury-cream hover:text-luxury-goldDark font-semibold"
                          >
                            Log In
                          </Link>
                          <Link
                            to="/register"
                            className="block px-4 py-2.5 text-xs uppercase tracking-wider text-luxury-dark hover:bg-luxury-cream hover:text-luxury-goldDark"
                          >
                            Register
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>
    </header>

      {/* Mobile & Tablet Drawer Menu (< 1024px) - Positioned OUTSIDE <header> to avoid backdrop-filter trapping */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] flex lg:hidden">
          {/* Backdrop Overlay with blur & smooth dark tint */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Menu Panel (Solid white / off-white, 100% opaque, scrollable) */}
          <div 
            className="relative w-80 max-w-[85vw] h-full bg-[#FFFFFF] shadow-2xl flex flex-col justify-between overflow-y-auto z-10 p-6 animate-fade-in text-luxury-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Brand Header with Official Logo */}
              <div className="flex justify-between items-center pb-5 border-b border-luxury-gray">
                <div className="flex items-center space-x-2.5">
                  <img src={logoImg} alt="Ubaid Al Abayat" className="h-8 w-8 object-contain flex-shrink-0" />
                  <div className="text-left whitespace-nowrap">
                    <span className="font-serif text-sm font-bold uppercase tracking-wider text-luxury-dark block leading-tight">
                      Ubaid Al Abayat
                    </span>
                    <span className="text-[7.5px] text-luxury-gold tracking-widest uppercase font-bold block mt-0.5">
                      Luxury Modest Fashion
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-luxury-cream text-luxury-dark hover:text-luxury-gold transition-colors focus:outline-none"
                  aria-label="Close navigation menu"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="mt-6 flex flex-col space-y-4 text-xs font-semibold uppercase tracking-widest">
                <Link 
                  to="/" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="py-1 text-luxury-dark hover:text-luxury-gold transition-colors"
                >
                  Home
                </Link>
                <Link 
                  to="/shop" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="py-1 text-luxury-dark hover:text-luxury-gold transition-colors"
                >
                  Shop All
                </Link>
                <Link 
                  to="/wishlist" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="py-1 text-luxury-dark hover:text-luxury-gold transition-colors flex items-center justify-between"
                >
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="bg-luxury-gold text-luxury-dark text-[9px] font-bold px-2 py-0.5 rounded-full font-sans">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                
                {/* Categories Accordion/List */}
                <div className="pt-2 pb-1 border-t border-b border-luxury-gray/60 flex flex-col space-y-2.5">
                  <p className="text-[10px] text-luxury-gold tracking-widest uppercase font-bold">Categories</p>
                  <div className="pl-3 flex flex-col space-y-2 text-[11px] font-medium">
                    {categories.map((cat) => (
                      <Link
                        key={cat._id}
                        to={`/shop?category=${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-luxury-dark/90 hover:text-luxury-gold transition-colors py-0.5"
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <Link
                      to="/shop?newArrival=true"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-luxury-goldDark font-semibold hover:underline py-0.5"
                    >
                      New Arrivals
                    </Link>
                  </div>
                </div>

                <Link 
                  to="/about" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="py-1 text-luxury-dark hover:text-luxury-gold transition-colors"
                >
                  About Us
                </Link>
                <Link 
                  to="/contact" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="py-1 text-luxury-dark hover:text-luxury-gold transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Bottom Account Section */}
            <div className="border-t border-luxury-gray pt-5 mt-6">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-luxury-dark">{user.name}</p>
                      <p className="text-[10px] text-luxury-textGray truncate max-w-[180px]">{user.email}</p>
                    </div>
                    <button 
                      onClick={handleLogout} 
                      className="text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                      title="Logout"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                  <div className="flex flex-col space-y-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider">
                    {isStaff && (
                      <Link 
                        to="/admin" 
                        onClick={() => setMobileMenuOpen(false)} 
                        className="flex items-center text-luxury-goldDark hover:underline py-1"
                      >
                        <Shield size={13} className="mr-1.5" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link 
                      to="/account" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="text-luxury-dark hover:text-luxury-gold py-1"
                    >
                      My Profile & Settings
                    </Link>
                    <Link 
                      to="/account/orders" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="text-luxury-dark hover:text-luxury-gold py-1"
                    >
                      My Orders
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="luxury-btn-outline py-2.5 text-center text-[11px]"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="luxury-btn py-2.5 text-center text-[11px]"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
