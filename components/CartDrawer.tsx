'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/cartStore'

export default function CartDrawer() {
  const {
    items, isCartOpen, orderType, tableNumber,
    closeCart, openCheckout, removeItem, updateQuantity, updateInstruction,
    getTotalItems, getTotalPrice,
  } = useCartStore()

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  const orderLabel =
    orderType === 'dine-in' ? `Dine-in${tableNumber ? ` · Table ${tableNumber}` : ''}` :
    orderType === 'takeaway' ? 'Takeaway' :
    orderType === 'delivery' ? 'Delivery' : ''

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] md:hidden"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full z-[90] bg-white shadow-2xl flex flex-col"
            style={{ width: 'min(380px, 100vw)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} style={{ color: '#E8A020' }} />
                <h2 className="font-semibold text-base" style={{ color: '#2C1810' }}>Your Order</h2>
                <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ background: '#C4380A' }}>
                  {totalItems}
                </span>
              </div>
              <button onClick={closeCart} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Order type badge */}
            {orderLabel && (
              <div className="px-5 py-2 border-b border-gray-100">
                <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full" style={{ background: '#FFF3E0', color: '#E8A020' }}>
                  {orderLabel}
                </span>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <span className="text-5xl">🥣</span>
                  <p className="text-gray-400 text-sm">Your cart is empty</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-orange-50 flex-shrink-0">
                      {item.imageUrl && item.imageUrl !== '/placeholder-food.svg' ? (
                        <Image src={item.imageUrl} alt={item.name} fill sizes="48px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-medium leading-snug truncate" style={{ color: '#2C1810' }}>{item.name}</p>
                        <button onClick={() => removeItem(item.id)} className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors text-lg leading-none ml-1">×</button>
                      </div>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: '#C4380A' }}>
                        {item.priceNumber > 0 ? `₹${item.priceNumber}` : 'Price at counter'}
                      </p>

                      {/* Qty + instruction row */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 rounded-lg px-1.5 py-0.5" style={{ background: '#C4380A' }}>
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-white font-medium w-5 text-center text-sm bg-transparent border-none cursor-pointer">−</button>
                          <span className="text-white font-semibold text-xs min-w-[14px] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-white font-medium w-5 text-center text-sm bg-transparent border-none cursor-pointer">+</button>
                        </div>
                        {item.priceNumber > 0 && (
                          <span className="text-xs text-gray-400">= ₹{item.priceNumber * item.quantity}</span>
                        )}
                      </div>

                      {/* Instruction */}
                      <textarea
                        placeholder="Special instructions... (optional)"
                        value={item.instruction ?? ''}
                        onChange={e => updateInstruction(item.id, e.target.value)}
                        rows={1}
                        className="w-full mt-2 px-2 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 outline-none resize-none bg-gray-50 focus:border-amber-300 transition-colors"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-5 py-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm font-semibold" style={{ color: '#2C1810' }}>₹{totalPrice}</span>
                </div>
                <button
                  onClick={openCheckout}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{ background: '#E8A020', height: 48 }}
                >
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
