import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const AnnouncementBar = () => {
  const { settings } = useSettings();
  const announcementConfig = settings?.announcementBar;

  const enabled = announcementConfig?.enabled !== false;
  const messages = announcementConfig?.messages || [];
  const speed = announcementConfig?.speed || 4000;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFading, setIsFading] = useState(false);

  // Auto-slide effect
  useEffect(() => {
    if (!enabled || messages.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
        setIsFading(false);
      }, 250);
    }, speed);

    return () => clearInterval(timer);
  }, [enabled, messages.length, speed, isPaused]);

  // Keep index within bounds if messages array changes
  useEffect(() => {
    if (currentIndex >= messages.length && messages.length > 0) {
      setCurrentIndex(0);
    }
  }, [messages.length, currentIndex]);

  if (!enabled || !messages || messages.length === 0) {
    return null;
  }

  const currentMsg = messages[currentIndex] || messages[0];

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + messages.length) % messages.length);
      setIsFading(false);
    }, 150);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
      setIsFading(false);
    }, 150);
  };

  const renderContent = () => {
    const content = (
      <div 
        className={`flex items-center justify-center space-x-2 text-center transition-all duration-300 transform ${
          isFading ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
        }`}
      >
        <Sparkles size={12} className="text-luxury-gold flex-shrink-0 animate-pulse hidden min-[420px]:inline-block" />
        <span className="text-[10px] min-[360px]:text-[10.5px] sm:text-[11.5px] font-medium tracking-[0.12em] sm:tracking-[0.16em] uppercase text-luxury-light hover:text-white transition-colors select-none line-clamp-1">
          {currentMsg.text}
        </span>
        {currentMsg.link && (
          <span className="hidden md:inline-block text-[9px] text-luxury-gold font-bold tracking-widest uppercase ml-1 underline decoration-luxury-gold/50 underline-offset-2">
            Shop Now →
          </span>
        )}
      </div>
    );

    if (currentMsg.link) {
      return (
        <Link 
          to={currentMsg.link} 
          className="inline-block hover:opacity-90 transition-opacity max-w-full"
        >
          {content}
        </Link>
      );
    }

    return content;
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full bg-[#0D0D0D] text-white border-b border-[#222222] py-2 px-3 sm:px-6 z-50 select-none overflow-hidden"
    >
      <div className="max-w-[1550px] mx-auto flex items-center justify-between min-h-[18px]">
        
        {/* Left chevron arrow (only if multiple messages) */}
        <div className="w-6 sm:w-8 flex items-center justify-start">
          {messages.length > 1 && (
            <button
              onClick={handlePrev}
              className="text-gray-400 hover:text-luxury-gold p-1 transition-colors focus:outline-none"
              aria-label="Previous announcement"
              title="Previous offer"
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {/* Center promotional message */}
        <div className="flex-1 flex items-center justify-center px-2 overflow-hidden">
          {renderContent()}
        </div>

        {/* Right chevron arrow (only if multiple messages) */}
        <div className="w-6 sm:w-8 flex items-center justify-end">
          {messages.length > 1 && (
            <button
              onClick={handleNext}
              className="text-gray-400 hover:text-luxury-gold p-1 transition-colors focus:outline-none"
              aria-label="Next announcement"
              title="Next offer"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default AnnouncementBar;
