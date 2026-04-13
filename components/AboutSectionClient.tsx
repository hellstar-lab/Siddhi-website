"use client"

import Image from "next/image"

const stats = [
  { label: "Menu Items", value: "40+" },
  { label: "Dine-in & Delivery", value: "✓" },
  { label: "Fresh Daily", value: "100%" },
]

export default function AboutSectionClient({ imgUrl }: { imgUrl: string }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className="relative rounded-2xl overflow-hidden h-80 lg:h-[420px] shadow-md">
        {imgUrl !== "/placeholder-food.svg" ? (
          <Image
            src={imgUrl}
            alt="Inside Siddhi Sweets restaurant — warm, welcoming ambiance"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
            unoptimized
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: "linear-gradient(135deg, #E8A020 0%, #C4380A 100%)" }}
          />
        )}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: "inset 0 0 0 4px rgba(232,160,32,0.15)" }}
        />
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-3" style={{ color: "#E8A020" }}>
          Who We Are
        </p>
        <h2 className="font-playfair text-3xl sm:text-4xl font-bold mb-6" style={{ color: "#2C1810" }}>
          Our Story
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Siddhi Sweets has been serving the people of Miranpur with heart and dedication. From fresh
          handcrafted sweets made every morning to sizzling tandoori starters and street-style chaat —
          every dish is made with the finest ingredients and traditional recipes.
        </p>
        <p className="text-gray-600 leading-relaxed mb-8">
          We believe great food brings families together. Whether you&apos;re stopping by for a quick
          golgappa or settling in for a full tandoori platter with loved ones — every bite is made
          with care.
        </p>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-orange-50"
            >
              <p className="font-playfair text-2xl font-bold mb-1" style={{ color: "#E8A020" }}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
