import React, { useState } from 'react';
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
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    { name: 'Store Settings', path: '/admin/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-luxury-dark text-white p-6 select-none font-sans">
      <div className="space-y-8">
        {/* Brand Header */}
        <div className="border-b border-gray-800 pb-5">
          <Link to="/" className="block text-center">
            <h1 className="font-serif text-lg font-bold tracking-widest uppercase">
              Ubaid Al Abayat
            </h1>
            <span className="text-[9px] text-luxury-gold uppercase tracking-[0.2em] font-semibold">
              Admin Control Panel
            </span>
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1.5 flex flex-col">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded text-xs uppercase tracking-wider font-semibold transition-all ${
                  isActive
                    ? 'bg-luxury-gold text-luxury-dark shadow-md'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <Icon size={16} className="mr-3" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight size={10} className={isActive ? 'text-luxury-dark' : 'text-gray-600'} />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer operations */}
      <div className="border-t border-gray-800 pt-6 space-y-4">
        {/* Customer Site */}
        <Link
          to="/"
          className="flex items-center px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-gray-400 hover:bg-gray-800 hover:text-white rounded transition-colors"
        >
          <Store size={16} className="mr-3 text-luxury-gold" />
          <span>View Customer Site</span>
        </Link>
        
        {/* Profile */}
        <div className="flex items-center justify-between px-2">
          <div className="truncate pr-3">
            <p className="text-xs font-bold truncate text-white">{user?.name}</p>
            <p className="text-[9px] text-gray-500 truncate lowercase">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-400 p-2 hover:bg-gray-800 rounded transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-luxury-light text-luxury-dark overflow-x-hidden">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-luxury-gray h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Main Container Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-luxury-dark text-white p-4 flex items-center justify-between border-b border-gray-800">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 hover:text-luxury-gold">
            <Menu size={22} />
          </button>
          
          <Link to="/admin" className="text-center select-none">
            <h1 className="font-serif text-sm font-bold uppercase tracking-wider">Ubaid Al Abayat</h1>
            <p className="text-[7px] text-luxury-gold tracking-widest uppercase -mt-0.5">Control Panel</p>
          </Link>

          <button onClick={handleLogout} className="p-1.5 text-red-500 hover:text-red-400">
            <LogOut size={18} />
          </button>
        </header>

        {/* Content View Workspace */}
        <main className="flex-grow p-6 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-luxury-dark bg-opacity-70 animate-fade-in">
          <div className="absolute inset-0" onClick={() => setMobileOpen(false)}></div>
          <div className="relative w-72 h-full z-10 animate-fade-in">
            {/* Close trigger inside */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-luxury-gold z-20 p-2"
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
