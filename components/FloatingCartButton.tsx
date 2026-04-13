'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/cartStore'

export default function FloatingCartButton() {
  const { getTotalItems, openCart, isCartOpen } = useCartStore()
  const totalItems = getTotalItems()

  return (
    <AnimatePresence>
      {totalItems > 0 && !isCartOpen && (
        <motion.button
          key="fab"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={openCart}
          className="fixed bottom-6 right-6 z-[70] w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
          style={{ background: '#E8A020' }}
          aria-label="Open cart"
        >
          <ShoppingCart size={22} className="text-white" />
          {/* Badge */}
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: '#C4380A' }}
          >
            {totalItems > 9 ? '9+' : totalItems}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
