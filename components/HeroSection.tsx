"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

export default function HeroSection() {
  return (
    <section id="home" className="relative w-full h-screen overflow-hidden">
      {/* Video background — poster shown while video loads on slow connections */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/video/hero-optimized.mp4"
        poster="/video/hero-poster.svg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xs sm:text-sm uppercase tracking-[0.25em] text-white/70 mb-4 font-medium"
        >
          Welcome to Siddhi Sweets
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight max-w-4xl"
        >
          Taste That Feels{" "}
          <span style={{ color: "#E8A020" }}>Like Home</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="mt-5 text-sm sm:text-base md:text-lg text-white/80 max-w-xl leading-relaxed"
        >
          From traditional Indian sweets to sizzling fast food — crafted fresh,
          served with love in Miranpur
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 items-center"
        >
          <a
            href="#menu"
            className="px-8 py-3 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 inline-block"
            style={{ backgroundColor: "#E8A020" }}
          >
            Explore Menu
          </a>
          <a
            href="#about"
            className="px-8 py-3 rounded-full text-sm font-semibold text-white border border-white/60 hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95 inline-block"
          >
            Our Story
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce"
        aria-hidden="true"
      >
        <ChevronDown size={28} className="text-white/60" />
      </div>
    </section>
  )
}
