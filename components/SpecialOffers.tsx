// Server Component — fetches images at request time, no client JS for data
import { fetchFoodImageServer } from "@/lib/pexelsServer"
import SpecialOffersCards from "./SpecialOffersCards"

const specials = [
  {
    id: "s1",
    name: "Tandoori Platter",
    price: "₹280",
    description: "Perfect for sharing — 7 premium tandoori items served hot off the clay oven",
    query: "tandoori platter indian appetizer",
    tag: "Best Seller",
  },
  {
    id: "s2",
    name: "Raj Kachori",
    price: "₹60",
    description: "Loaded chaat experience — our house specialty with chole, curd & chutneys",
    query: "raj kachori indian chaat",
    tag: "House Special",
  },
  {
    id: "s3",
    name: "Masala Dosa Combo",
    price: "₹70",
    description: "Crispy dosa + sambar + coconut chutney — authentic South Indian classic",
    query: "masala dosa south indian",
    tag: "Today's Pick",
  },
]

export default async function SpecialOffers() {
  const items = await Promise.all(
    specials.map(async (s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      description: s.description,
      tag: s.tag,
      imageUrl: await fetchFoodImageServer(s.query),
    }))
  )

  return (
    <section className="py-20 px-4" style={{ backgroundColor: "#FAF8F5" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-2" style={{ color: "#E8A020" }}>
            Limited Time
          </p>
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold" style={{ color: "#2C1810" }}>
            Today&apos;s Specials
          </h2>
        </div>
        <SpecialOffersCards items={items} />
      </div>
    </section>
  )
}
