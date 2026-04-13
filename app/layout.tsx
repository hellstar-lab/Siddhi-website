import type { Metadata } from "next"
import { Playfair_Display, DM_Sans } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://siddhisweets.in"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Siddhi Sweets — Miranpur | Indian Sweets, Fast Food & More",
    template: "%s | Siddhi Sweets Miranpur",
  },
  description:
    "Siddhi Sweets in Miranpur serves fresh Indian sweets, tandoori starters, chaat, burgers, momos, South Indian, and beverages. Dine-in, takeaway & home delivery.",
  keywords: [
    "Siddhi Sweets",
    "Miranpur restaurant",
    "Indian sweets Miranpur",
    "fast food Miranpur",
    "chaat Miranpur",
    "tandoori Miranpur",
    "momos Miranpur",
    "dosa Miranpur",
    "food delivery Miranpur",
  ],
  authors: [{ name: "Siddhi Sweets" }],
  creator: "Siddhi Sweets",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Siddhi Sweets",
    title: "Siddhi Sweets — Taste That Feels Like Home",
    description:
      "From traditional Indian sweets to sizzling fast food — crafted fresh, served with love in Miranpur. Dine-in, takeaway & delivery available.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Siddhi Sweets Miranpur — Indian food restaurant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Siddhi Sweets — Taste That Feels Like Home",
    description:
      "Fresh Indian sweets, chaat, tandoori & fast food in Miranpur. Order online!",
    images: ["/og-image.svg"],
  },
  alternates: {
    canonical: siteUrl,
  },
}

// JSON-LD LocalBusiness schema for local SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Siddhi Sweets",
  description:
    "Siddhi Sweets serves fresh Indian sweets, tandoori starters, chaat, burgers, momos, South Indian food, and beverages in Miranpur, Uttar Pradesh.",
  url: siteUrl,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Miranpur",
    addressRegion: "Uttar Pradesh",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 29.36,
    longitude: 77.97,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
      ],
      opens: "08:00",
      closes: "22:00",
    },
  ],
  servesCuisine: ["Indian", "Chinese", "Fast Food", "South Indian", "Street Food"],
  priceRange: "₹",
  hasMenu: siteUrl + "/#menu",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans bg-white text-gray-800 antialiased">{children}</body>
    </html>
  )
}
