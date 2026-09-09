import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ProductCard';
import logoImg from '../assets/logo.png';
import { generateSrcSet, DESKTOP_BANNER_WIDTHS, MOBILE_BANNER_WIDTHS } from '../utils/imageOptimizer';

const Home = () => {
  const { settings, banners, categories } = useSettings();
  
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Active Hero banner index
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch product grids
  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        setProductsLoading(true);
        
        // Fetch all product sections concurrently in parallel
        const [featuredRes, newArrivalsRes, bestsellersRes] = await Promise.all([
          axios.get('/api/products?featured=true&limit=4').catch((err) => ({ error: err })),
          axios.get('/api/products?newArrival=true&limit=4').catch((err) => ({ error: err })),
          axios.get('/api/products?bestseller=true&limit=4').catch((err) => ({ error: err })),
        ]);

        if (featuredRes?.data?.success) setFeaturedProducts(featuredRes.data.data);
        if (newArrivalsRes?.data?.success) setNewArrivals(newArrivalsRes.data.data);
        if (bestsellersRes?.data?.success) setBestsellers(bestsellersRes.data.data);

      } catch (err) {
        console.error('Error fetching homepage products:', err);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchHomeProducts();
  }, []);

  // Filter hero banners vs promo banners directly from database
  const heroBanners = banners.filter((b) => b.type === 'hero' && b.isActive !== false);
  const promoBanners = banners.filter((b) => b.type === 'promo' && b.isActive !== false);

  // Preload primary LCP hero image
  useEffect(() => {
    if (heroBanners.length > 0) {
      const first = heroBanners[0];
      const desktopImg = first.desktopImage || first.image;
      if (desktopImg) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = desktopImg;
        link.fetchPriority = 'high';
        document.head.appendChild(link);
        return () => {
          if (document.head.contains(link)) document.head.removeChild(link);
        };
      }
    }
  }, [heroBanners.length]);

  // Hero carousel auto-play
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, [heroBanners.length]);

  return (
    <div className="space-y-16 pb-12">
      
      <div className="max-w-[1550px] mx-auto px-2 sm:px-4 lg:px-6 pt-4">
        {heroBanners.length > 0 ? (
          <section className="relative w-full h-[clamp(500px,75vh,650px)] sm:h-[clamp(500px,68vh,650px)] lg:h-[clamp(550px,75vh,750px)] max-h-[750px] bg-luxury-dark rounded-lg overflow-hidden shadow-md">
            {heroBanners.map((banner, index) => {
              const desktopSrc = banner.desktopImage || banner.image;
              const mobileSrc = banner.mobileImage || desktopSrc;
              const altText = banner.altText || banner.title || 'Ubaid Al Abayat Luxury Modest Fashion';
              const ctaText = banner.ctaText || 'Shop Collection';
              const ctaUrl = banner.ctaUrl || banner.link || '/shop';

              return (
                <div
                  key={banner._id || index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {/* 100% Crisp Responsive Picture Element (No Blurred Sides!) */}
                  <picture className="absolute inset-0 w-full h-full block">
                    {/* 1. Mobile Screens (< 768px): 3:4 Portrait Variant */}
                    <source
                      media="(max-width: 767px)"
                      type="image/avif"
                      srcSet={generateSrcSet(mobileSrc, MOBILE_BANNER_WIDTHS, 'avif')}
                      sizes="100vw"
                    />
                    <source
                      media="(max-width: 767px)"
                      type="image/webp"
                      srcSet={generateSrcSet(mobileSrc, MOBILE_BANNER_WIDTHS, 'webp')}
                      sizes="100vw"
                    />
                    <source
                      media="(max-width: 767px)"
                      srcSet={generateSrcSet(mobileSrc, MOBILE_BANNER_WIDTHS, 'auto')}
                      sizes="100vw"
                    />

                    {/* 2. Tablet, Laptop & Desktop Screens (>= 768px): 2:1 Wide Variant */}
                    <source
                      media="(min-width: 768px)"
                      type="image/avif"
                      srcSet={generateSrcSet(desktopSrc, DESKTOP_BANNER_WIDTHS, 'avif')}
                      sizes="100vw"
                    />
                    <source
                      media="(min-width: 768px)"
                      type="image/webp"
                      srcSet={generateSrcSet(desktopSrc, DESKTOP_BANNER_WIDTHS, 'webp')}
                      sizes="100vw"
                    />
                    <source
                      media="(min-width: 768px)"
                      srcSet={generateSrcSet(desktopSrc, DESKTOP_BANNER_WIDTHS, 'auto')}
                      sizes="100vw"
                    />

                    {/* 3. Base Fallback Image */}
                    <img
                      src={desktopSrc}
                      alt={altText}
                      className="w-full h-full object-cover [object-position:var(--mob-pos)] md:[object-position:var(--desk-pos)] transition-transform duration-[7000ms] ease-out"
                      style={{
                        '--desk-pos': banner.desktopPosition || 'center',
                        '--mob-pos': banner.mobilePosition || 'center',
                        transform: index === currentSlide ? 'scale(1.03)' : 'scale(1)',
                      }}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      decoding="async"
                    />
                  </picture>

                  {/* Gradient overlay only if title/subtitle is present */}
                  {(banner.title || banner.subtitle) ? (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/85 via-black/45 sm:via-black/35 to-transparent"></div>
                      <div className="absolute inset-0 flex items-end sm:items-center pb-12 sm:pb-0 z-20">
                        <div className="max-w-[1550px] mx-auto px-5 sm:px-8 lg:px-12 w-full text-white space-y-3 sm:space-y-5">
                          <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-luxury-gold font-bold">
                            Ubaid Al Abayat Signature
                          </p>

                          {banner.title && (
                            index === 0 ? (
                              <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wider max-w-2xl leading-tight text-white drop-shadow-sm">
                                {banner.title}
                              </h1>
                            ) : (
                              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wider max-w-2xl leading-tight text-white drop-shadow-sm">
                                {banner.title}
                              </h2>
                            )
                          )}

                          {banner.subtitle && (
                            <p className="text-xs sm:text-sm md:text-base text-gray-200 max-w-xs sm:max-w-md font-normal leading-relaxed">
                              {banner.subtitle}
                            </p>
                          )}

                          <div className="flex pt-2 sm:pt-4">
                            <Link
                              to={ctaUrl}
                              className="luxury-btn-gold px-5 py-2.5 sm:px-8 sm:py-3.5 text-xs tracking-widest font-bold flex items-center group shadow-md"
                            >
                              <span>{ctaText}</span>
                              <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    // If banner has no text overlay, whole banner is clickable
                    ctaUrl && (
                      <Link to={ctaUrl} className="absolute inset-0 z-20" aria-label={altText} />
                    )
                  )}
                </div>
              );
            })}

            {/* Minimal Luxury Slide Indicators */}
            {heroBanners.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center items-center space-x-2">
                {heroBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentSlide ? 'w-8 bg-luxury-gold' : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* Aesthetic Brand Card with Official Registered Logo (Shown ONLY when DB has 0 banners) */
          <section className="relative w-full h-[320px] sm:h-[400px] bg-gradient-to-b from-[#161616] to-[#0d0d0d] rounded-lg overflow-hidden shadow-md border border-luxury-gray/20 flex items-center justify-center text-center p-6">
            <div className="absolute w-[280px] h-[280px] bg-gradient-to-tr from-[#C5A880]/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 max-w-md space-y-4">
              <img
                src={logoImg}
                alt="Ubaid Al Abayat Official Registered Logo"
                className="h-16 w-16 mx-auto object-contain animate-logo-shimmer drop-shadow-[0_0_14px_rgba(197,168,128,0.5)]"
              />
              <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-luxury-gold font-bold">
                Bespoke Modest Fashion
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-wider text-white">
                Ubaid Al Abayat
              </h2>
              <p className="text-xs text-gray-300 font-light leading-relaxed">
                Handcrafted luxury abayas, hijabs, and timeless modest apparel designed for ultimate elegance.
              </p>
              <div className="pt-2">
                <Link to="/shop" className="luxury-btn-gold px-6 py-2.5 text-xs tracking-widest font-bold inline-block">
                  Explore Collection
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* 2. CATEGORIES SECTION */}
      <section className="max-w-[1550px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="text-center space-y-2 mb-10">
          <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-luxury-goldDark font-bold">
            Browse By Design
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider">
            Premium Categories
          </h2>
          <div className="h-0.5 w-12 bg-luxury-gold mx-auto"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?category=${cat.slug}`}
              className="group relative block aspect-[4/5] bg-luxury-cream border border-luxury-gray overflow-hidden shadow-sm"
            >
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&q=80&w=400'}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-750 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 sm:p-6">
                <div className="text-white">
                  <h3 className="font-serif text-sm sm:text-base font-bold uppercase tracking-wider">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] sm:text-xs tracking-widest text-luxury-gold uppercase font-bold group-hover:underline flex items-center mt-1">
                    Discover Collection <ArrowRight size={12} className="ml-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. NEW ARRIVALS GRID */}
      <section className="max-w-[1550px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center border-b border-luxury-gray pb-4 mb-8">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-serif font-bold uppercase tracking-wider">
              New Arrivals
            </h2>
            <p className="text-xs sm:text-sm tracking-widest text-luxury-goldDark uppercase mt-1">
              Fresh additions to your modest wardrobe
            </p>
          </div>
          <Link
            to="/shop?sort=newest"
            className="text-xs sm:text-sm tracking-widest uppercase font-bold text-luxury-dark hover:text-luxury-gold flex items-center mt-3 sm:mt-0"
          >
            View All New Arrivals <ArrowRight size={12} className="ml-1" />
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="animate-pulse space-y-4">
                <div className="bg-gray-200 aspect-[3/4] w-full"></div>
                <div className="h-4 bg-gray-200 w-3/4"></div>
                <div className="h-4 bg-gray-200 w-1/4"></div>
              </div>
            ))}
          </div>
        ) : newArrivals.length === 0 ? (
          <div className="text-center py-12 text-xs uppercase text-luxury-textGray">No products available.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 4. PROMO BANNER SECTION */}
      {promoBanners.length > 0 && (
        <section className="bg-luxury-cream py-10 border-y border-luxury-gray">
          <div className="max-w-[1550px] mx-auto px-2 sm:px-4 lg:px-6">
            <div className="relative aspect-[21/9] w-full overflow-hidden bg-luxury-dark shadow-lg">
              <img
                src={promoBanners[0].image}
                alt={promoBanners[0].title}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-black bg-opacity-35 flex flex-col justify-center items-center text-center p-6 text-white space-y-4">
                <h3 className="font-serif text-xl sm:text-3xl font-bold uppercase tracking-wider">
                  {promoBanners[0].title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 font-light max-w-md">
                  {promoBanners[0].subtitle}
                </p>
                <Link
                  to={promoBanners[0].link || '/shop'}
                  className="luxury-btn bg-white text-luxury-dark hover:bg-luxury-gold hover:text-luxury-dark text-[10px]"
                >
                  Shop The Promotion
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. BEST SELLERS GRID */}
      <section className="max-w-[1550px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center border-b border-luxury-gray pb-4 mb-8">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-serif font-bold uppercase tracking-wider">
              Bestsellers
            </h2>
            <p className="text-[10px] tracking-widest text-luxury-goldDark uppercase mt-1">
              Top trending pieces loved by our customers
            </p>
          </div>
          <Link
            to="/shop?sort=bestselling"
            className="text-[10px] tracking-widest uppercase font-bold text-luxury-dark hover:text-luxury-gold flex items-center mt-3 sm:mt-0"
          >
            View All Bestsellers <ArrowRight size={12} className="ml-1" />
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="animate-pulse space-y-4">
                <div className="bg-gray-200 aspect-[3/4] w-full"></div>
                <div className="h-4 bg-gray-200 w-3/4"></div>
                <div className="h-4 bg-gray-200 w-1/4"></div>
              </div>
            ))}
          </div>
        ) : bestsellers.length === 0 ? (
          <div className="text-center py-12 text-xs uppercase text-luxury-textGray">No products available.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {bestsellers.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 6. WHY CHOOSE US (LUXURY HIGHLIGHTS) */}
      <section className="bg-white py-16 border-y border-luxury-gray">
        <div className="max-w-[1550px] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="text-center space-y-2 mb-12">
            <p className="text-[10px] tracking-[0.3em] uppercase text-luxury-goldDark font-bold">
              The Boutique Standards
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider">
              Why Choose Ubaid Al Abayat?
            </h2>
            <div className="h-0.5 w-12 bg-luxury-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4 p-4">
              <div className="inline-block p-4 bg-luxury-light text-luxury-gold rounded-full border border-luxury-gray">
                <ShieldCheck size={28} />
              </div>
              <h3 className="font-serif text-sm font-semibold uppercase tracking-wider">
                Premium Saudi Nidha
              </h3>
              <p className="text-xs text-luxury-textGray leading-relaxed">
                We import luxury Saudi Nidha and crepe fabric, ensuring long-lasting color, soft weight, and wrinkle-resistance.
              </p>
            </div>

            <div className="text-center space-y-4 p-4">
              <div className="inline-block p-4 bg-luxury-light text-luxury-gold rounded-full border border-luxury-gray">
                <Truck size={28} />
              </div>
              <h3 className="font-serif text-sm font-semibold uppercase tracking-wider">
                Reliable COD Countrywide
              </h3>
              <p className="text-xs text-luxury-textGray leading-relaxed">
                Enjoy fast cash-on-delivery shipping across Pakistan. Standard orders arrive in 3-5 business days.
              </p>
            </div>

            <div className="text-center space-y-4 p-4">
              <div className="inline-block p-4 bg-luxury-light text-luxury-gold rounded-full border border-luxury-gray">
                <RotateCcw size={28} />
              </div>
              <h3 className="font-serif text-sm font-semibold uppercase tracking-wider">
                Hassle-Free Returns
              </h3>
              <p className="text-xs text-luxury-textGray leading-relaxed">
                Unsatisfied with your sizing? Return or exchange unworn pieces within 7 days, no questions asked.
              </p>
            </div>

            <div className="text-center space-y-4 p-4">
              <div className="inline-block p-4 bg-luxury-light text-luxury-gold rounded-full border border-luxury-gray">
                <MessageSquare size={28} />
              </div>
              <h3 className="font-serif text-sm font-semibold uppercase tracking-wider">
                WhatsApp Quick Support
              </h3>
              <p className="text-xs text-luxury-textGray leading-relaxed">
                Need details on custom sizing, order updates, or styling guides? Direct chat with our stylist instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER REVIEWS TESTIMONIALS */}
      <section className="max-w-[1550px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="text-center space-y-2 mb-12">
          <p className="text-[10px] tracking-[0.3em] uppercase text-luxury-goldDark font-bold">
            Customer Love
          </p>
          <h2 className="text-2xl font-serif font-bold uppercase tracking-wider">
            Testimonials
          </h2>
          <div className="h-0.5 w-12 bg-luxury-gold mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 border border-luxury-gray rounded shadow-sm space-y-4">
            <div className="text-luxury-gold font-bold text-lg">"Absolutely Premium"</div>
            <p className="text-xs text-luxury-textGray leading-relaxed">
              "The embroidery on the Zahra Abaya is exceptionally neat. Tailoring is perfect. Exceeded my expectations!"
            </p>
            <div className="border-t border-luxury-gray pt-3">
              <p className="text-[10px] uppercase font-bold tracking-wider">Zobia N. - Islamabad</p>
            </div>
          </div>

          <div className="bg-white p-6 border border-luxury-gray rounded shadow-sm space-y-4">
            <div className="text-luxury-gold font-bold text-lg">"Incredibly Soft Georgette"</div>
            <p className="text-xs text-luxury-textGray leading-relaxed">
              "Ordered modal and georgette hijabs. The draping is gorgeous, and they are completely slip-free. Recommended!"
            </p>
            <div className="border-t border-luxury-gray pt-3">
              <p className="text-[10px] uppercase font-bold tracking-wider">Amina K. - Karachi</p>
            </div>
          </div>

          <div className="bg-white p-6 border border-luxury-gray rounded shadow-sm space-y-4">
            <div className="text-luxury-gold font-bold text-lg">"Outstanding Customer Service"</div>
            <p className="text-xs text-luxury-textGray leading-relaxed">
              "I wanted to customize my Abaya sleeve length. The team aligned over WhatsApp and delivered the perfect dress!"
            </p>
            <div className="border-t border-luxury-gray pt-3">
              <p className="text-[10px] uppercase font-bold tracking-wider">Maryam F. - Lahore</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
