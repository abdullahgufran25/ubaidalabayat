import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Search,
  RefreshCw,
  Send,
  UserCheck,
  Bot,
  AlertTriangle,
  ShoppingBag,
  ExternalLink,
  ShieldAlert,
  Clock,
  CheckCheck,
  Phone,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

const WhatsAppChat = () => {
  const { addToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedConv, setSelectedConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'attention' | 'ai_active'
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      let url = `/api/whatsapp/conversations?filter=${filter}`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      const res = await axios.get(url);
      if (res.data.success) {
        setConversations(res.data.data || []);
        // Auto-select first conversation if none selected
        if (!selectedId && res.data.data.length > 0) {
          setSelectedId(res.data.data[0]._id);
        }
      }
    } catch (err) {
      if (!silent) {
        addToast('Failed to load WhatsApp conversations', 'error');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchConversationDetails = async (id, silent = false) => {
    if (!id) return;
    if (!silent) setChatLoading(true);
    try {
      const res = await axios.get(`/api/whatsapp/conversations/${id}`);
      if (res.data.success) {
        setSelectedConv(res.data.data);
      }
    } catch (err) {
      if (!silent) {
        addToast('Failed to load chat details', 'error');
      }
    } finally {
      if (!silent) setChatLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [filter]);

  // Polling every 6 seconds for live chat updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations(true);
      if (selectedId) {
        fetchConversationDetails(selectedId, true);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [selectedId, filter]);

  useEffect(() => {
    if (selectedId) {
      fetchConversationDetails(selectedId);
    }
  }, [selectedId]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConv?.messages]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedId) return;

    setSending(true);
    try {
      const res = await axios.post(`/api/whatsapp/conversations/${selectedId}/reply`, {
        text: replyText.trim(),
      });
      if (res.data.success) {
        setReplyText('');
        fetchConversationDetails(selectedId, true);
        fetchConversations(true);
        addToast('Message dispatched via WhatsApp', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to dispatch WhatsApp message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleToggleAI = async (enableAI, humanHandover) => {
    if (!selectedId) return;
    try {
      const res = await axios.patch(`/api/whatsapp/conversations/${selectedId}/toggle-ai`, {
        enableAI,
        humanHandover,
      });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchConversationDetails(selectedId, true);
        fetchConversations(true);
      }
    } catch (err) {
      addToast('Failed to toggle AI control', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-luxury-gray pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-sans font-bold uppercase tracking-wider text-luxury-dark">
              WhatsApp AI Inbox
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300">
              Meta Cloud API
            </span>
          </div>
          <p className="text-xs text-luxury-textGray uppercase tracking-widest mt-1">
            Real-time customer sales chatbot, variant selector, and live human handover
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchConversations();
            if (selectedId) fetchConversationDetails(selectedId);
          }}
          className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-luxury-gray text-xs font-bold uppercase tracking-wider rounded hover:border-luxury-gold transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Inbox Container */}
      <div className="bg-white border border-luxury-gray rounded-lg shadow-sm grid grid-cols-1 lg:grid-cols-12 min-h-[680px] overflow-hidden">
        
        {/* Left Column: Conversations List (4 cols) */}
        <div className="lg:col-span-4 border-r border-luxury-gray flex flex-col bg-gray-50/50">
          
          {/* Search & Filters */}
          <div className="p-3 border-b border-luxury-gray bg-white space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchConversations()}
                placeholder="Search phone or name..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-luxury-gold bg-gray-50"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex rounded border border-gray-200 p-0.5 bg-gray-100 text-[10px] font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`flex-1 py-1 rounded transition-colors ${filter === 'all' ? 'bg-white text-luxury-dark shadow-xs' : 'text-gray-500 hover:text-black'}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter('attention')}
                className={`flex-1 py-1 rounded transition-colors ${filter === 'attention' ? 'bg-red-600 text-white shadow-xs' : 'text-gray-500 hover:text-red-600'}`}
              >
                Needs Human
              </button>
              <button
                type="button"
                onClick={() => setFilter('ai_active')}
                className={`flex-1 py-1 rounded transition-colors ${filter === 'ai_active' ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-500 hover:text-black'}`}
              >
                AI Active
              </button>
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 max-h-[620px]">
            {loading && conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 space-y-2">
                <MessageCircle size={28} className="mx-auto text-gray-300" />
                <p>No WhatsApp conversations found.</p>
                <p className="text-[10px] text-gray-400">When customers message your WhatsApp number, they will appear here.</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv._id === selectedId;
                const lastMsg = conv.messages?.[conv.messages.length - 1];
                return (
                  <div
                    key={conv._id}
                    onClick={() => setSelectedId(conv._id)}
                    className={`p-3.5 cursor-pointer transition-all border-l-4 ${
                      isSelected
                        ? 'bg-luxury-cream/40 border-l-luxury-gold shadow-xs'
                        : 'border-l-transparent hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <span className="font-bold text-xs text-luxury-dark truncate">
                          {conv.customerName || conv.whatsappNumber}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-400 font-mono flex-shrink-0">
                        {new Date(conv.lastMessageAt || conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-[11px] text-gray-500 font-mono mb-1.5">
                      <Phone size={10} className="text-gray-400" />
                      <span>+{conv.whatsappNumber}</span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-1 italic">
                      {lastMsg?.text || 'No message content'}
                    </p>

                    <div className="flex items-center space-x-1.5 mt-2">
                      {conv.humanHandover ? (
                        <span className="bg-red-50 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-200 flex items-center space-x-1">
                          <AlertTriangle size={10} />
                          <span>Human Handover</span>
                        </span>
                      ) : conv.aiEnabled ? (
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                          <Bot size={10} />
                          <span>AI Active</span>
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-gray-200">
                          Paused
                        </span>
                      )}

                      {conv.orderDraft?.productName && (
                        <span className="bg-amber-50 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-200 flex items-center space-x-1 truncate max-w-[130px]">
                          <ShoppingBag size={9} />
                          <span className="truncate">{conv.orderDraft.productName}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Chat Stream (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[680px] bg-white">
          {!selectedConv ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-2">
              <Bot size={36} className="text-luxury-gold/50" />
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-600">Select a Conversation</p>
              <p className="text-xs max-w-sm">Choose a conversation from the left to view customer inquiries, AI responses, or take over manually.</p>
            </div>
          ) : (
            <>
              {/* Chat Header Bar */}
              <div className="p-3.5 px-5 border-b border-luxury-gray flex flex-wrap items-center justify-between gap-3 bg-white">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-luxury-dark">
                      {selectedConv.customerName}
                    </h3>
                    <span className="text-xs font-mono text-gray-500">
                      (+{selectedConv.whatsappNumber})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-0.5">
                    {selectedConv.humanHandover ? (
                      <span className="text-[10px] text-red-600 font-bold flex items-center space-x-1">
                        <AlertTriangle size={11} />
                        <span>Customer requested human assistance</span>
                      </span>
                    ) : selectedConv.aiEnabled ? (
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1">
                        <Sparkles size={11} className="text-emerald-500" />
                        <span>AI Assistant responding automatically</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-semibold">
                        AI Paused. Human agent in control.
                      </span>
                    )}
                  </div>
                </div>

                {/* Handover & AI Control Buttons */}
                <div className="flex items-center space-x-2">
                  {selectedConv.aiEnabled && !selectedConv.humanHandover ? (
                    <button
                      type="button"
                      onClick={() => handleToggleAI(false, true)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
                      title="Pause AI and talk to the customer yourself"
                    >
                      <UserCheck size={13} />
                      <span>Take Over (Pause AI)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleAI(true, false)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
                      title="Let the AI resume replying to this customer"
                    >
                      <Bot size={13} />
                      <span>Enable AI Automation</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Order In-Progress Alert Banner */}
              {selectedConv.orderDraft?.productName && (
                <div className="bg-amber-50 border-b border-amber-200 p-2.5 px-5 flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center space-x-2 truncate">
                    <ShoppingBag size={14} className="text-amber-700 flex-shrink-0" />
                    <span className="font-bold">Active WhatsApp Order Draft:</span>
                    <span className="truncate">
                      {selectedConv.orderDraft.productName} ({selectedConv.orderDraft.color || 'Standard'}, Size: {selectedConv.orderDraft.size || 'Pending'}) x {selectedConv.orderDraft.quantity || 1}
                    </span>
                  </div>
                  <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Step: {selectedConv.orderDraft.step || 'Draft'}
                  </span>
                </div>
              )}

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#f0f2f5]/40">
                {chatLoading ? (
                  <div className="text-center py-10 text-xs text-gray-400">Loading chat history...</div>
                ) : (selectedConv.messages || []).length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-400">No messages in this chat yet.</div>
                ) : (
                  selectedConv.messages.map((msg, index) => {
                    const isCustomer = msg.direction === 'incoming';
                    const isBot = msg.sender === 'bot';
                    const isAgent = msg.sender === 'agent';

                    return (
                      <div
                        key={msg._id || index}
                        className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                      >
                        {/* Sender Label */}
                        <span className="text-[10px] text-gray-400 mb-0.5 px-1 font-semibold">
                          {isCustomer
                            ? (selectedConv.customerName || 'Customer')
                            : isBot
                            ? '🤖 AI Assistant'
                            : '👨‍💼 Support Specialist'}
                        </span>

                        {/* Bubble */}
                        <div
                          className={`max-w-md sm:max-w-lg rounded-lg p-3 text-xs shadow-xs leading-relaxed whitespace-pre-line ${
                            isCustomer
                              ? 'bg-white text-gray-900 border border-gray-200 rounded-tl-none'
                              : isBot
                              ? 'bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-tr-none'
                              : 'bg-luxury-dark text-white border border-gray-800 rounded-tr-none'
                          }`}
                        >
                          {msg.mediaUrl && (
                            <div className="mb-2 rounded overflow-hidden border border-gray-200">
                              <img src={msg.mediaUrl} alt="WhatsApp attachment" className="w-full max-h-56 object-cover" />
                            </div>
                          )}
                          <p>{msg.text}</p>
                          <div className={`flex items-center justify-end space-x-1 mt-1 text-[9px] ${isCustomer ? 'text-gray-400' : isBot ? 'text-emerald-700' : 'text-gray-300'}`}>
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {!isCustomer && <CheckCheck size={11} />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Reply Form */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-luxury-gray bg-white flex items-center space-x-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    selectedConv.humanHandover
                      ? 'Type reply as human agent...'
                      : 'Type manual WhatsApp message (Take over active chat)...'
                  }
                  className="flex-1 text-xs border border-gray-300 p-2.5 px-3 rounded focus:outline-none focus:border-luxury-gold bg-white"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sending}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors flex items-center space-x-1.5 shadow-xs"
                >
                  <Send size={13} />
                  <span>{sending ? 'Sending...' : 'Send'}</span>
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default WhatsAppChat;
