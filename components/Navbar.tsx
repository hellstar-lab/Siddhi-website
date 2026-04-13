"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { getRestaurantInfo } from "@/lib/api"

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Menu", href: "#menu" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isOpen, setIsOpen] = useState<boolean | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    getRestaurantInfo().then(info => {
      if (info !== null) setIsOpen(info.is_open)
    })
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-md" : "border-b border-gray-100"
      }`}
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a
          href="#home"
          className="flex items-center gap-2 font-playfair text-xl sm:text-2xl font-bold tracking-tight"
          style={{ color: "#C4380A" }}
          aria-label="Siddhi Sweets — go to top"
        >
          Siddhi <span style={{ color: "#E8A020" }}>Sweets</span>
          {isOpen !== null && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none"
              style={{
                background: isOpen ? '#dcfce7' : '#fee2e2',
                color: isOpen ? '#15803d' : '#b91c1c',
                fontFamily: 'sans-serif',
              }}
            >
              {isOpen ? 'Open' : 'Closed'}
            </span>
          )}
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-[#C4380A] transition-colors duration-200 tracking-wide"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer — visibility:hidden removes it from tab order and a11y tree when closed */}
      <div
        id="mobile-nav"
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        } bg-white border-t border-gray-100`}
        style={mobileOpen ? undefined : { visibility: "hidden" }}
        aria-hidden={!mobileOpen}
      >
        <ul className="flex flex-col px-4 py-3 gap-1" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2 px-3 text-sm font-medium text-gray-700 hover:text-[#C4380A] hover:bg-orange-50 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
