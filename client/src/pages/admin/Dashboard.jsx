import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DollarSign, ClipboardList, ShoppingBag, Users, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [stats, setStats] = useState({
    totalSales: 0,
    todaySales: 0,
    monthlySales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardAnalytics = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Orders to compile stats
        const ordersRes = await axios.get('/api/orders');
        const orders = ordersRes.data.data || [];

        // 2. Fetch Users to count customers
        const usersRes = await axios.get('/api/auth/users');
        const users = usersRes.data.data || [];
        const customersCount = users.filter(u => u.role === 'customer').length;

        // 3. Fetch Inventory status for low stock alert
        const inventoryRes = await axios.get('/api/inventory');
        const inventory = inventoryRes.data.data || [];
        const lowStock = inventory.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock');
        
        // Process Orders to calculate sales financials
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        let totalSales = 0;
        let todaySales = 0;
        let monthlySales = 0;
        let pendingCount = 0;
        let completedCount = 0;

        orders.forEach(order => {
          // Skip cancelled orders for revenue calculations
          if (order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Returned') {
            totalSales += order.total;
            
            const orderTime = new Date(order.createdAt).getTime();
            if (orderTime >= startOfToday) {
              todaySales += order.total;
            }
            if (orderTime >= startOfThisMonth) {
              monthlySales += order.total;
            }
          }

          if (order.orderStatus === 'Pending') pendingCount++;
          if (order.orderStatus === 'Delivered') completedCount++;
        });

        setStats({
          totalSales,
          todaySales,
          monthlySales,
          totalOrders: orders.length,
          pendingOrders: pendingCount,
          completedOrders: completedCount,
          totalCustomers: customersCount,
          totalProducts: inventory.length,
        });

        setLowStockProducts(lowStock.slice(0, 5));
        setRecentOrders(orders.slice(0, 5));

      } catch (err) {
        console.error(err);
        addToast('Failed to load dashboard statistics', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardAnalytics();
  }, [addToast]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 w-1/4 rounded"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Sales (Revenue)', val: `PKR ${stats.totalSales}`, desc: 'Total historic sales', icon: DollarSign, color: 'text-green-600 bg-green-50 border-green-100' },
    { title: 'Today\'s Sales', val: `PKR ${stats.todaySales}`, desc: 'Sales recorded today', icon: TrendingUp, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { title: 'This Month\'s Sales', val: `PKR ${stats.monthlySales}`, desc: 'Sales recorded this month', icon: DollarSign, color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { title: 'Total Orders', val: stats.totalOrders, desc: `${stats.pendingOrders} Pending confirmations`, icon: ClipboardList, color: 'text-luxury-goldDark bg-luxury-cream/35 border-luxury-gold/20' },
    { title: 'Total Customers', val: stats.totalCustomers, desc: 'Registered user base', icon: Users, color: 'text-teal-600 bg-teal-50 border-teal-100' },
    { title: 'Products in Catalog', val: stats.totalProducts, desc: 'Total custom products active', icon: ShoppingBag, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Page header */}
      <div className="border-b border-luxury-gray pb-4">
        <h1 className="text-3xl font-serif font-bold uppercase tracking-wider">Dashboard Overview</h1>
        <p className="text-xs text-luxury-textGray uppercase tracking-widest mt-1">
          Store sales metrics and stock alerts audit
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`p-6 border rounded shadow-sm flex items-center justify-between bg-white ${stat.color.split(' ').slice(1).join(' ')}`}>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">{stat.title}</p>
                <h3 className="text-xl font-bold font-sans text-luxury-dark">{stat.val}</h3>
                <p className="text-[9px] text-luxury-textGray font-semibold uppercase">{stat.desc}</p>
              </div>
              <div className={`p-4 rounded-full border ${stat.color.split(' ')[0]}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Lower Grid: Recent Orders & Stock warning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white border border-luxury-gray p-6 rounded space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-luxury-gray pb-3">
            <h2 className="font-serif text-sm font-bold uppercase tracking-wider">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-[10px] text-luxury-goldDark uppercase tracking-widest font-bold flex items-center hover:underline"
            >
              View All Orders <ArrowRight size={10} className="ml-1" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-luxury-gray">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-luxury-goldDark font-bold pb-2">
                  <th className="py-3">Order Number</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Method</th>
                  <th className="py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-gray">
                {recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => navigate('/admin/orders')}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 font-semibold text-luxury-dark">{order.orderNumber}</td>
                    <td className="py-3">{order.shippingAddress?.fullName}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded ${
                        order.orderStatus === 'Delivered'
                          ? 'bg-green-50 text-green-700'
                          : order.orderStatus === 'Cancelled'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-luxury-cream text-luxury-goldDark'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3">{order.paymentMethod}</td>
                    <td className="py-3 text-right font-bold font-sans">PKR {order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white border border-luxury-gray p-6 rounded space-y-4 shadow-sm">
          <div className="flex items-center text-red-600 border-b border-luxury-gray pb-3">
            <AlertTriangle size={18} className="mr-2" />
            <h2 className="font-serif text-sm font-bold uppercase tracking-wider">Inventory Alerts</h2>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-luxury-textGray italic">
              All products are fully in stock! Excellent operations.
            </p>
          ) : (
            <div className="space-y-4">
              {lowStockProducts.map((prod) => (
                <div
                  key={prod._id}
                  onClick={() => navigate('/admin/inventory')}
                  className="flex items-center justify-between border-b border-luxury-gray pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 rounded p-1 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <img src={prod.image} alt="" className="w-8 h-10 object-cover border border-luxury-gray" />
                    <div>
                      <h4 className="text-xs font-semibold leading-tight line-clamp-1">{prod.name}</h4>
                      <p className="text-[9px] text-luxury-textGray uppercase tracking-wider font-mono">SKU: {prod.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      prod.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {prod.stock} Left
                    </span>
                  </div>
                </div>
              ))}
              <Link
                to="/admin/inventory"
                className="block text-center w-full bg-luxury-dark text-white hover:bg-luxury-gold hover:text-luxury-dark text-[10px] font-bold py-2.5 uppercase tracking-widest transition-colors mt-4"
              >
                Manage Inventory
              </Link>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
