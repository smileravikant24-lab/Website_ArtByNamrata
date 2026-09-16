import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Palette, PenTool, BookOpen, Scissors, Menu, X, ArrowLeft, ArrowRight, Send, MapPin, Heart, Sparkles, Brush, Quote } from 'lucide-react';
import './App.css';
import { sectionImages } from './data/imageConfig';
import { loadDriveCategoriesAndImages } from './data/driveFolders';
import { siteConfig } from './data/siteConfig';
import { trackSiteVisit } from './utils/analytics';

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [failedImages, setFailedImages] = useState({});
  const [categories, setCategories] = useState(sectionImages.gallery);
  const [activeImage, setActiveImage] = useState(null);
  const [activePage, setActivePage] = useState(window.location.hash.slice(1) || 'home');
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState('');
  const [likesMap, setLikesMap] = useState({});
  const [likedSet, setLikedSet] = useState(() => {
    try {
      const saved = localStorage.getItem('an_liked_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleLike = useCallback((art, event) => {
    if (event) event.stopPropagation();
    const isAlreadyLiked = likedSet.has(art.id);
    const nextSet = new Set(likedSet);

    let diff = 1;
    if (isAlreadyLiked) {
      nextSet.delete(art.id);
      diff = -1;
    } else {
      nextSet.add(art.id);
    }

    setLikedSet(nextSet);
    try {
      localStorage.setItem('an_liked_ids', JSON.stringify(Array.from(nextSet)));
    } catch {}

    setLikesMap((prev) => ({
      ...prev,
      [art.id]: Math.max(0, (prev[art.id] || 0) + diff),
    }));

    if (!isAlreadyLiked && siteConfig.contactSheetEndpoint) {
      fetch(siteConfig.contactSheetEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          type: 'like',
          action: 'like',
          imageId: art.id,
          title: art.title,
        }),
      }).catch(() => {});
    }
  }, [likedSet]);

  useEffect(() => {
    if (!siteConfig.contactSheetEndpoint) return;
    fetch(siteConfig.contactSheetEndpoint)
      .then((res) => res.json())
      .then((data) => {
        if (data?.likes) {
          setLikesMap(data.likes);
        }
      })
      .catch(() => {});
  }, []);

  const changeImage = useCallback((direction) => {
    if (!activeImage) return;
    const category = categories.find((item) => item.id === activeImage.categoryId);
    if (!category) return;
    const nextIndex = (activeImage.index + direction + category.images.length) % category.images.length;
    setActiveImage({ categoryId: category.id, index: nextIndex });
  }, [activeImage, categories]);

  useEffect(() => {
    document.title = `${siteConfig.brandName} | Original Artworks & Commissions`;
    document.querySelector('link[rel="icon"]')?.setAttribute('href', siteConfig.logoUrl);
  }, []);

  useEffect(() => {
    trackSiteVisit(siteConfig.contactSheetEndpoint, activePage);
  }, [activePage]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      setActivePage(window.location.hash.slice(1) || 'home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const syncDriveImages = async () => {
      try {
        const nextCategories = await loadDriveCategoriesAndImages(sectionImages.gallery);
        if (!cancelled && nextCategories.length > 0) setCategories(nextCategories);
      } catch (err) {
        console.error('Drive auto-sync error:', err);
      }
    };

    syncDriveImages();
    const refreshTimer = window.setInterval(syncDriveImages, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(refreshTimer);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!activeImage) return;
      if (event.key === 'Escape') setActiveImage(null);
      if (event.key === 'ArrowLeft') changeImage(-1);
      if (event.key === 'ArrowRight') changeImage(1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeImage, changeImage]);

  const serviceCategories = [
    {
      title: "Fine Art & Portraits",
      icon: <Palette size={28} />,
      items: [
        { name: "Watercolor Paintings", price: "₹2,000" },
        { name: "Oil Pastel Colour Drawing", price: "₹1,500" },
        { name: "Sketch of People", price: "₹1,500" },
        { name: "Pencil Sketch Drawing", price: "₹1,000" },
        { name: "Cartoon Drawing of Image", price: "₹500" },
      ]
    },
    {
      title: "Calligraphy & Lettering",
      icon: <PenTool size={28} />,
      items: [
        { name: "Calligraphy for Poster", price: "₹500" },
        { name: "Calligraphy in Project Work", price: "₹100" },
      ]
    },
    {
      title: "Academic & Project Work",
      icon: <BookOpen size={28} />,
      items: [
        { name: "Front Page Design", price: "₹200" },
        { name: "Any Project Poster", price: "₹200" },
        { name: "Pencil/Colour Diagram", price: "₹100" },
        { name: "School/College Register (Per Page)", price: "₹50" },
      ]
    },
    {
      title: "Crafting & Paper Art",
      icon: <Scissors size={28} />,
      items: [
        { name: "Craft (Cut Paper) Project", price: "₹2,000" },
        { name: "Normal Crafting", price: "₹200" },
      ]
    }
  ];

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Gallery", href: "#gallery" },
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" },
  ];

  const scrollTo = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    window.location.hash = href.slice(1);
  };

  const submitContact = async (event) => {
    event.preventDefault();
    if (!siteConfig.contactSheetEndpoint) {
      setContactStatus('Form is temporarily unavailable.');
      return;
    }

    if (!/^\d{10}$/.test(contactPhone)) {
      setContactStatus('Please enter a valid 10-digit mobile number.');
      return;
    }

    setContactStatus('Sending...');
    try {
      await fetch(siteConfig.contactSheetEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          type: 'message',
          name: contactName.trim(),
          phone: contactPhone,
          message: contactMessage.trim(),
          page: window.location.href,
          submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        }),
      });
      setContactName('');
      setContactPhone('');
      setContactMessage('');
      setContactStatus('Thanks, your message has been submitted.');
    } catch {
      setContactStatus('Something went wrong. Please try again.');
    }
  };

  const totalWorks = categories.reduce((total, category) => total + category.images.length, 0);

  return (
    <div className="site-shell text-gray-200 min-h-screen font-sans selection:bg-art-gold selection:text-black">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'nav-scrolled py-3' : 'py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <a href="#home" onClick={(e) => scrollTo(e, '#home')}>
            <img
              src={siteConfig.logoUrl}
              alt={siteConfig.brandName}
              className="brand-logo h-12 w-12 md:h-14 md:w-14"
            />
          </a>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                className="text-sm tracking-widest uppercase text-gray-300 hover:text-art-gold transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          <button
            className="md:hidden text-gray-300 hover:text-art-gold transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-art-dark/98 backdrop-blur-lg border-t border-white/10 px-6 py-6"
          >
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                className="block py-3 text-sm tracking-widest uppercase text-gray-300 hover:text-art-gold transition-colors"
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </nav>

      {/* Home Page */}
      {activePage === 'home' && <section className="home-hero min-h-screen flex flex-col justify-center items-center relative px-6 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="home-hero-content max-w-3xl"
        >
          <div className="hero-logo-frame mx-auto mb-10">
            <img
              src={siteConfig.logoUrl}
              alt={siteConfig.brandName}
              className="brand-logo-hero"
            />
          </div>
          <p className="text-lg md:text-xl text-gray-400 font-light leading-relaxed max-w-xl mx-auto">
            Where every stroke tells a story, and colors breathe life into emotions.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="#about"
              onClick={(e) => scrollTo(e, '#about')}
              className="px-8 py-3 bg-art-gold text-art-dark font-semibold text-sm tracking-widest uppercase rounded-full hover:bg-art-gold-light transition-colors duration-300"
            >
              About Artist
            </a>
            <a
              href="#gallery"
              onClick={(e) => scrollTo(e, '#gallery')}
              className="px-8 py-3 border border-art-gold/50 text-art-gold font-semibold text-sm tracking-widest uppercase rounded-full hover:bg-art-gold/10 transition-colors duration-300"
            >
              View Gallery
            </a>
            <a
              href="#services"
              onClick={(e) => scrollTo(e, '#services')}
              className="px-8 py-3 border border-white/20 text-gray-300 font-semibold text-sm tracking-widest uppercase rounded-full hover:bg-white/10 transition-colors duration-300"
            >
              Services & Pricing
            </a>
          </div>
        </motion.div>

      </section>}

      {/* About Us Page */}
      {activePage === 'about' && (
        <section id="about" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-art-gold uppercase tracking-[0.3em] text-xs font-semibold">
                About Namrata
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-white mt-2 mb-3">
                Welcome to My World of Art
              </h1>
              <p className="text-art-gold/90 text-sm md:text-base font-serif italic tracking-wide mb-4">
                By Namrata • Fine Artist & Creator
              </p>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-art-gold to-transparent mx-auto"></div>
            </motion.div>
          </div>

          {/* Hero Story Block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
            {/* Left: Artist Image with Floating Badges */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 flex justify-center"
            >
              <div className="relative w-full max-w-lg group">
                {/* Ambient glow */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-art-gold/30 via-art-gold/10 to-transparent rounded-3xl blur-xl opacity-70 transition-opacity duration-700 group-hover:opacity-100"></div>

                {/* Photo frame aligned for 16:9 photo */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-art-gold/40 shadow-2xl bg-art-dark-card aspect-[16/10] sm:aspect-[16/9] w-full">
                  <img
                    src={siteConfig.artistImageUrl}
                    alt="Namrata - Artist"
                    className="w-full h-full object-cover object-[85%_20%] transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-art-gold/50 text-art-gold text-xs tracking-wider uppercase font-semibold">
                      <Sparkles size={13} /> Namrata • Artist
                    </span>
                    <p className="text-xs text-gray-300 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 font-light">
                      <MapPin size={13} className="text-art-gold" /> North East Delhi, India
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Narrative Story */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-7 space-y-6 text-gray-300 font-light leading-relaxed"
            >
              {/* Highlight Quote */}
              <div className="relative pl-6 border-l-2 border-art-gold/80 py-1">
                <Quote size={28} className="text-art-gold/20 absolute -top-3 left-2 -z-10" />
                <p className="text-lg md:text-xl text-white font-serif italic leading-relaxed">
                  "Art is not just about filling a canvas with colors; it is a medium to give voice to emotions, thoughts, and stories."
                </p>
                <p className="mt-3 text-sm md:text-base text-gray-300">
                  Hailing from North East Delhi, the vibrant culture and surroundings deeply inspire my creative expression. I am <strong className="text-white font-medium">Namrata</strong>, an artist dedicated to crafting strokes that resonate straight from the heart.
                </p>
              </div>

              {/* My Artistic Journey */}
              <div className="bg-art-dark-card/70 border border-white/[0.08] rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-lg">
                <h2 className="text-xl md:text-2xl font-serif text-white mb-3 flex items-center gap-2.5">
                  <Palette size={22} className="text-art-gold" /> My Artistic Journey
                </h2>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  Ever since childhood, I, <span className="text-art-gold font-medium">Namrata</span>, have felt a deep connection with colors and forms, watching that passion naturally evolve into my identity. Every painting is a journey for me—a quiet space brought to life on canvas. My work reflects the beauty of nature, the depth of human emotions, and the myriad shades of everyday life.
                </p>
              </div>
            </motion.div>
          </div>

          {/* What Inspires Me */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-art-gold uppercase tracking-[0.25em] text-xs font-semibold">Creative Pulse</span>
              <h2 className="text-2xl md:text-4xl font-serif text-white mt-1">What Inspires Me?</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Local Roots */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-art-dark-card border border-white/[0.08] rounded-2xl p-7 hover:border-art-gold/40 transition-all duration-300 group flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-art-gold/10 text-art-gold flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <MapPin size={24} />
                </div>
                <h3 className="text-lg font-serif text-white mb-2">Local Roots</h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">
                  The environment, energy, and surroundings of North East Delhi subtly weave into the essence of my artwork.
                </p>
              </motion.div>

              {/* Card 2: Emotions & Expressions */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-art-dark-card border border-white/[0.08] rounded-2xl p-7 hover:border-art-gold/40 transition-all duration-300 group flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-art-gold/10 text-art-gold flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Heart size={24} />
                </div>
                <h3 className="text-lg font-serif text-white mb-2">Emotions & Expressions</h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">
                  Human connections, raw feelings, and the serene elements of nature serve as my greatest inspirations.
                </p>
              </motion.div>

              {/* Card 3: Textures & Tones */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-art-dark-card border border-white/[0.08] rounded-2xl p-7 hover:border-art-gold/40 transition-all duration-300 group flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-art-gold/10 text-art-gold flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Brush size={24} />
                </div>
                <h3 className="text-lg font-serif text-white mb-2">Textures & Tones</h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">
                  I love experimenting with various mediums, playing with acrylics, oils, and watercolors to bring depth and vitality to each piece.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Vision & Mission Banner */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#16202c] via-art-dark-card to-[#0d1219] border border-art-gold/35 p-8 md:p-12 text-center mb-12 shadow-2xl"
          >
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-art-gold/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="text-art-gold uppercase tracking-[0.3em] text-xs font-semibold block mb-3">
                Vision & Mission
              </span>
              <h2 className="text-2xl md:text-3xl font-serif text-white mb-4">
                Bringing Art Into Every Home & Heart
              </h2>
              <p className="text-gray-300 text-base md:text-lg font-light leading-relaxed mb-6">
                "My goal is not merely to display art, but to build a meaningful emotional connection with anyone who views it. Bringing the beauty of art into every home and heart is my ultimate dream."
              </p>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Thank you for visiting my website and appreciating my journey. If you would like to connect for custom commissions or inquiries, please feel free to reach out!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="#gallery"
                  onClick={(e) => scrollTo(e, '#gallery')}
                  className="px-8 py-3 bg-art-gold text-art-dark font-semibold text-sm tracking-widest uppercase rounded-full hover:bg-art-gold-light transition-colors duration-300"
                >
                  View Gallery
                </a>
                <a
                  href="#contact"
                  onClick={(e) => scrollTo(e, '#contact')}
                  className="px-8 py-3 border border-art-gold/60 text-art-gold font-semibold text-sm tracking-widest uppercase rounded-full hover:bg-art-gold/10 transition-colors duration-300"
                >
                  Commission Custom Work
                </a>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Gallery Section */}
      {activePage === 'gallery' && <section id="gallery" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-14">
          <div>
            <span className="text-art-gold uppercase tracking-[0.3em] text-xs font-semibold">Portfolio</span>
            <h2 className="text-3xl md:text-5xl font-serif text-white mt-2">Works by Category</h2>
          </div>
          <span className="text-gray-500 uppercase tracking-widest text-xs hidden md:block">2026</span>
        </div>

        <div className="gallery-filters" role="tablist" aria-label="Filter gallery by category">
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            className={selectedCategory === 'all' ? 'gallery-filter active' : 'gallery-filter'}
            onClick={() => setSelectedCategory('all')}
          >
            All works ({totalWorks})
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={selectedCategory === category.id}
              className={selectedCategory === category.id ? 'gallery-filter active' : 'gallery-filter'}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.title}
            </button>
          ))}
        </div>

        <div className="space-y-20">
          {categories.filter((category) => selectedCategory === 'all' || category.id === selectedCategory).map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.08 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-serif text-white">{category.title}</h3>
                  <p className="text-gray-500 mt-2">{category.description}</p>
                </div>
                <span className="category-count">{category.images.length} works</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {category.images.map((art) => (
                  <button
                    key={art.id}
                    type="button"
                    className="gallery-tile group relative overflow-hidden rounded-2xl bg-art-dark-card aspect-[4/5] text-left"
                    onClick={() => setActiveImage({ categoryId: category.id, index: category.images.indexOf(art) })}
                    aria-label={`Open ${art.title}`}
                  >
                    {/* Like Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        type="button"
                        onClick={(e) => toggleLike(art, e)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md transition-all duration-300 ${
                          likedSet.has(art.id)
                            ? 'bg-red-500/25 text-red-400 border border-red-500/60 shadow-lg shadow-red-500/20'
                            : 'bg-black/60 text-gray-300 border border-white/15 hover:border-art-gold/50 hover:text-white'
                        }`}
                        aria-label={`Like ${art.title}`}
                      >
                        <Heart
                          size={14}
                          className={`transition-transform duration-300 ${
                            likedSet.has(art.id) ? 'fill-red-500 text-red-500 scale-110' : ''
                          }`}
                        />
                        <span className="text-xs font-semibold">{likesMap[art.id] || 0}</span>
                      </button>
                    </div>

                    {failedImages[art.id] ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-art-dark-card to-black p-4 text-center">
                        <Palette size={28} className="text-art-gold/40" />
                        <span className="text-sm text-gray-500">Image unavailable</span>
                      </div>
                    ) : (
                      <img
                        src={art.img}
                        alt={art.title}
                        onError={() => setFailedImages((prev) => ({ ...prev, [art.id]: true }))}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                      <span className="text-sm text-white">{art.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>}

      {activeImage && (() => {
        const category = categories.find((item) => item.id === activeImage.categoryId);
        const art = category?.images[activeImage.index];
        if (!category || !art) return null;
        return (
          <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${category.title} preview`} onClick={() => setActiveImage(null)}>
            <button type="button" className="lightbox-close" onClick={() => setActiveImage(null)} aria-label="Close image preview"><X size={24} /></button>
            <button type="button" className="lightbox-arrow lightbox-arrow-left" onClick={(event) => { event.stopPropagation(); changeImage(-1); }} aria-label="Previous image"><ArrowLeft size={24} /></button>
            <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
              <img src={art.img} alt={art.title} />
              <div className="lightbox-panel">
                <div className="lightbox-caption"><span>{category.title}</span><strong>{art.title}</strong></div>
                <button
                  type="button"
                  onClick={(e) => toggleLike(art, e)}
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                    likedSet.has(art.id)
                      ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-md shadow-red-500/10'
                      : 'bg-white/5 text-gray-300 border-white/15 hover:border-art-gold/40 hover:text-white'
                  }`}
                >
                  <Heart
                    size={16}
                    className={likedSet.has(art.id) ? 'fill-red-500 text-red-500 scale-110' : ''}
                  />
                  <span>{likedSet.has(art.id) ? 'Liked' : 'Like Artwork'} ({likesMap[art.id] || 0})</span>
                </button>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write your message..."
                  aria-label="Artwork enquiry message"
                  rows="3"
                />
                <a
                  className="inquiry-instagram"
                  href={siteConfig.instagramMessageUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    const fullMessage = `Hi! I'm interested in "${art.title}" from the ${category.title} collection.\nArtwork link: ${art.img}\n\n${message}`;
                    navigator.clipboard.writeText(fullMessage);
                    alert("Message & artwork link copied! Just paste it in the Instagram chat.");
                  }}
                >
                  Message on Instagram
                </a>
              </div>
            </div>
            <button type="button" className="lightbox-arrow lightbox-arrow-right" onClick={(event) => { event.stopPropagation(); changeImage(1); }} aria-label="Next image"><ArrowRight size={24} /></button>
          </div>
        );
      })()}

      {/* Services & Pricing Section */}
      {activePage === 'services' && <section id="services" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-art-gold uppercase tracking-[0.3em] text-xs font-semibold">What I Offer</span>
            <h2 className="text-3xl md:text-5xl font-serif text-white mt-2 mb-4">Services & Pricing</h2>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Commission custom artwork, academic project crafts, and elegant calligraphy.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="service-card bg-art-dark-card border border-white/[0.06] p-7 rounded-2xl flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-art-gold/10 flex items-center justify-center text-art-gold mb-5">
                {category.icon}
              </div>
              <h3 className="text-xl font-serif text-white mb-5 pb-4 border-b border-white/[0.08]">
                {category.title}
              </h3>
              <ul className="space-y-3 flex-1">
                {category.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-start text-sm gap-3">
                    <span className="text-gray-400 leading-tight">{item.name}</span>
                    <span className="font-semibold text-art-gold whitespace-nowrap">{item.price}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>}

      {/* Contact / Footer */}
      {activePage === 'contact' && <footer id="contact" className="py-16 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <img
            src={siteConfig.logoUrl}
            alt={siteConfig.brandName}
            className="brand-logo w-40 h-40 mx-auto mb-6 opacity-80"
          />
          <h2 className="text-2xl md:text-3xl font-serif text-white mb-3">Commission a Custom Work</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Have a project in mind? Let's bring your vision to life.
          </p>
          <form className="contact-form" onSubmit={submitContact}>
            <input
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              placeholder="Your name"
              aria-label="Your name"
            />
            <input
              type="tel"
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile number"
              aria-label="10-digit mobile number"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength="10"
              required
            />
            <textarea
              value={contactMessage}
              onChange={(event) => setContactMessage(event.target.value)}
              placeholder="Write your message or project details..."
              aria-label="Your message"
              rows="4"
            />
            <button type="submit" className="inquiry-button"><Send size={17} /> Submit message</button>
            {contactStatus && <p className="contact-status" role="status">{contactStatus}</p>}
          </form>
          <div className="flex justify-center gap-5 mb-10">
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-art-gold hover:border-art-gold/40 transition-all duration-300"
              aria-label="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a
              href={siteConfig.instagramMessageUrl}
              target="_blank"
              rel="noreferrer"
              className="contact-instagram-link"
            >
              Message on Instagram
            </a>
          </div>
          <p className="text-gray-600 text-xs tracking-wider uppercase">
            &copy; 2026 Art by Namrata. All Rights Reserved.
          </p>
        </div>
      </footer>}
    </div>
  );
}
