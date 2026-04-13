export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#0A0A0A", borderTop: "2px solid #E8A020" }}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <h3 className="font-playfair text-2xl font-bold mb-2" style={{ color: "#E8A020" }}>
              Siddhi Sweets
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Crafted with love, served fresh every day. Your favourite food destination in Miranpur.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "#home" },
                { label: "Menu", href: "#menu" },
                { label: "About", href: "#about" },
                { label: "Contact", href: "#contact" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-amber-400 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Hours</h4>
            <p className="text-sm text-gray-400">Open Daily</p>
            <p className="text-sm font-medium mt-1" style={{ color: "#E8A020" }}>8:00 AM – 10:00 PM</p>
            <p className="text-sm text-gray-400 mt-3">Miranpur, Uttar Pradesh</p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Siddhi Sweets, Miranpur. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
