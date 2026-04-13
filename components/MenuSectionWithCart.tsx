'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { menuItems as staticItems, menuCategories as staticCategories } from '@/lib/menuData'
import { fetchFoodImage } from '@/lib/pexels'
import { getFullMenu, type ApiCategory, type ApiMenuItem } from '@/lib/api'
import AddToCartButton from './AddToCartButton'

interface Props {
  onNeedOrderType: () => void
}

// Normalised shape used by the render layer
interface DisplayItem {
  id: string
  name: string
  price: string
  priceNumber: number
  description: string
  category: string
  isVeg: boolean
  pexelsQuery?: string
  imageUrl?: string   // from API (Cloudinary) or Pexels fallback
}

interface DisplayCategory {
  id: string
  label: string
  icon: string
}

// Category icon map for API-sourced categories (best-effort)
const ICON_MAP: Record<string, string> = {
  starters: '🍢',
  'fast-food': '🍟',
  'fast food': '🍟',
  breakfast: '🍽️',
  chaat: '🥙',
  'burger-pizza': '🍕',
  'burger & pizza': '🍕',
  'south-indian': '🫓',
  'south indian': '🫓',
  'hot-cold': '☕',
  'hot & cold': '☕',
  beverages: '☕',
  desserts: '🍮',
  sweets: '🍬',
  default: '🍴',
}

function iconFor(name: string): string {
  const key = name.toLowerCase()
  for (const [k, v] of Object.entries(ICON_MAP)) {
    if (key.includes(k)) return v
  }
  return ICON_MAP.default
}

// Convert API data → display shape
function apiToDisplay(cats: ApiCategory[]): { items: DisplayItem[]; categories: DisplayCategory[] } {
  const items: DisplayItem[] = []
  const categories: DisplayCategory[] = []

  cats.forEach(cat => {
    const catId = cat.id
    categories.push({ id: catId, label: cat.name, icon: iconFor(cat.name) })
    cat.items.forEach(item => {
      let price: string
      if (item.variants && item.variants.length > 0) {
        price = item.variants.map(v => `₹${v.price}`).join('/')
      } else {
        price = item.price > 0 ? `₹${item.price}` : 'On MRP'
      }
      items.push({
        id: item.id,
        name: item.name,
        price,
        priceNumber: item.price,
        description: item.description,
        category: catId,
        isVeg: item.is_veg,
        imageUrl: item.image_url ?? undefined,
      })
    })
  })

  return { items, categories }
}

// Convert static data → display shape (fallback)
function staticToDisplay(): { items: DisplayItem[]; categories: DisplayCategory[] } {
  const items: DisplayItem[] = staticItems.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    priceNumber: 0, // will be parsed by AddToCartButton via priceParser
    description: item.description,
    category: item.category,
    isVeg: item.isVeg,
    pexelsQuery: item.pexelsQuery,
    imageUrl: undefined,
  }))
  const categories: DisplayCategory[] = staticCategories.map(c => ({
    id: c.id,
    label: c.label,
    icon: c.icon,
  }))
  return { items, categories }
}

function VegBadge({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 border-2 rounded-sm bg-white"
      style={{ borderColor: isVeg ? '#16a34a' : '#dc2626' }}
    >
      <span
        className="w-2 h-2 rounded-full block"
        style={{ background: isVeg ? '#16a34a' : '#dc2626' }}
      />
    </span>
  )
}

export default function MenuSectionWithCart({ onNeedOrderType }: Props) {
  const [apiData, setApiData] = useState<{ items: DisplayItem[]; categories: DisplayCategory[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [images, setImages] = useState<Record<string, string>>({})
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const cacheRef = useRef<Record<string, string>>({})
  const fetchedRef = useRef<Set<string>>(new Set())

  // Load menu from API on mount
  useEffect(() => {
    getFullMenu().then(cats => {
      if (cats && cats.length > 0) {
        const data = apiToDisplay(cats)
        setApiData(data)
        setActiveCategory(data.categories[0]?.id ?? '')
      } else {
        // fallback to static
        const data = staticToDisplay()
        setApiData(data)
        setActiveCategory(data.categories[0]?.id ?? 'starters')
      }
      setLoading(false)
    })
  }, [])

  const { items: allItems, categories } = apiData ?? { items: [], categories: [] }

  const categoryItems = allItems.filter(item => item.category === activeCategory)
  const categoryCounts: Record<string, number> = {}
  categories.forEach(cat => {
    categoryCounts[cat.id] = allItems.filter(i => i.category === cat.id).length
  })

  // Fetch Pexels images only for items that don't have an API image
  useEffect(() => {
    if (!activeCategory || categoryItems.length === 0) return

    const needsPexels = categoryItems.filter(item => !item.imageUrl && !fetchedRef.current.has(item.id))

    // For items that have API images, put them straight into state
    const withApiImages = categoryItems.filter(item => item.imageUrl)
    if (withApiImages.length > 0) {
      setImages(prev => {
        const next = { ...prev }
        withApiImages.forEach(item => { next[item.id] = item.imageUrl! })
        return next
      })
    }

    if (needsPexels.length === 0) {
      // Maybe everything is cached
      setImages(prev => {
        const next = { ...prev }
        categoryItems.forEach(item => {
          if (cacheRef.current[item.id]) next[item.id] = cacheRef.current[item.id]
        })
        return next
      })
      return
    }

    const ids = new Set(needsPexels.map(i => i.id))
    setLoadingIds(ids)

    const batchSize = 5
    const batches: typeof needsPexels[] = []
    for (let i = 0; i < needsPexels.length; i += batchSize) {
      batches.push(needsPexels.slice(i, i + batchSize))
    }

    let cancelled = false

    async function fetchBatches() {
      for (const batch of batches) {
        if (cancelled) break
        await Promise.all(
          batch.map(async item => {
            if (cacheRef.current[item.id]) {
              setImages(prev => ({ ...prev, [item.id]: cacheRef.current[item.id] }))
              setLoadingIds(prev => { const s = new Set(prev); s.delete(item.id); return s })
              return
            }
            const query = item.pexelsQuery ?? `${item.name} indian restaurant food dish`
            const url = await fetchFoodImage(query)
            if (!cancelled) {
              cacheRef.current[item.id] = url
              fetchedRef.current.add(item.id)
              setImages(prev => ({ ...prev, [item.id]: url }))
              setLoadingIds(prev => { const s = new Set(prev); s.delete(item.id); return s })
            }
          })
        )
        if (!cancelled) await new Promise(r => setTimeout(r, 200))
      }
    }

    fetchBatches()
    return () => { cancelled = true }
  }, [activeCategory, apiData])

  return (
    <section id="menu" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-2" style={{ color: '#E8A020' }}>
            What We Serve
          </p>
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold" style={{ color: '#2C1810' }}>
            Our Menu
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Category tabs */}
            <div className="flex gap-3 overflow-x-auto pb-3 mb-8 scrollbar-hide">
              {categories.map(cat => {
                const isActive = cat.id === activeCategory
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
                      isActive ? 'text-white border-transparent scale-105' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-200'
                    }`}
                    style={isActive ? { backgroundColor: '#C4380A', borderColor: '#C4380A' } : {}}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {categoryCounts[cat.id]}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Items grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {categoryItems.map(item => {
                  const isLoading = loadingIds.has(item.id)
                  const imgUrl = item.imageUrl ?? images[item.id]

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 group"
                    >
                      {/* Image */}
                      <div className="relative h-40 overflow-hidden bg-gray-100">
                        {isLoading || !imgUrl ? (
                          <div className="w-full h-full animate-pulse bg-gradient-to-br from-orange-100 to-amber-50" />
                        ) : imgUrl !== '/placeholder-food.svg' ? (
                          <Image
                            src={imgUrl}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50" />
                        )}
                        {/* Veg/non-veg badge */}
                        <div className="absolute top-2 right-2 z-10">
                          <VegBadge isVeg={item.isVeg} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-sm font-medium leading-snug" style={{ color: '#2C1810' }}>
                            {item.name}
                          </h3>
                          <span className="text-sm font-bold flex-shrink-0" style={{ color: '#C4380A' }}>
                            {item.price}
                          </span>
                        </div>
                        <p
                          className="text-xs text-gray-400 leading-relaxed mb-3"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {item.description}
                        </p>

                        {/* Add to cart */}
                        <div className="flex justify-end">
                          <AddToCartButton
                            item={{ id: item.id, name: item.name, price: item.price, imageUrl: imgUrl }}
                            onNeedOrderType={onNeedOrderType}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  )
}
