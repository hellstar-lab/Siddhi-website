'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/lib/cartStore'
import { getTableFromURL } from '@/lib/qrHelper'
import { validateTable } from '@/lib/api'

export default function DineInAutoDetect() {
  const { setOrderType, setTableNumber, orderType } = useCartStore()
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const table = getTableFromURL()
    if (!table || orderType) return

    // Validate the table number against the backend
    validateTable(Number(table)).then(result => {
      if (result && result.valid) {
        setOrderType('dine-in')
        setTableNumber(String(result.table_number))
        setToast(`Ordering for Table ${result.table_number} — Dine-in`)
      } else {
        // Table not found in backend — still allow with the QR value
        setOrderType('dine-in')
        setTableNumber(table)
        setToast(`Ordering for Table ${table} — Dine-in`)
      }
      setTimeout(() => setToast(null), 4000)
    })
  // orderType intentionally omitted: we only want this to run once on mount.
  // setOrderType and setTableNumber are stable Zustand references.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[110] px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-xl flex items-center gap-2"
          style={{ background: '#2C1810' }}
        >
          <span>🪑</span>
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
