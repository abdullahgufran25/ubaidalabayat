import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';

const Contact = () => {
  const { settings } = useSettings();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/contact', {
        name,
        email,
        phone,
        message,
      });

      if (res.data.success) {
        addToast(res.data.message, 'success');
        setSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit contact form', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppChat = () => {
    const number = settings.whatsappNumber || '03287512751';
    let cleanNum = number.replace(/[^\d]/g, '');
    if (cleanNum.startsWith('03')) {
      cleanNum = '92' + cleanNum.substring(1);
    }
    const url = `https://wa.me/${cleanNum}?text=${encodeURIComponent('Hello Ubaid Al Abayat, I have an inquiry regarding your collections.')}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold uppercase tracking-wider">Contact Us</h1>
        <p className="text-xs text-luxury-goldDark uppercase tracking-widest font-bold">
          Align with our fashion stylists and support team
        </p>
        <div className="h-0.5 w-12 bg-luxury-gold mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
        
        {/* Contact Info Card */}
        <div className="bg-white border border-luxury-gray p-8 rounded space-y-6">
          <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-luxury-gold border-b border-luxury-gray pb-3">
            Get In Touch
          </h2>
          <p className="text-xs text-luxury-textGray leading-relaxed">
            Have questions about fabric imports, custom Abaya measurements, shipping delays, or wholesale orders? We are here to assist. Fill out the contact form or reach out directly!
          </p>

          <div className="space-y-4 text-xs">
            <div className="flex items-start">
              <MapPin className="mr-3 text-luxury-gold flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-bold text-luxury-dark uppercase tracking-wider">Boutique Address</p>
                <p className="text-luxury-textGray mt-1 leading-normal">{settings.contactAddress || 'Karachi, Pakistan'}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="mr-3 text-luxury-gold flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-bold text-luxury-dark uppercase tracking-wider">Call or SMS</p>
                <p className="text-luxury-textGray mt-1 font-sans">{settings.contactPhone || '+92 300 1234567'}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Mail className="mr-3 text-luxury-gold flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-bold text-luxury-dark uppercase tracking-wider">Email Inquiry</p>
                <p className="text-luxury-textGray mt-1 font-sans">{settings.contactEmail || 'info@ubaidalabayat.com'}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-luxury-gray pt-6">
            <button
              onClick={handleWhatsAppChat}
              className="w-full border border-green-200 bg-green-50 text-green-800 py-3 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-green-100 transition-colors flex items-center justify-center"
            >
              <MessageCircle size={16} className="mr-2" />
              Chat on WhatsApp Support
            </button>
          </div>
        </div>

        {/* Contact Form Submission */}
        <div className="bg-white border border-luxury-gray p-8 rounded space-y-6">
          <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-luxury-dark border-b border-luxury-gray pb-3">
            Send Inquiry Message
          </h2>

          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded text-center space-y-3">
              <CheckCircle size={32} className="mx-auto text-green-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider">Message Sent Successfully</h3>
              <p className="text-[11px] normal-case text-green-700">
                Thank you for contacting Ubaid Al Abayat. Our stylist/support team has received your message and will reply via email or phone within 24 hours.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="luxury-btn text-[9px] py-2 mt-4"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder="Sarah Fatima"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder="sarah@gmail.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder="03214445555"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray">Message Description *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-xs border border-luxury-gray p-2.5 rounded focus:outline-none focus:border-luxury-gold"
                  placeholder="Please write your inquiry details here..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full luxury-btn py-3 text-xs font-semibold flex items-center justify-center space-x-2"
              >
                <Send size={12} />
                <span>{loading ? 'Submitting...' : 'Submit Inquiry'}</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default Contact;
