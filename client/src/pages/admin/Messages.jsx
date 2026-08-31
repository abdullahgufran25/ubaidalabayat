import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Mail, MailOpen, Phone, Calendar, User, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

const Messages = () => {
  const { addToast } = useToast();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/contact');
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      addToast('Failed to fetch contact inquiries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    setTogglingId(id);
    const newStatus = currentStatus === 'Read' ? 'Unread' : 'Read';
    try {
      const res = await axios.put(`/api/contact/${id}`, { status: newStatus });
      if (res.data.success) {
        addToast(`Inquiry status updated to ${newStatus}`, 'success');
        fetchMessages();
      }
    } catch (err) {
      addToast('Failed to update inquiry status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message permanently?')) {
      return;
    }

    try {
      const res = await axios.delete(`/api/contact/${id}`);
      if (res.data.success) {
        addToast(res.data.message || 'Message deleted successfully', 'success');
        fetchMessages();
      }
    } catch (err) {
      addToast('Failed to delete inquiry message', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="border-b border-luxury-gray pb-4">
        <h1 className="text-3xl font-serif font-bold uppercase tracking-wider">Contact Inquiries</h1>
        <p className="text-xs text-luxury-textGray uppercase tracking-widest mt-1">
          Review and manage support tickets, feed-backs, and custom design inquiries submitted via contact forms
        </p>
      </div>

      {/* Statistics Cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-luxury-gray rounded p-5 flex items-center space-x-4 shadow-sm">
            <div className="p-3 bg-red-50 text-red-600 rounded">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-luxury-textGray font-semibold">Unread Messages</p>
              <h3 className="text-xl font-serif font-bold text-luxury-dark">
                {messages.filter(m => m.status === 'Unread').length}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-luxury-gray rounded p-5 flex items-center space-x-4 shadow-sm">
            <div className="p-3 bg-green-50 text-green-600 rounded">
              <MailOpen size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-luxury-textGray font-semibold">Read/Processed</p>
              <h3 className="text-xl font-serif font-bold text-luxury-dark">
                {messages.filter(m => m.status === 'Read').length}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      {loading ? (
        <div className="py-20 text-center flex flex-col justify-center items-center text-xs uppercase tracking-widest text-luxury-textGray">
          <RefreshCw size={24} className="animate-spin text-luxury-gold mb-2" />
          <span>Loading support inbox...</span>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white border border-luxury-gray rounded p-12 text-center text-xs text-luxury-textGray uppercase tracking-wider">
          Your inbox is currently empty.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`bg-white border rounded p-6 shadow-sm transition-all duration-200 ${
                msg.status === 'Unread'
                  ? 'border-l-4 border-l-luxury-gold border-luxury-gray'
                  : 'border-luxury-gray opacity-85'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Meta details */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded border ${
                      msg.status === 'Unread'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {msg.status}
                    </span>
                    <h3 className={`text-sm uppercase font-serif tracking-wider ${msg.status === 'Unread' ? 'font-bold text-luxury-dark' : 'text-luxury-dark'}`}>
                      Inquiry from {msg.name}
                    </h3>
                  </div>

                  {/* Customer Contact Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-6 text-[10px] text-luxury-textGray font-mono">
                    <div className="flex items-center">
                      <User size={12} className="mr-1.5 text-luxury-gold" />
                      <span>{msg.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail size={12} className="mr-1.5 text-luxury-gold" />
                      <a href={`mailto:${msg.email}`} className="hover:underline">{msg.email}</a>
                    </div>
                    {msg.phone && (
                      <div className="flex items-center">
                        <Phone size={12} className="mr-1.5 text-luxury-gold" />
                        <a href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {msg.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date and Operations */}
                <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0">
                  <div className="flex items-center text-[10px] text-luxury-textGray font-mono">
                    <Calendar size={11} className="mr-1.5 text-luxury-gold" />
                    <span>
                      {new Date(msg.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                      {' '}
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Mark as read/unread toggle */}
                    <button
                      onClick={() => handleToggleStatus(msg._id, msg.status)}
                      disabled={togglingId === msg._id}
                      className={`p-2 border rounded transition-colors ${
                        msg.status === 'Unread'
                          ? 'border-green-200 text-green-700 hover:bg-green-50'
                          : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                      }`}
                      title={msg.status === 'Unread' ? 'Mark as Read' : 'Mark as Unread'}
                    >
                      {msg.status === 'Unread' ? <MailOpen size={13} /> : <Mail size={13} />}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      className="p-2 border border-red-200 text-red-600 hover:bg-red-50 transition-colors rounded"
                      title="Delete inquiry"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Details */}
              <div className="mt-4 p-4 bg-gray-50 border border-luxury-gray rounded text-xs text-luxury-dark leading-relaxed whitespace-pre-wrap">
                <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider text-[9px] text-luxury-goldDark mb-1.5">
                  <MessageSquare size={10} />
                  <span>Message Body:</span>
                </div>
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Messages;
