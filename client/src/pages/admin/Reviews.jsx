import React, { useState, useEffect } from 'react';
import { RefreshCw, Star, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

const Reviews = () => {
  const { addToast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moderatingId, setModeratingId] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/reviews');
      if (res.data.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      addToast('Failed to fetch reviews list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApprove = async (id, currentApprovedStatus) => {
    setModeratingId(id);
    try {
      const res = await axios.put(`/api/reviews/${id}/approve`, {
        isApproved: !currentApprovedStatus,
      });

      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchReviews(); // Refresh list
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update review approval status', 'error');
    } finally {
      setModeratingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer review permanently?')) return;

    try {
      const res = await axios.delete(`/api/reviews/${id}`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchReviews();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete review', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="border-b border-luxury-gray pb-4">
        <h1 className="text-3xl font-serif font-bold uppercase tracking-wider">Reviews Moderation</h1>
        <p className="text-xs text-luxury-textGray uppercase tracking-widest mt-1">
          Moderate, Approve, or delete product reviews submitted by customer verified purchases
        </p>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="py-20 text-center flex flex-col justify-center items-center text-xs uppercase tracking-widest text-luxury-textGray">
          <RefreshCw size={24} className="animate-spin text-luxury-gold mb-2" />
          <span>Loading reviews list...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white border border-luxury-gray rounded p-12 text-center text-xs text-luxury-textGray uppercase tracking-wider">
          No customer reviews submitted yet.
        </div>
      ) : (
        <div className="bg-white border border-luxury-gray rounded overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-luxury-gray">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-luxury-goldDark font-bold">
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Product Details</th>
                  <th className="p-4 text-center">Rating</th>
                  <th className="p-4">Comment</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-gray">
                {reviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-gray-55 transition-colors">
                    {/* User */}
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-luxury-dark">{rev.userName}</p>
                        <p className="text-[9px] text-luxury-textGray font-mono">{rev.user?.email || 'N/A'}</p>
                      </div>
                    </td>

                    {/* Product */}
                    <td className="p-4">
                      {rev.product ? (
                        <div className="flex items-center space-x-3">
                          <img src={rev.product.images?.[0]} alt="" className="w-8 h-10 object-cover border border-luxury-gray" />
                          <div>
                            <p className="font-semibold text-luxury-dark leading-tight line-clamp-1">{rev.product.name}</p>
                            <p className="text-[9px] text-luxury-textGray font-mono">SKU: {rev.product.sku}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-red-500 italic">Deleted Product</span>
                      )}
                    </td>

                    {/* Rating stars */}
                    <td className="p-4 text-center">
                      <div className="flex justify-center text-luxury-gold">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={10}
                            fill={star <= rev.rating ? '#C5A880' : 'none'}
                            className={star <= rev.rating ? 'text-luxury-gold' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Comment */}
                    <td className="p-4 text-luxury-textGray leading-relaxed max-w-xs">{rev.comment}</td>

                    {/* Status approved */}
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${
                        rev.isApproved
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                      }`}>
                        {rev.isApproved ? 'Approved' : 'Pending Review'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      {/* Approve/Disapprove Toggle */}
                      <button
                        onClick={() => handleToggleApprove(rev._id, rev.isApproved)}
                        disabled={moderatingId === rev._id}
                        className={`p-2 border rounded transition-colors inline-block ${
                          rev.isApproved
                            ? 'border-yellow-200 text-yellow-600 hover:bg-yellow-50'
                            : 'border-green-200 text-green-700 hover:bg-green-50'
                        }`}
                        title={rev.isApproved ? 'Unapprove review' : 'Approve review'}
                      >
                        {rev.isApproved ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                      </button>
                      
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(rev._id)}
                        className="p-2 border border-red-200 text-red-600 hover:bg-red-50 transition-colors inline-block"
                        title="Delete Review"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default Reviews;
