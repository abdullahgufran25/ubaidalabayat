import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

/**
 * BackToTop Floating Luxury Button
 * Appears when user scrolls down and smoothly glides to top upon click
 */
const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Scroll to top"
      className={`fixed bottom-6 right-6 z-40 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-luxury-gold/60 bg-luxury-dark/95 text-luxury-gold shadow-lg shadow-black/30 backdrop-blur-sm transition-all duration-300 ease-out group hover:bg-luxury-gold hover:text-luxury-dark hover:border-luxury-gold hover:shadow-luxury-gold/40 hover:-translate-y-1 active:translate-y-0 ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
          : 'opacity-0 translate-y-6 pointer-events-none scale-75'
      }`}
    >
      <ChevronUp
        size={22}
        className="stroke-[2.5] group-hover:-translate-y-0.5 transition-transform duration-200"
      />
      {/* Luxury subtle ring aura */}
      <span className="absolute inset-0 rounded-full border border-luxury-gold/30 scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 pointer-events-none" />
    </button>
  );
};

export default BackToTop;
