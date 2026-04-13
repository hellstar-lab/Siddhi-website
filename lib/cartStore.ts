import { create } from 'zustand'

export type OrderType = 'dine-in' | 'takeaway' | 'delivery' | null

export interface CartItem {
  id: string
  name: string
  price: string
  priceNumber: number
  quantity: number
  instruction?: string
  imageUrl?: string
}

export interface CustomerDetails {
  name: string
  phone: string
  address?: string
  landmark?: string
  pincode?: string
  tableNumber?: string
}

interface CartStore {
  items: CartItem[]
  orderType: OrderType
  tableNumber: string | null
  customerDetails: CustomerDetails | null
  isCartOpen: boolean
  isCheckoutOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  updateInstruction: (id: string, instruction: string) => void
  clearCart: () => void
  setOrderType: (type: OrderType) => void
  setTableNumber: (num: string) => void
  setCustomerDetails: (details: CustomerDetails) => void
  openCart: () => void
  closeCart: () => void
  openCheckout: () => void
  closeCheckout: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  orderType: null,
  tableNumber: null,
  customerDetails: null,
  isCartOpen: false,
  isCheckoutOpen: false,

  addItem: (newItem) => {
    const items = get().items
    const existing = items.find(i => i.id === newItem.id)
    if (existing) {
      set({ items: items.map(i => i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i) })
    } else {
      set({ items: [...items, { ...newItem, quantity: 1 }] })
    }
  },

  removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),

  updateQuantity: (id, qty) => {
    if (qty <= 0) {
      get().removeItem(id)
      return
    }
    set({ items: get().items.map(i => i.id === id ? { ...i, quantity: qty } : i) })
  },

  updateInstruction: (id, instruction) =>
    set({ items: get().items.map(i => i.id === id ? { ...i, instruction } : i) }),

  clearCart: () => set({ items: [], orderType: null, tableNumber: null, customerDetails: null }),

  setOrderType: (type) => set({ orderType: type }),
  setTableNumber: (num) => set({ tableNumber: num }),
  setCustomerDetails: (details) => set({ customerDetails: details }),

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  openCheckout: () => set({ isCheckoutOpen: true, isCartOpen: false }),
  closeCheckout: () => set({ isCheckoutOpen: false }),

  getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  getTotalPrice: () => get().items.reduce((sum, i) => sum + i.priceNumber * i.quantity, 0),
}))
