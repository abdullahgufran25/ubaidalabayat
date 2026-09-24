import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderOpen,
  ClipboardList,
  Boxes,
  Ticket,
  MessageSquare,
  Image,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Store,
  Users,
  Mail,
  Megaphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef = useRef(null);

  // Smoothly scroll admin main content to top on tab change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', path: '/admin/categories', icon: FolderOpen },
    { name: 'Orders', path: '/admin/orders', icon: ClipboardList },
    { name: 'Inventory', path: '/admin/inventory', icon: Boxes },
    { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { name: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Messages', path: '/admin/messages', icon: Mail },
    { name: 'Banners', path: '/admin/banners', icon: Image },
    { name: 'Promotions (Top Bar)', path: '/admin/promotions', icon: Megaphone },
    { name: 'Store Settings', path: '/admin/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-luxury-dark text-white select-none font-sans">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-800 flex-shrink-0">
        <Link to="/" className="block text-center group">
          <h1 className="font-sans text-base font-bold tracking-widest uppercase text-white group-hover:text-luxury-gold transition-colors">
            Ubaid Al Abayat
          </h1>
          <span className="text-[9px] text-luxury-gold uppercase tracking-[0.2em] font-semibold block mt-0.5">
            Admin Control Panel
          </span>
        </Link>
      </div>

      {/* Navigation links (Smooth scrolling with compact spacing) */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded text-xs uppercase tracking-wider font-semibold transition-all ${
                isActive
                  ? 'bg-luxury-gold text-luxury-dark shadow-md font-bold'
                  : 'text-gray-300 hover:bg-gray-800/90 hover:text-white'
              }`}
            >
              <div className="flex items-center min-w-0 pr-2">
                <Icon size={16} className={`mr-2.5 flex-shrink-0 ${isActive ? 'text-luxury-dark' : 'text-luxury-gold'}`} />
                <span className="truncate">{item.name}</span>
              </div>
              <ChevronRight size={11} className={`flex-shrink-0 ${isActive ? 'text-luxury-dark' : 'text-gray-600'}`} />
            </Link>
          );
        })}
      </nav>

      {/* Footer operations (Always pinned to bottom!) */}
      <div className="p-3.5 border-t border-gray-800 space-y-2.5 flex-shrink-0 bg-luxury-dark">
        {/* Customer Site Link */}
        <Link
          to="/"
          className="flex items-center px-3 py-2 text-xs uppercase tracking-wider font-semibold text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors"
        >
          <Store size={15} className="mr-2.5 text-luxury-gold flex-shrink-0" />
          <span>View Customer Site</span>
        </Link>
        
        {/* Profile & Logout */}
        <div className="flex items-center justify-between px-2 pt-2 border-t border-gray-800/60">
          <div className="truncate pr-2">
            <p className="text-xs font-bold truncate text-white">{user?.name || 'Administrator'}</p>
            <p className="text-[9px] text-gray-400 truncate lowercase">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 p-1.5 hover:bg-gray-800 rounded transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex bg-luxury-light text-luxury-dark overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-luxury-dark border-r border-gray-800 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Main Container Workspace */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-luxury-light">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-luxury-dark text-white px-4 py-3 flex items-center justify-between border-b border-gray-800 flex-shrink-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 hover:text-luxury-gold focus:outline-none">
            <Menu size={22} />
          </button>
          
          <Link to="/admin" className="text-center select-none">
            <h1 className="font-sans text-sm font-bold uppercase tracking-wider">Ubaid Al Abayat</h1>
            <p className="text-[7px] text-luxury-gold tracking-widest uppercase -mt-0.5">Control Panel</p>
          </Link>

          <button onClick={handleLogout} className="p-1.5 text-red-500 hover:text-red-400 focus:outline-none">
            <LogOut size={18} />
          </button>
        </header>

        {/* Content View Workspace - scrolls independently without touching sidebar! */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-luxury-dark/80 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 h-full z-10 bg-luxury-dark shadow-2xl flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white z-20 p-1"
            >
              <X size={20} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
