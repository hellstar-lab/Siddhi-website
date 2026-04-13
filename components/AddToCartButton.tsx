'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/lib/cartStore'
import { parsePrice } from '@/lib/priceParser'

interface Props {
  item: {
    id: string
    name: string
    price: string
    imageUrl?: string
  }
  onNeedOrderType: () => void
}

export default function AddToCartButton({ item, onNeedOrderType }: Props) {
  const { items, addItem, updateQuantity, orderType } = useCartStore()
  const [justAdded, setJustAdded] = useState(false)
  const cartItem = items.find(i => i.id === item.id)
  const qty = cartItem?.quantity ?? 0

  const handleAdd = () => {
    if (!orderType) {
      onNeedOrderType()
      return
    }
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      priceNumber: parsePrice(item.price),
      quantity: 1,
      imageUrl: item.imageUrl,
    })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  if (qty > 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg px-2 py-1" style={{ background: '#C4380A' }}>
        <button
          onClick={() => updateQuantity(item.id, qty - 1)}
          className="text-white text-lg font-medium bg-transparent border-none cursor-pointer leading-none w-6 text-center"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="text-white font-semibold min-w-[16px] text-center text-sm">{qty}</span>
        <button
          onClick={() => updateQuantity(item.id, qty + 1)}
          className="text-white text-lg font-medium bg-transparent border-none cursor-pointer leading-none w-6 text-center"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    )
  }

  return (
    <motion.button
      onClick={handleAdd}
      whileTap={{ scale: 0.95 }}
      className="px-4 py-1.5 rounded-lg text-white text-sm font-medium cursor-pointer border-none transition-colors duration-300"
      style={{ background: justAdded ? '#5A7A3A' : '#C4380A' }}
    >
      {justAdded ? 'Added!' : '+ Add'}
    </motion.button>
  )
}
