import React from 'react';
import { motion } from 'framer-motion';
import { Palette, PenTool, BookOpen, Scissors, Instagram, Mail, ChevronDown } from 'lucide-react';

export default function App() {
  const artworks = [
    { id: 1, title: "Abstract Whispers", img: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=800&auto=format&fit=crop" },
    { id: 2, title: "Ocean's Depth", img: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop" },
    { id: 3, title: "Golden Hour", img: "https://images.unsplash.com/photo-1578301978693-85fa9c026f33?q=80&w=800&auto=format&fit=crop" },
    { id: 4, title: "Urban Soul", img: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=800&auto=format&fit=crop" },
  ];

  const serviceCategories = [
    {
      title: "Fine Art & Portraits",
      icon: <Palette size={32} className="text-art-gold mb-6" />,
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
      icon: <PenTool size={32} className="text-art-gold mb-6" />,
      items: [
        { name: "Calligraphy for Poster", price: "₹500" },
        { name: "Calligraphy in Project Work", price: "₹100" },
      ]
    },
    {
      title: "Academic & Project Work",
      icon: <BookOpen size={32} className="text-art-gold mb-6" />,
      items: [
        { name: "Front Page Design", price: "₹200" },
        { name: "Any Project Poster", price: "₹200" },
        { name: "Pencil/Colour Diagram", price: "₹100" },
        { name: "School/College Register (Per Page)", price: "₹50" },
      ]
    },
    {
      title: "Crafting & Paper Art",
      icon: <Scissors size={32} className="text-art-gold mb-6" />,
      items: [
        { name: "Craft (Cut Paper) Project", price: "₹2,000" },
        { name: "Normal Crafting", price: "₹200" },
      ]
    }
  ];

  return (
    <div className="bg-art-dark text-gray-200 min-h-screen font-sans selection:bg-art-gold selection:text-black">
      {/* Hero Section */}
      <section className="h-screen flex flex-col justify-center items-center relative px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-art-gold tracking-widest uppercase text-sm mb-4 font-semibold">Original Artworks</h2>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6">Namrata's Canvas</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-400 font-light">
            Where every stroke tells a story, and colors breathe life into emotions.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 animate-bounce"
        >
          <ChevronDown size={32} className="text-art-gold opacity-70" />
        </motion.div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl md:text-5xl font-serif text-white">Selected Works</h2>
          <span className="text-art-gold uppercase tracking-widest text-xs hidden md:block">Portfolio 2026</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {artworks.map((art, index) => (
            <motion.div 
              key={art.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-xl cursor-pointer"
            >
              <img 
                src={art.img} 
                alt={art.title} 
                className="w-full h-[400px] md:h-[550px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <h3 className="text-2xl font-serif text-white">{art.title}</h3>
                <p className="text-art-gold mt-1">Acrylic on Canvas</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services & Pricing Section */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif text-white mb-4"
          >
            Services & Pricing
          </motion.h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Commission custom artwork, academic project crafts, and elegant calligraphy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {serviceCategories.map((category, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 p-8 rounded-2xl flex flex-col justify-between"
            >
              <div>
                {category.icon}
                <h3 className="text-2xl font-serif text-white mb-6 border-b border-white/10 pb-4">
                  {category.title}
                </h3>
                <ul className="space-y-4 text-gray-300">
                  {category.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-start text-sm">
                      <span className="pr-2 leading-tight">{item.name}</span>
                      <span className="font-semibold text-art-gold whitespace-nowrap">{item.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center">
        <h2 className="text-2xl font-serif text-white mb-6">Commission a Custom Work</h2>
        <div className="flex justify-center gap-6 mb-8">
          <a href="#" className="hover:text-art-gold transition-colors"><Instagram size={24} /></a>
          <a href="mailto:hello@artbynamrata.com" className="hover:text-art-gold transition-colors"><Mail size={24} /></a>
        </div>
        <p className="text-gray-500 text-sm">© 2026 Art By Namrata. All Rights Reserved.</p>
      </footer>
    </div>
  );
}