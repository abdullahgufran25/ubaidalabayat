import React from 'react';
import { Target, Eye, Sparkles, Heart, Shield } from 'lucide-react';
import founderImg from '../assets/founder.jpg';

const About = () => {
  return (
    <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20 animate-fade-in font-sans">
      
      {/* 1. HERO TITLE */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold uppercase tracking-wider text-luxury-dark">Our Story</h1>
        <p className="text-xs sm:text-sm text-luxury-goldDark uppercase tracking-widest font-bold">
          Ubaid Al Abayat — Where Modesty Meets Elegance
        </p>
        <div className="h-0.5 w-16 bg-luxury-gold mx-auto"></div>
      </div>

      {/* 2. FOUNDER STORY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-center">
        
        {/* Founder Image */}
        <div className="md:col-span-5 relative group">
          <div className="absolute inset-0 border border-luxury-gold translate-x-3 translate-y-3 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:translate-y-1.5 -z-10 rounded"></div>
          <div className="aspect-[3/4] bg-luxury-cream border-2 border-luxury-gray overflow-hidden shadow-md rounded">
            <img
              src={founderImg}
              alt="Ubaid Al Abayat Founder"
              className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-500 ease-out"
            />
          </div>
          <div className="absolute bottom-4 left-4 bg-luxury-dark/90 text-white p-3 rounded shadow border border-luxury-gold/30">
            <p className="text-xs font-bold uppercase tracking-widest">Founder Profile</p>
            <p className="text-[10px] text-luxury-gold font-semibold uppercase mt-0.5">Ubaid Al Abayat</p>
          </div>
        </div>

        {/* Story Text */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-luxury-goldDark">The Journey</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-wide text-luxury-dark leading-tight">
              Elegance in Modesty. <br />Confidence in Every Step.
            </h2>
          </div>
          
          <div className="space-y-4 text-sm text-luxury-textGray leading-relaxed font-normal">
            <p>
              Ubaid Al Abayat was born from a simple vision: to create a place where women could find beautiful, comfortable, and elegant modest clothing without having to compromise between fashion and modesty.
            </p>
            <p>
              We noticed that many women wanted modest wear that was not only appropriate and comfortable but also stylish, modern, and made with attention to detail. This idea inspired the journey of Ubaid Al Abayat.
            </p>
            <p>
              What started as a passion for elegant Islamic fashion grew into a vision of offering a carefully curated collection of Abayas, Jilbabs, Hijabs, Khimars, Chadors, and other modest essentials.
            </p>
          </div>

          {/* Golden Quote Block */}
          <div className="bg-luxury-cream/40 border-l-4 border-luxury-gold p-4 sm:p-5 rounded">
            <p className="text-xs font-serif italic text-luxury-dark leading-relaxed">
              "Every woman deserves to feel confident, comfortable, and beautiful while staying true to her values."
            </p>
          </div>

          <p className="text-sm text-luxury-textGray leading-relaxed font-normal">
            Today, Ubaid Al Abayat continues to grow with the goal of becoming a trusted name in modest fashion, bringing timeless elegance and meaningful style to women everywhere.
          </p>
        </div>
      </div>

      {/* 3. BRAND DESCRIPTION SECTION */}
      <div className="bg-luxury-dark text-white rounded p-8 sm:p-12 shadow-md relative overflow-hidden border border-luxury-gold/25">
        <div className="absolute right-0 top-0 w-64 h-64 bg-luxury-gold opacity-5 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-wider text-luxury-gold">
            Brand Description
          </h2>
          <div className="h-0.5 w-12 bg-luxury-gold mx-auto"></div>
          <div className="space-y-4 text-sm text-gray-300 leading-relaxed font-light">
            <p>
              Ubaid Al Abayat is a modest fashion brand dedicated to bringing elegance, comfort, and timeless Islamic style together. Our collection is thoughtfully designed for women who value modesty without compromising on beauty, confidence, and modern fashion.
            </p>
            <p>
              From graceful Abayas and Jilbabs to elegant Hijabs, Khimars, Chadors, and modest wear, every piece is selected and designed with attention to quality, comfort, and sophistication.
            </p>
            <p>
              At Ubaid Al Abayat, we believe that modesty is not just about what you wear — it is a reflection of confidence, dignity, and identity. Our mission is to make beautiful modest fashion accessible to every woman, offering styles suitable for everyday wear, special occasions, Umrah, and beyond.
            </p>
          </div>
        </div>
      </div>

      {/* 4. MISSION & VISION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Our Mission */}
        <div className="bg-white border-2 border-luxury-gray p-8 sm:p-10 rounded shadow-sm hover:border-luxury-gold transition-all duration-300 space-y-5">
          <div className="flex items-center space-x-4">
            <div className="bg-luxury-cream p-3 rounded-full text-luxury-goldDark">
              <Target size={24} />
            </div>
            <h3 className="font-serif text-xl font-bold uppercase tracking-wider text-luxury-dark">Our Mission</h3>
          </div>
          <div className="space-y-3 text-sm text-luxury-textGray leading-relaxed font-normal">
            <p>
              At Ubaid Al Abayat, our mission is to make modest fashion elegant, comfortable, accessible, and empowering. We strive to provide high-quality Abayas, Jilbabs, Hijabs, Khimars, Chadors, and modest wear that allow women to express their personal style while embracing modesty and confidence.
            </p>
            <p>
              We are committed to delivering quality products, thoughtful designs, and a memorable shopping experience for every customer.
            </p>
          </div>
        </div>

        {/* Our Vision */}
        <div className="bg-white border-2 border-luxury-gray p-8 sm:p-10 rounded shadow-sm hover:border-luxury-gold transition-all duration-300 space-y-5">
          <div className="flex items-center space-x-4">
            <div className="bg-luxury-cream p-3 rounded-full text-luxury-goldDark">
              <Eye size={24} />
            </div>
            <h3 className="font-serif text-xl font-bold uppercase tracking-wider text-luxury-dark">Our Vision</h3>
          </div>
          <div className="space-y-3 text-sm text-luxury-textGray leading-relaxed font-normal">
            <p>
              Our vision is to become a trusted and leading modest fashion brand, recognized for timeless designs, exceptional quality, and a deep understanding of modern women's modest fashion needs.
            </p>
            <p>
              We aim to build a brand that goes beyond clothing — creating a community where modesty, elegance, confidence, and individuality come together.
            </p>
          </div>
        </div>

      </div>

      {/* 5. BRAND VALUES BANNER */}
      <div className="border-t border-b border-luxury-gray py-8 text-center">
        <p className="font-serif text-lg sm:text-xl text-luxury-goldDark font-bold uppercase tracking-widest italic">
          "Ubaid Al Abayat — Inspiring Confidence Through Modesty."
        </p>
      </div>

    </div>
  );
};

export default About;
