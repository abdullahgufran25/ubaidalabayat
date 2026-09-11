import React, { useState, useEffect } from 'react';
import { RefreshCw, Star, Trash2, CheckCircle2, XCircle, Plus, X, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

const Reviews = () => {
  const { addToast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moderatingId, setModeratingId] = useState(null);
  const [toggleFeatureId, setToggleFeatureId] = useState(null);

  // Modal for adding boutique testimonial
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);
  const [productsList, setProductsList] = useState([]);

  // Form fields
  const [userName, setUserName] = useState('');
  const [city, setCity] = useState('');
  const [title, setTitle] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isFeaturedOnHome, setIsFeaturedOnHome] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');

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

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products?limit=100');
      if (res.data.success) {
        setProductsList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching products for dropdown', err);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchProducts();
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

  const handleToggleFeatureHome = async (id) => {
    setToggleFeatureId(id);
    try {
      const res = await axios.put(`/api/reviews/${id}/feature-home`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchReviews();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update homepage feature status', 'error');
    } finally {
      setToggleFeatureId(null);
    }
  };

  const handleCreateTestimonial = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) {
      addToast('Please provide client name and review comment', 'error');
      return;
    }

    setSubmittingTestimonial(true);
    try {
      const res = await axios.post('/api/reviews/admin-create', {
        userName: userName.trim(),
        city: city.trim(),
        title: title.trim(),
        rating: Number(rating),
        comment: comment.trim(),
        isFeaturedOnHome,
        productId: selectedProduct || undefined,
      });

      if (res.data.success) {
        addToast(res.data.message, 'success');
        // Reset form & close modal
        setUserName('');
        setCity('');
        setTitle('');
        setRating(5);
        setComment('');
        setIsFeaturedOnHome(true);
        setSelectedProduct('');
        setIsModalOpen(false);
        fetchReviews();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create testimonial', 'error');
    } finally {
      setSubmittingTestimonial(false);
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

  const featuredCount = reviews.filter((r) => r.isFeaturedOnHome).length;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="border-b border-luxury-gray pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-sans font-bold uppercase tracking-wider">Reviews & Testimonials</h1>
          <p className="text-xs text-luxury-textGray uppercase tracking-widest mt-1">
            Moderate reviews, manage Homepage Running Tape, or add custom client testimonials
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Live featured on home count */}
          <div className="bg-luxury-light border border-luxury-gold/40 px-3.5 py-2 rounded-lg flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-luxury-dark">
              {featuredCount} Live on Home Tape
            </span>
          </div>

          {/* Add Testimonial Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="luxury-btn-gold px-4 py-2 rounded-lg flex items-center space-x-2 text-xs font-bold shadow-sm"
          >
            <Plus size={15} />
            <span>Add Testimonial</span>
          </button>
        </div>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="py-20 text-center flex flex-col justify-center items-center text-xs uppercase tracking-widest text-luxury-textGray">
          <RefreshCw size={24} className="animate-spin text-luxury-gold mb-2" />
          <span>Loading reviews list...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white border border-luxury-gray rounded p-12 text-center text-xs text-luxury-textGray uppercase tracking-wider">
          No customer reviews found. Click "+ Add Testimonial" to add one!
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
                  <th className="p-4 text-center">Homepage Tape</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-gray">
                {reviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-gray-50 transition-colors">
                    {/* User */}
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-luxury-dark">{rev.userName}</p>
                        {rev.city && (
                          <span className="text-[10px] text-luxury-goldDark font-semibold uppercase block">
                            {rev.city}
                          </span>
                        )}
                        <p className="text-[9px] text-luxury-textGray font-mono">
                          {rev.user?.email || (rev.city ? 'Boutique Client' : 'Verified Buyer')}
                        </p>
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
                        <span className="text-luxury-goldDark text-[10px] font-semibold uppercase tracking-wider bg-luxury-light px-2 py-1 rounded border border-luxury-gold/30">
                          General Boutique Review
                        </span>
                      )}
                    </td>

                    {/* Rating stars */}
                    <td className="p-4 text-center">
                      <div className="flex justify-center text-luxury-gold">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={11}
                            fill={star <= rev.rating ? '#C5A880' : 'none'}
                            className={star <= rev.rating ? 'text-luxury-gold' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Comment */}
                    <td className="p-4 text-luxury-textGray leading-relaxed max-w-xs">
                      {rev.title && (
                        <p className="font-bold text-luxury-dark text-[11px] mb-0.5">"{rev.title}"</p>
                      )}
                      <p className="line-clamp-3 italic">"{rev.comment}"</p>
                    </td>

                    {/* Status approved */}
                    <td className="p-4 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${
                        rev.isApproved
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                      }`}>
                        {rev.isApproved ? 'Approved' : 'Pending Review'}
                      </span>
                    </td>

                    {/* Homepage Tape Toggle */}
                    <td className="p-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleFeatureHome(rev._id)}
                        disabled={toggleFeatureId === rev._id}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center mx-auto space-x-1.5 shadow-sm ${
                          rev.isFeaturedOnHome
                            ? 'bg-luxury-gold text-luxury-dark hover:bg-opacity-90 border border-luxury-goldDark'
                            : 'bg-white text-gray-500 border border-gray-300 hover:border-luxury-gold hover:text-luxury-dark'
                        }`}
                        title={rev.isFeaturedOnHome ? 'Click to remove from Homepage Tape' : 'Click to feature on Homepage Tape'}
                      >
                        {toggleFeatureId === rev._id ? (
                          <RefreshCw size={10} className="animate-spin" />
                        ) : (
                          <Star size={10} className={rev.isFeaturedOnHome ? 'fill-luxury-dark text-luxury-dark' : 'text-gray-400'} />
                        )}
                        <span>{rev.isFeaturedOnHome ? 'Live on Home' : '+ Feature'}</span>
                      </button>
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

      {/* ADD TESTIMONIAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-luxury-gray">
            {/* Modal Header */}
            <div className="bg-luxury-dark text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles size={18} className="text-luxury-gold" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Add Client Testimonial</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTestimonial} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Name */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-luxury-dark mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zobia N."
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-luxury-gold focus:outline-none"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-luxury-dark mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Islamabad, Karachi, Lahore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-luxury-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Title / Headline */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-luxury-dark mb-1">
                  Review Headline / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Absolutely Premium & Elegant Cut"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-luxury-gold focus:outline-none"
                />
              </div>

              {/* Rating Stars Selection */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-luxury-dark mb-1">
                  Rating: {rating} / 5 Stars
                </label>
                <div className="flex items-center space-x-2 pt-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setRating(num)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={22}
                        className={num <= rating ? 'fill-[#C5A880] text-[#C5A880]' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-luxury-dark mb-1">
                  Client Feedback / Review Comment *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write customer feedback, praise, or WhatsApp review..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-luxury-gold focus:outline-none leading-relaxed"
                />
              </div>

              {/* Optional Product Link */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-luxury-dark mb-1">
                  Link to Product (Optional)
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-luxury-gold focus:outline-none bg-white"
                >
                  <option value="">General Boutique Testimonial (No specific product)</option>
                  {productsList.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.sku || 'No SKU'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Feature on Homepage Checkbox */}
              <div className="flex items-center space-x-2 bg-luxury-light p-3 rounded-lg border border-luxury-gray">
                <input
                  type="checkbox"
                  id="featureOnHomeCheck"
                  checked={isFeaturedOnHome}
                  onChange={(e) => setIsFeaturedOnHome(e.target.checked)}
                  className="w-4 h-4 text-luxury-gold focus:ring-luxury-gold rounded accent-luxury-gold cursor-pointer"
                />
                <label htmlFor="featureOnHomeCheck" className="font-semibold text-luxury-dark cursor-pointer text-xs">
                  Feature immediately on Homepage Running Tape
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-luxury-gray flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-luxury-dark uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTestimonial}
                  className="luxury-btn-gold px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider shadow-sm flex items-center space-x-2 disabled:opacity-50"
                >
                  {submittingTestimonial && <RefreshCw size={12} className="animate-spin" />}
                  <span>Save Testimonial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Reviews;
