import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Package, MapPin, Truck, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

const MyOrders = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const fetchCustomerOrders = async () => {
      try {
        const res = await axios.get('/api/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        addToast('Failed to fetch orders history', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerOrders();
  }, [addToast]);

  const toggleExpandOrder = (id) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  // Helper to map orderStatus progress timeline index
  const getStatusIndex = (status) => {
    const sequence = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    return sequence.indexOf(status);
  };

  const trackingSteps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-light">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-t-luxury-gold border-luxury-gray rounded-full animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-widest font-bold text-luxury-textGray">Loading Orders History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div className="border-b border-luxury-gray pb-4">
        <h1 className="text-3xl font-serif font-bold uppercase tracking-wider">My Orders</h1>
        <p className="text-xs text-luxury-textGray uppercase tracking-widest mt-1">
          Review details and track current shipment progress
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-luxury-gray rounded p-12 text-center space-y-6">
          <div className="inline-block p-6 bg-luxury-light text-luxury-gold rounded-full border border-luxury-gray">
            <Package size={42} />
          </div>
          <h2 className="font-serif text-xl font-bold uppercase tracking-wider">No Orders Found</h2>
          <p className="text-xs text-luxury-textGray max-w-sm mx-auto">
            You haven't placed any orders yet. Visit our shop and pick your favorite modesty wear to see your order history records.
          </p>
          <Link to="/shop" className="inline-block luxury-btn text-xs tracking-widest px-8">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            const currentStepIdx = getStatusIndex(order.orderStatus);

            return (
              <div
                key={order._id}
                className="bg-white border border-luxury-gray rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Accordion Summary Header */}
                <div
                  onClick={() => toggleExpandOrder(order._id)}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-gray-50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-serif text-sm font-bold uppercase tracking-wider text-luxury-dark">
                        Order #{order.orderNumber}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        order.orderStatus === 'Cancelled'
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : order.orderStatus === 'Delivered'
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : 'bg-luxury-cream text-luxury-goldDark border border-luxury-gold/20'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="flex items-center text-[10px] text-luxury-textGray uppercase tracking-wider font-semibold">
                      <Calendar size={12} className="mr-1.5" />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Total Amount</p>
                      <p className="font-sans font-bold text-sm text-luxury-dark">PKR {order.total}</p>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-luxury-gold" /> : <ChevronDown size={16} className="text-luxury-gold" />}
                  </div>
                </div>

                {/* Expanded Details body */}
                {isExpanded && (
                  <div className="border-t border-luxury-gray bg-luxury-light bg-opacity-30 p-5 sm:p-6 space-y-8 animate-fade-in">
                    
                    {/* 1. PROGRESS TIMELINE (only show if not cancelled/returned) */}
                    {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Returned' && (
                      <div className="space-y-4">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-luxury-goldDark">Shipment Track Status</p>
                        
                        {/* Timeline Track */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 pb-6 gap-6 sm:gap-2">
                          {trackingSteps.map((step, idx) => {
                            const isCompleted = idx <= currentStepIdx;
                            const isCurrent = idx === currentStepIdx;

                            return (
                              <div key={idx} className="flex-1 flex sm:flex-col items-center relative w-full">
                                {/* Dot Indicator */}
                                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center font-sans text-[10px] font-bold z-10 ${
                                  isCurrent
                                    ? 'bg-luxury-gold border-luxury-goldDark text-luxury-dark animate-pulse'
                                    : isCompleted
                                    ? 'bg-luxury-dark border-luxury-dark text-white'
                                    : 'bg-white border-luxury-gray text-luxury-textGray'
                                }`}>
                                  {idx + 1}
                                </div>

                                {/* Step Label */}
                                <div className="ml-4 sm:ml-0 sm:mt-2 text-left sm:text-center">
                                  <p className={`text-[10px] uppercase font-bold tracking-wider ${
                                    isCompleted ? 'text-luxury-dark' : 'text-luxury-textGray'
                                  }`}>
                                    {step}
                                  </p>
                                </div>

                                {/* Connector Line (Desktop horizontal, hidden on last) */}
                                {idx < trackingSteps.length - 1 && (
                                  <div className={`hidden sm:block absolute top-3 left-[calc(50%+12px)] right-[calc(-50%+12px)] h-0.5 z-0 ${
                                    idx < currentStepIdx ? 'bg-luxury-dark' : 'bg-luxury-gray'
                                  }`}></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Cancelled/Returned alerts */}
                    {(order.orderStatus === 'Cancelled' || order.orderStatus === 'Returned') && (
                      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded text-xs flex items-start space-x-2 uppercase tracking-wide">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-bold">Order {order.orderStatus}</p>
                          <p className="normal-case text-[10px] text-red-700 leading-normal mt-1">
                            This order record has been flagged as {order.orderStatus}. Items have been returned to warehouse inventory. If you believe this was an error, please contact styling support.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 2. PRODUCTS ORDERED */}
                    <div className="space-y-4">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-luxury-goldDark">Line Items</p>
                      <div className="divide-y divide-luxury-gray border border-luxury-gray bg-white p-4 rounded">
                        {order.items.map((item, i) => (
                          <div key={i} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-serif font-semibold text-luxury-dark">{item.name}</p>
                              <p className="text-[9px] text-luxury-textGray uppercase tracking-wider mt-0.5">
                                Size: {item.size} | Color: {item.color} | Quantity: {item.quantity}
                              </p>
                            </div>
                            <span className="font-sans font-bold">PKR {item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. DETAILS METADATA SUMMARY */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs leading-relaxed">
                      {/* Shipping details */}
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-luxury-goldDark">Delivery Information</p>
                        <div className="bg-white border border-luxury-gray p-4 rounded">
                          <p className="font-bold uppercase tracking-wider text-[10px]">{order.shippingAddress.fullName}</p>
                          <p className="text-luxury-textGray mt-1">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                          <p className="text-luxury-textGray">Contact Phone: {order.shippingAddress.phone}</p>
                          {order.notes && <p className="text-[10px] italic text-yellow-800 bg-yellow-50 border border-yellow-100 p-2 mt-2">Notes: "{order.notes}"</p>}
                        </div>
                      </div>

                      {/* Financials details */}
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-luxury-goldDark">Pricing Breakdown</p>
                        <div className="bg-white border border-luxury-gray p-4 rounded space-y-2 uppercase tracking-wider text-[10px] font-semibold text-luxury-textGray">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="text-luxury-dark font-sans font-bold">PKR {order.subtotal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping charges</span>
                            <span className="text-luxury-dark font-sans font-bold">{order.shippingCharges === 0 ? 'FREE' : `PKR ${order.shippingCharges}`}</span>
                          </div>
                          {order.discountAmount > 0 && (
                            <div className="flex justify-between text-green-700">
                              <span>Discount</span>
                              <span className="font-sans font-bold">- PKR {order.discountAmount}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-xs font-bold text-luxury-dark border-t border-luxury-gray pt-2">
                            <span>Total Paid ({order.paymentMethod})</span>
                            <span className="font-sans text-sm font-bold text-luxury-goldDark">PKR {order.total}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
