import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ProductCard';

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
        
        // 1. Featured
        const featuredRes = await axios.get('/api/products?featured=true&limit=4');
        if (featuredRes.data.success) setFeaturedProducts(featuredRes.data.data);
        
        // 2. New Arrivals
        const newArrivalsRes = await axios.get('/api/products?newArrival=true&limit=4');
        if (newArrivalsRes.data.success) setNewArrivals(newArrivalsRes.data.data);

        // 3. Bestsellers
        const bestsellersRes = await axios.get('/api/products?bestseller=true&limit=4');
        if (bestsellersRes.data.success) setBestsellers(bestsellersRes.data.data);

      } catch (err) {
        console.error('Error fetching homepage products:', err);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchHomeProducts();
  }, []);

  // Filter hero banners vs promo banners
  const heroBanners = banners.filter(b => b.type === 'hero');
  const promoBanners = banners.filter(b => b.type === 'promo');

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
        <section className="relative h-[35vh] sm:h-[50vh] md:h-[65vh] lg:h-[75vh] bg-luxury-dark rounded overflow-hidden shadow-sm">
          {heroBanners.length === 0 ? (
            // Fallback static Hero
            <div className="absolute inset-0 overflow-hidden">
              {/* Blurred background cover */}
              <div 
                className="absolute inset-0 bg-cover bg-center blur-md opacity-80 scale-110" 
                style={{ backgroundImage: "" }}
              ></div>
              {/* Contained full-fit image */}
              <div 
                className="absolute inset-0 bg-contain bg-no-repeat bg-center" 
                style={{ backgroundImage: "" }}
              ></div>
              <div className="absolute inset-0 banner-overlay"></div>
              <div className="absolute inset-0 flex items-end sm:items-center pb-8 sm:pb-0 z-10">
                <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 w-full text-white space-y-4 sm:space-y-6 pb-6 sm:pb-0">
                  <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-luxury-gold font-bold">
                    Exclusive Luxury Modesty
                  </p>
                  <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wider max-w-2xl leading-tight">
                    Premium Luxury Modest Wear
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-250 max-w-xs sm:max-w-md font-normal leading-relaxed text-shadow-sm">
                    Discover our exclusive collection of premium Abayas, Hijabs, and luxury accessories.
                  </p>
                  <div className="flex flex-row space-x-3 pt-2 sm:pt-4">
                    <Link to="/shop" className="luxury-btn-gold px-6 py-3 sm:px-8 sm:py-3.5 text-xs tracking-widest font-bold">
                      Shop Now
                    </Link>
                    <Link to="/shop?sort=newest" className="luxury-btn-outline border-white text-white hover:bg-white hover:text-luxury-dark px-6 py-3 sm:px-8 sm:py-3.5 text-xs tracking-widest font-bold">
                      Explore New
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Dynamic Banners
            heroBanners.map((banner, index) => (
              <div
                key={banner._id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                {/* Blurred background cover */}
                <div
                  className="absolute inset-0 bg-cover bg-center blur-md opacity-80 scale-110 transition-transform duration-[6000ms] ease-out"
                  style={{
                    backgroundImage: `url('${banner.image}')`,
                    transform: index === currentSlide ? 'scale(1.05)' : 'scale(1.1)',
                  }}
                ></div>
                {/* Contained full-fit image */}
                <div
                  className="absolute inset-0 bg-contain bg-no-repeat bg-center transition-transform duration-[6000ms] ease-out"
                  style={{
                    backgroundImage: `url('${banner.image}')`,
                    transform: index === currentSlide ? 'scale(1)' : 'scale(1.03)',
                  }}
                ></div>
                <div className="absolute inset-0 banner-overlay"></div>
                <div className="absolute inset-0 flex items-end sm:items-center pb-8 sm:pb-0 z-20">
                  <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 w-full text-white space-y-4 sm:space-y-6 pb-6 sm:pb-0">
                    <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-luxury-gold font-bold">
                      Ubaid Al Abayat Signature
                    </p>
                    <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wider max-w-2xl leading-tight">
                      {banner.title}
                    </h2>
                    <p className="text-xs sm:text-sm md:text-base text-gray-250 max-w-xs sm:max-w-md font-normal leading-relaxed text-shadow-sm">
                      {banner.subtitle}
                    </p>
                    <div className="flex pt-2 sm:pt-4">
                      <Link
                        to={banner.link || '/shop'}
                        className="luxury-btn-gold px-6 py-3 sm:px-8 sm:py-3.5 text-xs tracking-widest font-bold flex items-center group"
                      >
                        Shop Collection
                        <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
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
