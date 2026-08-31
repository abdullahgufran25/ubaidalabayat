import React, { useState, useEffect } from 'react';
import { RefreshCw, Boxes, History, AlertTriangle, ArrowRightLeft, X } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

const Inventory = () => {
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('levels');
  const [stockLevels, setStockLevels] = useState([]);
  const [summary, setSummary] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Adjustment Modal Form States
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustType, setAdjustType] = useState('IN');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'levels') {
        const res = await axios.get('/api/inventory');
        if (res.data.success) {
          setStockLevels(res.data.data);
          setSummary(res.data.summary);
        }
      } else {
        const res = await axios.get('/api/inventory/history');
        if (res.data.success) {
          setHistory(res.data.data);
        }
      }
    } catch (err) {
      addToast('Failed to load inventory logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [activeTab]);

  const handleOpenAdjust = (prod) => {
    setSelectedProduct(prod);
    setAdjustType('IN');
    setAdjustQty('');
    setAdjustReason('');
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !adjustQty) return;

    setSubmitLoading(true);
    try {
      const res = await axios.post('/api/inventory/adjust', {
        productId: selectedProduct._id,
        type: adjustType,
        quantity: adjustQty,
        reason: adjustReason,
      });

      if (res.data.success) {
        addToast(res.data.message, 'success');
        setAdjustModalOpen(false);
        fetchInventoryData(); // Refresh current levels
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to adjust inventory', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-luxury-gray pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold uppercase tracking-wider">Inventory Hub</h1>
          <p className="text-xs text-luxury-textGray uppercase tracking-widest mt-1">
            Real-time stock audits, transaction ledgers, and manual adjustments
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex border border-luxury-gray text-xs font-semibold uppercase tracking-wider bg-white rounded overflow-hidden">
          <button
            onClick={() => setActiveTab('levels')}
            className={`px-4 py-2 flex items-center ${activeTab === 'levels' ? 'bg-luxury-dark text-white' : 'hover:bg-luxury-cream'}`}
          >
            <Boxes size={14} className="mr-2" />
            Stock Levels
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 flex items-center ${activeTab === 'history' ? 'bg-luxury-dark text-white' : 'hover:bg-luxury-cream'}`}
          >
            <History size={14} className="mr-2" />
            Audit Ledger
          </button>
        </div>
      </div>

      {/* Summary indicators (Only for levels tab) */}
      {activeTab === 'levels' && !loading && summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold uppercase tracking-wider">
          <div className="bg-white border border-luxury-gray p-4 rounded shadow-sm">
            <p className="text-[9px] text-luxury-textGray">Total Catalog Items</p>
            <h3 className="text-lg font-bold mt-1">{summary.totalProducts}</h3>
          </div>
          <div className="bg-white border border-luxury-gray p-4 rounded shadow-sm">
            <p className="text-[9px] text-luxury-textGray">Total Stock count</p>
            <h3 className="text-lg font-bold mt-1 font-sans">{summary.totalStockCount} units</h3>
          </div>
          <div className="bg-white border border-yellow-200 bg-yellow-50 text-yellow-800 p-4 rounded shadow-sm">
            <p className="text-[9px] text-yellow-700">Low Stock items</p>
            <h3 className="text-lg font-bold mt-1 flex items-center">
              <span>{summary.lowStockCount}</span>
              {summary.lowStockCount > 0 && <AlertTriangle size={14} className="ml-2 animate-pulse text-yellow-600" />}
            </h3>
          </div>
          <div className="bg-white border border-red-200 bg-red-50 text-red-700 p-4 rounded shadow-sm">
            <p className="text-[9px] text-red-600">Out of Stock items</p>
            <h3 className="text-lg font-bold mt-1">{summary.outOfStockCount}</h3>
          </div>
        </div>
      )}

      {/* Main content rendering */}
      {loading ? (
        <div className="py-20 text-center flex flex-col justify-center items-center text-xs uppercase tracking-widest text-luxury-textGray">
          <RefreshCw size={24} className="animate-spin text-luxury-gold mb-2" />
          <span>Loading inventory audits...</span>
        </div>
      ) : activeTab === 'levels' ? (
        
        // Tab: Levels Table
        <div className="bg-white border border-luxury-gray rounded overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-luxury-gray">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-luxury-goldDark font-bold">
                  <th className="p-4">Product Details</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4 text-center">Stock Count</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-gray">
                {stockLevels.map((prod) => (
                  <tr key={prod._id} className="hover:bg-gray-55 transition-colors">
                    <td className="p-4 flex items-center space-x-3">
                      <img src={prod.image} alt="" className="w-8 h-10 object-cover border border-luxury-gray" />
                      <span className="font-serif font-bold text-luxury-dark leading-snug line-clamp-1">{prod.name}</span>
                    </td>
                    <td className="p-4 font-mono font-bold uppercase">{prod.sku}</td>
                    <td className="p-4 text-center font-bold font-sans text-sm">{prod.stock}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${
                        prod.status === 'In Stock'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : prod.status === 'Low Stock'
                          ? 'bg-yellow-55 text-yellow-800 border-yellow-200'
                          : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {prod.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenAdjust(prod)}
                        className="p-2 border border-luxury-gray text-luxury-dark hover:bg-luxury-cream hover:border-luxury-gold transition-colors inline-flex items-center space-x-1.5"
                        title="Adjust Stock"
                      >
                        <ArrowRightLeft size={12} />
                        <span className="text-[9px] uppercase tracking-widest font-bold">Adjust</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
      ) : (
        
        // Tab: Audit History Ledger
        <div className="bg-white border border-luxury-gray rounded overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-luxury-gray">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-luxury-goldDark font-bold">
                  <th className="p-4">Date</th>
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Transaction Type</th>
                  <th className="p-4 text-center">Qty Diff</th>
                  <th className="p-4">Reason / Notes</th>
                  <th className="p-4">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-gray">
                {history.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-55 transition-colors">
                    <td className="p-4 font-mono">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-4">
                      {log.product ? (
                        <div className="flex items-center space-x-3">
                          <img src={log.product.images?.[0]} alt="" className="w-8 h-10 object-cover border border-luxury-gray" />
                          <div>
                            <p className="font-semibold text-luxury-dark leading-tight">{log.product.name}</p>
                            <p className="text-[9px] text-luxury-textGray font-mono">SKU: {log.product.sku}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-red-500 italic">Deleted Product</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${
                        log.type === 'IN'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : log.type === 'OUT'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold font-sans">
                      {log.type === 'OUT' ? `-${log.quantity}` : `+${log.quantity}`}
                    </td>
                    <td className="p-4 text-luxury-textGray leading-relaxed max-w-xs">{log.reason}</td>
                    <td className="p-4">
                      {log.createdBy ? (
                        <div>
                          <p className="font-semibold text-luxury-dark">{log.createdBy.name}</p>
                          <p className="text-[9px] text-luxury-textGray">{log.createdBy.email}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-luxury-textGray uppercase font-bold">System Generated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Inventory Modal Dialog */}
      {adjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxury-dark bg-opacity-70 p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-luxury-light p-6 sm:p-8 shadow-2xl rounded border border-luxury-gray animate-fade-in space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-luxury-gray pb-3">
              <h3 className="font-serif text-lg font-bold uppercase tracking-wider flex items-center">
                <ArrowRightLeft size={16} className="mr-2 text-luxury-gold" />
                <span>Adjust Stock Levels</span>
              </h3>
              <button onClick={() => setAdjustModalOpen(false)} className="p-1 hover:text-luxury-gold">
                <X size={20} />
              </button>
            </div>

            {/* Info Product */}
            <div className="flex items-center space-x-3 bg-white border border-luxury-gray p-3 rounded text-xs">
              <img src={selectedProduct.image} alt="" className="w-10 h-12 object-cover border border-luxury-gray" />
              <div>
                <h4 className="font-bold text-luxury-dark line-clamp-1">{selectedProduct.name}</h4>
                <p className="text-[10px] text-luxury-textGray mt-0.5">SKU Code: <strong className="text-luxury-dark uppercase">{selectedProduct.sku}</strong></p>
                <p className="text-[10px] text-luxury-textGray font-semibold uppercase mt-0.5">Current Stock: <span className="text-luxury-dark font-sans text-xs">{selectedProduct.stock}</span> units</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              
              {/* Type Select */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">Adjustment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {['IN', 'OUT', 'ADJUSTMENT'].map(t => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setAdjustType(t)}
                      className={`border py-2 text-center text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
                        adjustType === t
                          ? 'border-luxury-dark bg-luxury-dark text-white'
                          : 'border-luxury-gray bg-white text-luxury-dark hover:border-luxury-gold'
                      }`}
                    >
                      {t === 'IN' ? 'Restock (+)' : t === 'OUT' ? 'Damage (-)' : 'Override (=)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">
                  {adjustType === 'ADJUSTMENT' ? 'New Target Stock Level *' : 'Difference Quantity *'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder={adjustType === 'ADJUSTMENT' ? 'e.g. 50' : 'e.g. 5'}
                />
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block font-semibold">Reason Description</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder="e.g. Returned parcel, damaged piece, stocktake audit"
                />
              </div>

              {/* Action Buttons */}
              <div className="border-t border-luxury-gray pt-4 flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="luxury-btn-outline py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="luxury-btn py-2 text-xs"
                >
                  {submitLoading ? 'Applying...' : 'Apply Stock Update'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;
