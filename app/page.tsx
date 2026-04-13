// Server Component — no 'use client'. SpecialOffers and AboutSection are async
// server components that fetch images at render time; they must not be wrapped
// in a client boundary.
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import SpecialOffers from '@/components/SpecialOffers'
import AboutSection from '@/components/AboutSection'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'
import OrderShell from '@/components/OrderShell'

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <SpecialOffers />
      <OrderShell />
      <AboutSection />
      <ContactSection />
      <Footer />
    </>
  )
}
