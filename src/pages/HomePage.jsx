import React, { useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Star, Loader2, Instagram, ShieldCheck, Truck, Award } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrustBar from '@/components/TrustBar';
import { Button } from '@/components/ui/button';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const defaultInstagramImages = [
  'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cb3?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&auto=format&fit=crop',
];

const defaultFaqs = [
  { q: 'How long does delivery take?', a: 'We offer free delivery across India which typically takes 3-5 business days. Express shipping options are also available.' },
  { q: 'Is Cash on Delivery available?', a: 'Yes. You can pay via Cash on Delivery for all eligible orders with no extra charges.' },
  { q: 'What is your return policy?', a: 'We have a hassle-free 7-day return policy. If you do not love it, you can return it easily.' },
  { q: 'Are the bags exactly as shown in photos?', a: 'Yes. We take great care with photography so the product looks as close as possible to what you receive.' },
];

const HomePage = () => {
  const { products, reviews, instagramSettings, storeSettings, loading } = useSupabaseData();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const newArrivals = products.filter((product) => product.is_new_arrival).slice(0, 4);
  const bestSellers = products.filter((product) => product.is_best_seller).slice(0, 4);
  const displayNewArrivals = newArrivals.length > 0 ? newArrivals : products.slice(0, 4);
  const displayBestSellers = bestSellers.length > 0 ? bestSellers : products.slice(4, 8);

  const stats = [
    { label: 'Followers', value: '8.9k+' },
    { label: 'Happy Customers', value: `${Math.max(reviews.length, 1200)}+` },
    { label: '5-Star Reviews', value: `${Math.max(reviews.length, 500)}+` },
  ];

  const faqItems = (storeSettings.faqItems || []).length
    ? storeSettings.faqItems.map((faq) => ({ q: faq.question, a: faq.answer }))
    : defaultFaqs;
  const instagramImages = instagramSettings?.gallery?.length
    ? instagramSettings.gallery.slice(0, 6)
    : defaultInstagramImages;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium animate-pulse">Loading Luxury...</p>
        </div>
      </div>
    );
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <>
      <Helmet>
        <title>{storeSettings.brandName} - Premium Bridal & Party Clutches</title>
        <meta
          name="description"
          content={storeSettings.heroSubtitle || 'Shop premium luxury bags, bridal clutches, and designer handbags. Free delivery across India.'}
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        <TrustBar />
        <Header />

        {/* ═══════════════ PREMIUM HERO SECTION ═══════════════ */}
        <section ref={heroRef} className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Radial gold gradient */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_rgba(180,140,60,0.08)_0%,_transparent_70%)]" />
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,215,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            {/* Floating golden particles */}
            <motion.div
              animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[20%] right-[20%] w-2 h-2 rounded-full bg-yellow-500/30 blur-sm"
            />
            <motion.div
              animate={{ y: [15, -25, 15], x: [5, -15, 5], opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute top-[60%] left-[15%] w-3 h-3 rounded-full bg-amber-400/20 blur-sm"
            />
            <motion.div
              animate={{ y: [-10, 30, -10], opacity: [0.15, 0.35, 0.15] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
              className="absolute top-[30%] left-[40%] w-1.5 h-1.5 rounded-full bg-yellow-300/25 blur-[2px]"
            />
            <motion.div
              animate={{ y: [20, -15, 20], x: [-8, 12, -8], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute top-[70%] right-[35%] w-2 h-2 rounded-full bg-amber-300/20 blur-sm"
            />
          </div>

          {/* Diagonal gold accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
            className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent origin-left"
          />

          <div className="relative z-10 container mx-auto px-4 md:px-8 min-h-screen flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full py-24 lg:py-0">
              {/* Left: Editorial text content */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="text-white order-2 lg:order-1"
              >
                {/* Kicker badge */}
                <motion.div variants={fadeInUp} className="mb-8">
                  <span className="inline-flex items-center gap-2 py-2 px-4 border border-yellow-600/30 rounded-full bg-yellow-600/5 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    <span className="text-yellow-400 text-xs font-semibold tracking-[0.2em] uppercase">
                      {storeSettings.heroKicker || 'The Opulence Collection'}
                    </span>
                  </span>
                </motion.div>

                {/* Main headline */}
                <motion.h1
                  variants={fadeInUp}
                  className="font-display text-5xl md:text-6xl xl:text-7xl font-bold mb-6 leading-[1.1] tracking-tight"
                >
                  <span className="block text-white/90">
                    {storeSettings.heroTitle?.split('.')[0] || 'Masterpieces crafted for'}
                  </span>
                  <span className="block bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                    {storeSettings.heroTitle?.split('.')[1] || 'the extraordinary.'}
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  variants={fadeInUp}
                  className="text-lg md:text-xl text-gray-400 font-light max-w-lg mb-10 leading-relaxed"
                >
                  {storeSettings.heroSubtitle || 'Discover our exclusive selection of artisanal bridal clutches, bespoke gifting edits, and sculpted evening silhouettes.'}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mb-14">
                  <Link to="/category/bridal">
                    <Button className="relative bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 hover:from-yellow-500 hover:via-amber-400 hover:to-yellow-500 text-black font-bold px-10 py-6 text-base rounded-full w-full sm:w-auto shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_50px_rgba(234,179,8,0.5)] transition-all duration-500 tracking-wide uppercase text-sm">
                      Shop Bridal
                      <ArrowRight className="ml-2 w-4 h-4 inline-block" />
                    </Button>
                  </Link>
                  <Link to="/category/custom-bags">
                    <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-yellow-600/50 px-10 py-6 text-base rounded-full w-full sm:w-auto backdrop-blur-sm transition-all duration-500 tracking-wide uppercase text-sm">
                      Personalized Bags
                    </Button>
                  </Link>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                  variants={fadeInUp}
                  className="flex flex-wrap gap-6 md:gap-8"
                >
                  {[
                    { icon: Truck, label: 'Free Shipping' },
                    { icon: Award, label: 'Handcrafted' },
                    { icon: ShieldCheck, label: 'COD Available' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-500">
                      <item.icon className="w-4 h-4 text-yellow-600/70" />
                      <span className="text-xs font-medium tracking-wide uppercase">{item.label}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right: Product showcase */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                className="relative order-1 lg:order-2 flex justify-center items-center"
              >
                {/* Golden glow behind product */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[80%] h-[80%] rounded-full bg-gradient-to-br from-yellow-600/10 via-amber-500/5 to-transparent blur-3xl" />
                </div>

                {/* Rotating ring decoration */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-[90%] aspect-square rounded-full border border-dashed border-yellow-600/10"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-[75%] aspect-square rounded-full border border-yellow-600/5"
                />

                {/* Product image */}
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-10 w-full max-w-lg"
                >
                  <img
                    src={storeSettings.heroImage || '/images/hero-product.png'}
                    alt="Luxury designer clutch"
                    className="w-full h-auto object-contain drop-shadow-[0_20px_60px_rgba(180,140,60,0.25)]"
                  />
                </motion.div>

                {/* Floating badge - Price tag */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="absolute bottom-[10%] left-0 md:left-[5%] z-20"
                >
                  <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 text-white shadow-xl">
                    <p className="text-[10px] text-yellow-400/80 font-semibold tracking-wider uppercase mb-0.5">Starting From</p>
                    <p className="text-xl font-bold">₹1,299</p>
                  </div>
                </motion.div>

                {/* Floating badge - Rating */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.6 }}
                  className="absolute top-[15%] right-0 md:right-[5%] z-20"
                >
                  <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 text-white shadow-xl">
                    <div className="flex items-center gap-1 mb-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">1200+ Happy Customers</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] text-gray-600 tracking-[0.3em] uppercase font-medium">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-5 h-8 border border-gray-700 rounded-full flex justify-center pt-1.5">
                <motion.div
                  animate={{ opacity: [1, 0.3, 1], height: ['4px', '8px', '4px'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-0.5 bg-yellow-600/60 rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
        </section>

        <section className="py-16 bg-gradient-to-b from-[#0a0a0a] via-[#111] to-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center py-8 px-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 hover:border-yellow-600/20 transition-all duration-500"
                >
                  <motion.h3
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 100, delay: index * 0.1 }}
                    className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent mb-2"
                  >
                    {stat.value}
                  </motion.h3>
                  <p className="text-gray-400 font-medium uppercase tracking-[0.15em] text-xs">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-5xl font-bold mb-2">New Arrivals</h2>
              <p className="text-gray-500 text-lg">Fresh styles just landed for you</p>
            </motion.div>
            <Link to="/shop" className="hidden md:flex items-center text-yellow-700 font-semibold hover:text-yellow-800 transition-colors group">
              View All <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {displayNewArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/shop">
              <Button variant="outline" className="w-full">View All Products</Button>
            </Link>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Shop by Category</h2>
              <div className="w-20 h-1 bg-yellow-600 mx-auto rounded-full" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Bridal Clutches', image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&q=80&auto=format&fit=crop', link: '/category/bridal' },
                { name: 'Custom Bags', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80&auto=format&fit=crop', link: '/category/custom-bags' },
                { name: 'Crystal Bags', image: 'https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cb3?w=800&q=80&auto=format&fit=crop', link: '/category/party' },
              ].map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="group relative h-[400px] overflow-hidden rounded-2xl cursor-pointer shadow-xl"
                >
                  <Link to={category.link}>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10" />
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                      <h3 className="text-3xl font-bold text-white mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{category.name}</h3>
                      <div className="flex items-center text-white opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                        <span className="font-medium mr-2">Explore Collection</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-yellow-900 rounded-3xl p-8 md:p-16 text-center text-white mb-16 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Best Sellers of the Season</h2>
              <p className="text-yellow-100 text-lg max-w-2xl mx-auto mb-8">Curated favorites loved by our customers. These pieces are selling out fast.</p>
              <Link to="/shop">
                <Button size="lg" className="bg-white text-yellow-900 hover:bg-yellow-50 font-bold px-10">Shop Best Sellers</Button>
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {displayBestSellers.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose LuxeBag?</h2>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  We believe luxury should be accessible without compromising on quality. Every bag is a masterpiece, handcrafted with precision and checked for perfection.
                </p>

                <div className="space-y-6">
                  {[
                    { icon: ShieldCheck, title: '100% Quality Assurance', desc: 'Every piece goes through a rigorous 3-step quality check.' },
                    { icon: Truck, title: 'Free Express Shipping', desc: 'We deliver across India for free, typically within 3-5 days.' },
                    { icon: Award, title: 'Artisan Craftsmanship', desc: 'Handmade by skilled artisans using premium materials.' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="flex items-start"
                    >
                      <div className="bg-yellow-100 p-3 rounded-xl mr-4 text-yellow-700">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        <p className="text-gray-500">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-100 relative"
              >
                <div className="absolute -top-6 -right-6 bg-yellow-500 text-white p-4 rounded-xl shadow-lg transform rotate-6">
                  <Star className="w-8 h-8 fill-white" />
                </div>

                <h3 className="text-2xl font-bold mb-6">Customer Love</h3>
                <div className="h-[400px] overflow-y-auto pr-2 space-y-6 scrollbar-hide">
                  {reviews.slice(0, 5).map((review, i) => (
                    <div key={i} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex text-yellow-400 mb-2">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'fill-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-gray-700 italic mb-3">"{review.comment}"</p>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-xs">
                          {review.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-bold">{review.name}</p>
                          <p className="text-xs text-gray-400">{review.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/reviews" className="block mt-6 text-center">
                  <Button variant="outline" className="w-full hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200">Read All Reviews</Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-20 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white mb-6">
              <Instagram className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{instagramSettings?.handle || storeSettings.instagramHandle}</h2>
            <p className="text-gray-600 mb-10">{storeSettings.trustedBadgeText || 'Join our Instagram community'}</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
            {instagramImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className="aspect-square overflow-hidden rounded-xl cursor-pointer relative group shadow-md hover:shadow-xl transition-all"
              >
                <img className="w-full h-full object-cover" alt={`Instagram post ${index + 1}`} src={img} />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Instagram className="w-8 h-8" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10">
            <a href={instagramSettings?.profileUrl || storeSettings.instagramUrl} target="_blank" rel="noreferrer">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 rounded-full shadow-lg shadow-purple-200">
                Follow on Instagram
              </Button>
            </a>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">Common Questions</h2>
            <div className="space-y-4">
              {faqItems.map((faq, i) => (
                <AccordionItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

const ProductCard = ({ product }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    transition={{ duration: 0.5 }}
    className="group"
  >
    <Link to={`/product/${product.slug}`} className="block h-full">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 mb-4 shadow-sm group-hover:shadow-lg transition-all duration-300">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          alt={product.name}
          src={product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/400'}
        />
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            -{product.discount}%
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center">
          <Button size="sm" className="w-full bg-white/90 text-black hover:bg-white backdrop-blur-sm shadow-lg font-semibold">
            View Details
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900 group-hover:text-yellow-700 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">₹{product.price.toLocaleString()}</span>
              {product.original_price && (
                <span className="text-sm text-gray-400 line-through">₹{product.original_price.toLocaleString()}</span>
              )}
            </div>
          </div>
          <div className="flex items-center text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
            <Star className="w-3 h-3 fill-yellow-600 mr-1" />
            {product.rating}
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-lg">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ArrowRight className="w-5 h-5 text-gray-400 rotate-90" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
          {answer}
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
