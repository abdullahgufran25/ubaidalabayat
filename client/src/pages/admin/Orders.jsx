import React, { useState, useEffect } from 'react';
import { Edit2, Eye, X, RefreshCw, AlertCircle, CheckCircle, Truck, Info, Phone, Mail, MapPin } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

const Orders = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selected Order Modal States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusVal, setStatusVal] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/api/orders?status=${statusFilter}` : '/api/orders';
      const res = await axios.get(url);
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      addToast('Failed to fetch orders list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setStatusVal(order.orderStatus);
    setTrackingNumber(order.trackingNumber || '');
    setModalOpen(true);
  };

  const handleStatusChange = async () => {
    if (!selectedOrder) return;
    setUpdateLoading(true);
    try {
      const res = await axios.put(`/api/orders/${selectedOrder._id}/status`, {
        status: statusVal,
      });

      if (res.data.success) {
        addToast(res.data.message, 'success');
        
        // Refresh details modal
        const refreshedOrder = { ...selectedOrder, orderStatus: statusVal };
        if (statusVal === 'Delivered') refreshedOrder.paymentStatus = 'Paid';
        setSelectedOrder(refreshedOrder);

        fetchOrders();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update order status', 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleTrackingChange = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdateLoading(true);
    try {
      const res = await axios.put(`/api/orders/${selectedOrder._id}/tracking`, {
        trackingNumber,
      });

      if (res.data.success) {
        addToast(res.data.message, 'success');
        setSelectedOrder({ ...selectedOrder, trackingNumber });
        fetchOrders();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update tracking', 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  const statusOptions = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-luxury-gray pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold uppercase tracking-wider">Orders Manager</h1>
          <p className="text-xs text-luxury-textGray uppercase tracking-widest mt-1">
            Track confirmations, shipments, returns, and update delivery statuses
          </p>
        </div>

        {/* Filter status */}
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider">
          <span className="text-luxury-textGray">Filter status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-luxury-gray bg-white px-3 py-2 text-xs uppercase tracking-wider rounded font-medium focus:outline-none focus:border-luxury-gold"
          >
            <option value="">All Orders</option>
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-20 text-center flex flex-col justify-center items-center text-xs uppercase tracking-widest text-luxury-textGray">
          <RefreshCw size={24} className="animate-spin text-luxury-gold mb-2" />
          <span>Loading orders lists...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-luxury-gray rounded p-12 text-center text-xs text-luxury-textGray uppercase tracking-wider">
          No orders found matching search filters.
        </div>
      ) : (
        <div className="bg-white border border-luxury-gray rounded overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-luxury-gray">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-luxury-goldDark font-bold">
                  <th className="p-4">Order #</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Total Price</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-gray">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-55 transition-colors">
                    <td className="p-4 font-serif font-bold text-luxury-dark text-sm">{order.orderNumber}</td>
                    <td className="p-4 font-mono">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-luxury-dark">{order.shippingAddress?.fullName}</p>
                        <p className="text-[10px] text-luxury-textGray">{order.shippingAddress?.phone}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${
                        order.orderStatus === 'Delivered'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : order.orderStatus === 'Cancelled'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-luxury-cream text-luxury-goldDark border-luxury-gold/25'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 font-bold font-sans">PKR {order.total}</td>
                    
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenDetails(order)}
                        className="p-2 border border-luxury-gray text-luxury-dark hover:bg-luxury-cream hover:border-luxury-gold transition-colors inline-block"
                        title="View Order Details"
                      >
                        <Eye size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxury-dark bg-opacity-70 p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-4xl bg-luxury-light p-6 sm:p-8 shadow-2xl rounded border border-luxury-gray max-h-[90vh] overflow-y-auto animate-fade-in space-y-8">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-luxury-gray pb-3">
              <h3 className="font-serif text-lg font-bold uppercase tracking-wider flex items-center">
                <span>Order details</span>
                <span className="bg-luxury-cream text-luxury-goldDark px-2 py-0.5 text-xs font-bold font-sans rounded ml-3">
                  {selectedOrder.orderNumber}
                </span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:text-luxury-gold">
                <X size={20} />
              </button>
            </div>

            {/* Modal Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              
              {/* Left 2 Cols: Items & Address */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Billing Address Details */}
                <div className="bg-white border border-luxury-gray p-5 rounded space-y-3">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-widest text-luxury-gold border-b border-luxury-gray pb-1.5 flex items-center">
                    <MapPin size={14} className="mr-1.5" />
                    <span>Shipping Address</span>
                  </h4>
                  <div className="text-xs space-y-1 text-luxury-textGray">
                    <p className="font-bold text-luxury-dark uppercase tracking-wider text-[10px]">{selectedOrder.shippingAddress?.fullName}</p>
                    <p className="flex items-center"><Phone size={10} className="mr-2" />{selectedOrder.shippingAddress?.phone}</p>
                    <p className="flex items-center"><Mail size={10} className="mr-2" />{selectedOrder.shippingAddress?.email}</p>
                    <p className="flex items-center mt-1 normal-case"><MapPin size={10} className="mr-2" />{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city} (Zip: {selectedOrder.shippingAddress?.postalCode})</p>
                    {selectedOrder.notes && <p className="text-[10px] italic text-yellow-800 bg-yellow-50 border border-yellow-100 p-2 mt-2">Notes: "{selectedOrder.notes}"</p>}
                  </div>
                </div>

                {/* Line Items List */}
                <div className="bg-white border border-luxury-gray p-5 rounded space-y-4">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-widest text-luxury-dark border-b border-luxury-gray pb-1.5">
                    Order Items
                  </h4>
                  <div className="divide-y divide-luxury-gray">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-serif font-bold text-luxury-dark">{item.name}</p>
                          <p className="text-[9px] text-luxury-textGray uppercase tracking-wider mt-0.5">
                            Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="font-sans font-bold">PKR {item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Col: Operations Actions */}
              <div className="space-y-6">
                
                {/* Summary Calculations */}
                <div className="bg-white border border-luxury-gray p-5 rounded space-y-3">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-widest text-luxury-gold border-b border-luxury-gray pb-1.5">
                    Price Details
                  </h4>
                  <div className="space-y-2 text-[10px] uppercase tracking-wider font-semibold text-luxury-textGray">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-luxury-dark font-sans font-bold">PKR {selectedOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-luxury-dark font-sans font-bold">PKR {selectedOrder.shippingCharges}</span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Discount</span>
                        <span className="font-sans font-bold">- PKR {selectedOrder.discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs font-bold text-luxury-dark border-t border-luxury-gray pt-2">
                      <span>Total Amount</span>
                      <span className="font-sans text-sm font-bold text-luxury-goldDark">PKR {selectedOrder.total}</span>
                    </div>
                  </div>
                </div>

                {/* Status Update Trigger Form */}
                <div className="bg-white border border-luxury-gray p-5 rounded space-y-4">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-widest text-luxury-dark border-b border-luxury-gray pb-1.5">
                    Order Operations
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-luxury-textGray block">Status Status</label>
                      <select
                        value={statusVal}
                        onChange={(e) => setStatusVal(e.target.value)}
                        className="w-full border border-luxury-gray p-2 text-xs uppercase tracking-wider rounded bg-white font-semibold focus:outline-none"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleStatusChange}
                      disabled={updateLoading || statusVal === selectedOrder.orderStatus}
                      className="w-full luxury-btn py-2 text-[10px]"
                    >
                      Update Status
                    </button>
                  </div>
                </div>

                {/* Tracking input Form */}
                <div className="bg-white border border-luxury-gray p-5 rounded space-y-4">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-widest text-luxury-dark border-b border-luxury-gray pb-1.5 flex items-center">
                    <Truck size={14} className="mr-1.5" />
                    <span>Courier Tracking Code</span>
                  </h4>

                  <form onSubmit={handleTrackingChange} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-luxury-textGray block">Tracking Code / Slip ID</label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="w-full text-xs border border-luxury-gray p-2 rounded focus:outline-none"
                        placeholder="e.g. LEO-98721200"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updateLoading || trackingNumber === selectedOrder.trackingNumber}
                      className="w-full luxury-btn-outline py-2 text-[10px]"
                    >
                      Save Tracking Code
                    </button>
                  </form>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;
