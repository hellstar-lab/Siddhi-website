'use client'

import { useState } from 'react'
import MenuSectionWithCart from '@/components/MenuSectionWithCart'
import OrderTypeModal from '@/components/OrderTypeModal'
import CartDrawer from '@/components/CartDrawer'
import CheckoutModal from '@/components/CheckoutModal'
import FloatingCartButton from '@/components/FloatingCartButton'
import DineInAutoDetect from '@/components/DineInAutoDetect'

/**
 * Client boundary for everything that needs useState / Zustand.
 * Lives inside the server-rendered page so SpecialOffers and AboutSection
 * can stay as async Server Components.
 */
export default function OrderShell() {
  const [showOrderTypeModal, setShowOrderTypeModal] = useState(false)

  return (
    <>
      <MenuSectionWithCart onNeedOrderType={() => setShowOrderTypeModal(true)} />

      <DineInAutoDetect />
      <OrderTypeModal
        isOpen={showOrderTypeModal}
        onClose={() => setShowOrderTypeModal(false)}
      />
      <CartDrawer />
      <CheckoutModal />
      <FloatingCartButton />
    </>
  )
}
