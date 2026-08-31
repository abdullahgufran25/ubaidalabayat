import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube, Twitter, Linkedin, Link2, ArrowRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import logoImg from '../assets/logo.png';

const Footer = () => {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const renderSocialIcon = (platform) => {
    const norm = platform.toLowerCase();
    if (norm.includes('facebook')) return <Facebook size={14} />;
    if (norm.includes('instagram')) return <Instagram size={14} />;
    if (norm.includes('youtube')) return <Youtube size={14} />;
    if (norm.includes('twitter') || norm.includes('x')) return <Twitter size={14} />;
    if (norm.includes('linkedin')) return <Linkedin size={14} />;
    return <Link2 size={14} />;
  };

  return (
    <footer className="bg-luxury-dark text-white pt-16 pb-8 border-t border-luxury-gray">
      <div className="max-w-[1550px] mx-auto px-2 sm:px-4 lg:px-6">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img src={logoImg} alt="Ubaid Al Abayat" className="w-8 h-8 object-contain filter invert animate-logo-shimmer" />
              <h2 className="font-serif text-xl font-bold tracking-widest uppercase text-white">
                Ubaid Al Abayat
              </h2>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-6">
              {settings.aboutUsText || 
                'Tailoring premium Saudi Nidha Abayas, Hijabs, and modest wear. Rooted in luxury Pakstani fashion values, redefining elegance.'}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {settings.socialLinks && settings.socialLinks.length > 0 ? (
                settings.socialLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 hover:text-luxury-gold transition-colors bg-gray-900/40 p-2 rounded-full border border-gray-800 flex items-center justify-center"
                    title={link.platform}
                  >
                    {renderSocialIcon(link.platform)}
                  </a>
                ))
              ) : (
                <>
                  <a
                    href={settings.facebookUrl || 'https://facebook.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 hover:text-luxury-gold transition-colors"
                  >
                    <Facebook size={18} />
                  </a>
                  <a
                    href={settings.instagramUrl || 'https://instagram.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 hover:text-luxury-gold transition-colors"
                  >
                    <Instagram size={18} />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-semibold mb-4 text-luxury-gold">
              Quick Links
            </h3>
            <ul className="space-y-3 text-xs text-gray-400">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">Shop Collection</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">Our Story</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-white transition-colors">Refund & Return Policy</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-semibold mb-4 text-luxury-gold">
              Contact Us
            </h3>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-start">
                <MapPin size={14} className="mr-2 text-luxury-gold flex-shrink-0 mt-0.5" />
                <span>{settings.contactAddress || 'Karachi, Pakistan'}</span>
              </li>
              <li className="flex items-center">
                <Phone size={14} className="mr-2 text-luxury-gold flex-shrink-0" />
                <span>{settings.contactPhone || '+92 300 1234567'}</span>
              </li>
              <li className="flex items-center">
                <Mail size={14} className="mr-2 text-luxury-gold flex-shrink-0" />
                <span>{settings.contactEmail || 'sales@ubaidalabayat.com'}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-semibold mb-4 text-luxury-gold">
              Join Our Newsletter
            </h3>
            <p className="text-gray-400 text-xs mb-4">
              Subscribe to receive updates on new arrivals, secret collections, and exclusive sales.
            </p>
            {subscribed ? (
              <div className="bg-luxury-gold bg-opacity-20 border border-luxury-gold text-luxury-gold px-3 py-2 text-[10px] uppercase tracking-wider">
                Thanks for subscribing! Check your inbox soon.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border border-gray-700 px-3 py-2 text-xs w-full text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold"
                />
                <button
                  type="submit"
                  className="bg-luxury-gold text-luxury-dark px-3 hover:bg-white hover:text-luxury-dark transition-colors"
                >
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest">
          <p>{settings.footerText || `© 2026 Ubaid Al Abayat. All Rights Reserved.`}</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="text-luxury-gold font-bold">Secure checkout via COD / Bank Transfer</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
