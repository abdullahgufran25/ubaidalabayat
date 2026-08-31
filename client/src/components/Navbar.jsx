import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import logoImg from '../assets/logo.png';

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
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-luxury-light shadow-md py-4 sm:py-4.5 border-b border-luxury-gray'
          : 'bg-transparent py-7 sm:py-8'
      }`}
    >
      <div className="max-w-[1550px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="grid grid-cols-3 items-center">
          
          {/* Column 1: Mobile Toggle / Left Navigation Links */}
          <div className="flex items-center justify-start">
            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="text-luxury-dark hover:text-luxury-gold p-2 transition-colors"
              >
                <Menu size={22} />
              </button>
            </div>

            {/* Navigation Links - Left (Desktop) */}
            <nav className="hidden md:flex space-x-6 lg:space-x-8 text-xs lg:text-sm font-semibold tracking-widest uppercase">
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

          {/* Column 2: Logo and Name (Centered) */}
          <div className="flex items-center justify-center text-center">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src={logoImg} 
                alt="Ubaid Al Abayat Logo" 
                className="h-9 w-9 sm:h-11 sm:w-11 lg:h-12 lg:w-12 object-contain animate-logo-shimmer" 
              />
              <div className="text-left">
                <h1 className="font-serif text-sm sm:text-base lg:text-lg font-black tracking-[0.12em] uppercase text-luxury-dark leading-tight hover:text-luxury-gold transition-colors">
                  Ubaid Al Abayat
                </h1>
                <p className="text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.2em] text-luxury-gold font-bold uppercase leading-none mt-0.5 sm:mt-1">
                  Luxury Modest Fashion
                </p>
              </div>
            </Link>
          </div>

          {/* Column 3: Icons - Right */}
          <div className="flex items-center justify-end space-x-2 sm:space-x-3 lg:space-x-4">
            
            {/* Search */}
            <button
              onClick={onSearchOpen}
              className="text-luxury-dark hover:text-luxury-gold p-1.5 transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="hidden md:inline-flex text-luxury-dark hover:text-luxury-gold p-1.5 transition-colors relative"
            >
              <Heart size={20} />
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
            >
              <ShoppingBag size={20} />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-luxury-dark text-white font-sans text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="text-luxury-dark hover:text-luxury-gold p-1.5 transition-colors flex items-center"
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

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-luxury-dark bg-opacity-50">
          <div className="w-80 bg-luxury-light h-full p-6 shadow-2xl flex flex-col justify-between animate-fade-in">
            <div>
              <div className="flex justify-between items-center pb-6 border-b border-luxury-gray">
                <h2 className="font-serif text-lg font-bold uppercase tracking-wider">Navigation</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 hover:text-luxury-gold"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="mt-8 flex flex-col space-y-6 text-sm uppercase tracking-widest font-medium">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-luxury-gold">
                  Home
                </Link>
                <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="hover:text-luxury-gold">
                  Shop All
                </Link>
                <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="hover:text-luxury-gold flex items-center justify-between">
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="bg-luxury-gold text-luxury-dark text-[9px] font-bold px-2 py-0.5 rounded-full font-sans">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                
                {/* Categories Accordion/List */}
                <div className="flex flex-col space-y-3">
                  <p className="text-xs text-luxury-gold tracking-wider uppercase font-semibold">Categories</p>
                  <div className="pl-4 flex flex-col space-y-3 text-xs">
                    {categories.map((cat) => (
                      <Link
                        key={cat._id}
                        to={`/shop?category=${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="hover:text-luxury-gold"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-luxury-gold">
                  About Us
                </Link>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-luxury-gold">
                  Contact Us
                </Link>
              </div>
            </div>

            <div className="border-t border-luxury-gray pt-6">
              {user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-luxury-dark">{user.name}</p>
                    <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="text-[10px] text-luxury-gold uppercase tracking-wider">
                      View Account
                    </Link>
                  </div>
                  <button onClick={handleLogout} className="text-red-600 p-2 hover:bg-red-50 rounded-full">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="luxury-btn-outline py-2 text-center text-[10px]">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="luxury-btn py-2 text-center text-[10px]">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
