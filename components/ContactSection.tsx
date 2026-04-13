"use client"

import { useState, useEffect } from "react"
import { MapPin, Phone, Clock } from "lucide-react"
import { getRestaurantInfo, type RestaurantInfo } from "@/lib/api"

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" })
  const [submitted, setSubmitted] = useState(false)
  const [info, setInfo] = useState<RestaurantInfo | null>(null)

  useEffect(() => {
    getRestaurantInfo().then(setInfo)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Prefer the number from the backend; fall back to env var only (no hardcoded dummy)
    const whatsapp = info?.whatsapp_number ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    if (!whatsapp) {
      alert('WhatsApp contact is not configured. Please call us directly.')
      return
    }
    const msg = `Hi Siddhi Sweets! I'd like to reach out.\n\nName: ${form.name}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, '_blank')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
    setForm({ name: "", phone: "", message: "" })
  }

  const phoneDisplay = info?.phone
    ? info.phone.replace(/^91/, '').replace(/(\d{5})(\d{5})/, '$1 $2')
    : null

  const hoursDisplay = info
    ? `Open: ${formatTime(info.opening_time)} – ${formatTime(info.closing_time)}`
    : 'Open Daily: 8:00 AM – 10:00 PM'

  const isOpen = info?.is_open ?? null

  return (
    <section id="contact" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-2" style={{ color: "#E8A020" }}>
            Find Us
          </p>
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold" style={{ color: "#2C1810" }}>
            Visit Us
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Info */}
          <div className="space-y-5">
            <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: "#FFF3E0" }}>
                <MapPin size={20} style={{ color: "#E8A020" }} aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: "#2C1810" }}>Address</p>
                <address className="not-italic text-sm text-gray-500">
                  {info?.address
                    ? info.address
                    : <>Siddhi Sweets, Miranpur<br />Uttar Pradesh, India</>}
                </address>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: "#FFF3E0" }}>
                <Phone size={20} style={{ color: "#E8A020" }} aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: "#2C1810" }}>Phone</p>
                {phoneDisplay ? (
                  <a
                    href={`tel:+91${info!.phone.replace(/^91/, '')}`}
                    className="text-sm text-gray-500 hover:text-orange-600 transition-colors"
                  >
                    +91 {phoneDisplay}
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">Call us for reservations &amp; delivery</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: "#FFF3E0" }}>
                <Clock size={20} style={{ color: "#E8A020" }} aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: "#2C1810" }}>Hours</p>
                <p className="text-sm text-gray-500">
                  <time>{hoursDisplay}</time>
                </p>
                {isOpen !== null && (
                  <span
                    className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: isOpen ? '#dcfce7' : '#fee2e2',
                      color: isOpen ? '#15803d' : '#b91c1c',
                    }}
                  >
                    {isOpen ? 'Open Now' : 'Closed Now'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-72 lg:h-auto">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56174.65551374428!2d77.97!3d29.36!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390c2bcb58c1ae93%3A0x9e3e2b0a6e3b5c7f!2sMiranpur%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "280px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Map showing Siddhi Sweets location in Miranpur, Uttar Pradesh"
            />
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-xl mx-auto">
          <h3 className="font-playfair text-2xl font-semibold text-center mb-6" style={{ color: "#2C1810" }}>
            Send a Message
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium mb-1.5" style={{ color: "#2C1810" }}>
                Your Name
              </label>
              <input
                id="contact-name"
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoComplete="name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400 transition-colors bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="contact-phone" className="block text-sm font-medium mb-1.5" style={{ color: "#2C1810" }}>
                Phone Number
              </label>
              <input
                id="contact-phone"
                type="tel"
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                autoComplete="tel"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400 transition-colors bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium mb-1.5" style={{ color: "#2C1810" }}>
                Message
              </label>
              <textarea
                id="contact-message"
                placeholder="How can we help you?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400 transition-colors bg-gray-50 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ backgroundColor: submitted ? "#5A7A3A" : "#E8A020" }}
            >
              {submitted ? "Message Sent!" : "Send Message via WhatsApp"}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

function formatTime(time: string): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}
