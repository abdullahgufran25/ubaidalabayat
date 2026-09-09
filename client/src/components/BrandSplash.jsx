import React from 'react';
import logoImg from '../assets/logo.png';

const BrandSplash = ({ fading = false }) => {
  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0d0d0d] text-white select-none transition-all duration-500 ease-in-out ${
        fading ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Subtle radial ambient gold glow */}
      <div className="absolute w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] bg-gradient-to-tr from-[#C5A880]/15 via-[#A68B63]/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 space-y-6">
        {/* Official Registered Brand Logo with aesthetic glowing effect */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#C5A880]/20 blur-xl scale-125 animate-pulse"></div>
          <img
            src={logoImg}
            alt="Ubaid Al Abayat Official Registered Logo"
            className="relative h-20 w-20 sm:h-24 sm:w-24 object-contain animate-logo-shimmer filter drop-shadow-[0_0_16px_rgba(197,168,128,0.7)]"
          />
        </div>

        {/* Brand Typography in Montserrat & Playfair */}
        <div className="space-y-2">
          <h1 className="font-serif text-lg sm:text-2xl tracking-[0.22em] sm:tracking-[0.28em] font-black uppercase text-white">
            Ubaid Al Abayat
          </h1>
          <p className="font-sans text-[9px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.35em] text-[#C5A880] font-semibold uppercase">
            Luxury Modest Fashion
          </p>
        </div>

        {/* Subtle Minimalist Loading Bar */}
        <div className="w-36 sm:w-48 h-[2px] bg-white/10 rounded-full overflow-hidden mt-4 relative">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-transparent via-[#C5A880] to-transparent w-full animate-splash-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default BrandSplash;
