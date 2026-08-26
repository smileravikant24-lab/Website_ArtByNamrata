import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, PenTool, BookOpen, Scissors, Mail, ChevronDown, Menu, X } from 'lucide-react';
import './App.css';
import logoImg from './assets/logo.png';

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const artworks = [
    { id: 1, title: "Abstract Whispers", medium: "Watercolor on Paper", img: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=800&auto=format&fit=crop" },
    { id: 2, title: "Ocean's Depth", medium: "Acrylic on Canvas", img: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop" },
    { id: 3, title: "Golden Hour", medium: "Oil Pastel", img: "https://images.unsplash.com/photo-1578301978693-85fa9c026f33?q=80&w=800&auto=format&fit=crop" },
    { id: 4, title: "Urban Soul", medium: "Pencil Sketch", img: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=800&auto=format&fit=crop" },
  ];

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
    { label: "Gallery", href: "#gallery" },
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" },
  ];

  const scrollTo = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-art-dark text-gray-200 min-h-screen font-sans selection:bg-art-gold selection:text-black">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'nav-scrolled py-3' : 'py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <img
              src={logoImg}
              alt="Art By Namrata"
              className="h-12 md:h-14 w-auto object-contain"
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

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center relative px-6 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-3xl"
        >
          <img
            src={logoImg}
            alt="Art By Namrata"
            className="w-64 md:w-80 mx-auto mb-10 drop-shadow-2xl"
          />
          <p className="text-lg md:text-xl text-gray-400 font-light leading-relaxed max-w-xl mx-auto">
            Where every stroke tells a story, and colors breathe life into emotions.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="#gallery"
              onClick={(e) => scrollTo(e, '#gallery')}
              className="px-8 py-3 bg-art-gold text-art-dark font-semibold text-sm tracking-widest uppercase rounded-full hover:bg-art-gold-light transition-colors duration-300"
            >
              View Gallery
            </a>
            <a
              href="#services"
              onClick={(e) => scrollTo(e, '#services')}
              className="px-8 py-3 border border-art-gold/50 text-art-gold font-semibold text-sm tracking-widest uppercase rounded-full hover:bg-art-gold/10 transition-colors duration-300"
            >
              Services & Pricing
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 animate-bounce"
        >
          <ChevronDown size={28} className="text-art-gold/60" />
        </motion.div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-14">
          <div>
            <span className="text-art-gold uppercase tracking-[0.3em] text-xs font-semibold">Portfolio</span>
            <h2 className="text-3xl md:text-5xl font-serif text-white mt-2">Selected Works</h2>
          </div>
          <span className="text-gray-500 uppercase tracking-widest text-xs hidden md:block">2026</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {artworks.map((art, index) => (
            <motion.div
              key={art.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl cursor-pointer bg-art-dark-card"
            >
              <img
                src={art.img}
                alt={art.title}
                className="w-full h-[350px] md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <h3 className="text-2xl font-serif text-white">{art.title}</h3>
                <p className="text-art-gold text-sm mt-1 tracking-wide">{art.medium}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services & Pricing Section */}
      <section id="services" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
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
      </section>

      {/* Contact / Footer */}
      <footer id="contact" className="py-16 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <img
            src={logoImg}
            alt="Art By Namrata"
            className="w-40 mx-auto mb-6 opacity-80"
          />
          <h2 className="text-2xl md:text-3xl font-serif text-white mb-3">Commission a Custom Work</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Have a project in mind? Let's bring your vision to life.
          </p>
          <div className="flex justify-center gap-5 mb-10">
            <a
              href="#"
              className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-art-gold hover:border-art-gold/40 transition-all duration-300"
              aria-label="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a
              href="mailto:hello@artbynamrata.com"
              className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-art-gold hover:border-art-gold/40 transition-all duration-300"
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
          </div>
          <p className="text-gray-600 text-xs tracking-wider uppercase">
            &copy; 2026 Art By Namrata. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
