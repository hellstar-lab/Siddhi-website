"use client"

import Image from "next/image"

export interface SpecialItem {
  id: string
  name: string
  price: string
  description: string
  tag: string
  imageUrl: string
}

export default function SpecialOffersCards({ items }: { items: SpecialItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group"
        >
          <div className="relative h-48 overflow-hidden bg-gray-100">
            {item.imageUrl !== "/placeholder-food.svg" ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ background: "linear-gradient(135deg, #E8A020 0%, #C4380A 100%)" }}
              />
            )}
            <span
              className="absolute top-3 left-3 z-10 text-white text-xs font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: "#C4380A" }}
            >
              {item.tag}
            </span>
            <span
              className="absolute top-3 right-3 z-10 text-white text-sm font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: "#E8A020" }}
            >
              {item.price}
            </span>
          </div>

          <div className="p-5">
            <h3 className="font-playfair text-lg font-semibold mb-2" style={{ color: "#2C1810" }}>
              {item.name}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">{item.description}</p>
            <a
              href="#menu"
              className="block w-full py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-opacity duration-200 hover:opacity-90"
              style={{ backgroundColor: "#E8A020" }}
            >
              Order Now
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
