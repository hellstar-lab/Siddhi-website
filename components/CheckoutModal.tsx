'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Clock, ChefHat, ShoppingBag } from 'lucide-react'
import { useCartStore, type OrderType, type CartItem } from '@/lib/cartStore'
import { placeOrder, validateCoupon, trackOrder, validateTable, type PlacedOrder, type OrderTrack } from '@/lib/api'

type PaymentMethod = 'cod' | 'online' | null
type Step = 'details' | 'payment' | 'summary' | 'placing' | 'tracking'

// Ordered checkout steps — used for step indicator and indexOf comparisons
const CHECKOUT_STEPS: Step[] = ['details', 'payment', 'summary']

// Order status → human label + icon + colour
const STATUS_INFO: Record<string, { label: string; sub: string; icon: React.ReactNode; color: string }> = {
  requested: {
    label: 'Order Received',
    sub: 'Waiting for restaurant to confirm your order…',
    icon: <Clock size={56} />,
    color: '#E8A020',
  },
  payment_pending: {
    label: 'Confirm & Pay',
    sub: 'Restaurant has approved your order. Please pay to confirm.',
    icon: <ShoppingBag size={56} />,
    color: '#E8A020',
  },
  confirmed: {
    label: 'Order Confirmed!',
    sub: 'Your order is confirmed and heading to the kitchen.',
    icon: <CheckCircle size={56} />,
    color: '#5A7A3A',
  },
  in_kitchen: {
    label: 'Being Prepared',
    sub: 'Our chefs are cooking your food right now!',
    icon: <ChefHat size={56} />,
    color: '#C4380A',
  },
  ready: {
    label: 'Ready!',
    sub: 'Your order is ready for pickup / serving.',
    icon: <CheckCircle size={56} />,
    color: '#5A7A3A',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    sub: 'Your order is on the way!',
    icon: <CheckCircle size={56} />,
    color: '#5A7A3A',
  },
  delivered: {
    label: 'Delivered!',
    sub: 'Enjoy your meal. Thank you for ordering!',
    icon: <CheckCircle size={56} />,
    color: '#5A7A3A',
  },
  cancelled: {
    label: 'Order Cancelled',
    sub: 'This order was cancelled.',
    icon: <X size={56} />,
    color: '#C4380A',
  },
  rejected: {
    label: 'Order Rejected',
    sub: 'The restaurant could not accept this order.',
    icon: <X size={56} />,
    color: '#C4380A',
  },
}

// Fix #6 + #7: payment_pending and out_for_delivery added to STEP_ORDER so
// currentIdx is never -1 for these statuses and the stepper renders correctly.
const STEP_ORDER = ['requested', 'payment_pending', 'confirmed', 'in_kitchen', 'ready', 'out_for_delivery', 'delivered']

function StatusStepper({ status }: { status: string }) {
  // Stepper only shows the 5 user-visible milestones; STEP_ORDER is the superset
  // used for progress calculation (it includes payment_pending / out_for_delivery).
  const steps = [
    { key: 'requested', label: 'Received' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'in_kitchen', label: 'Cooking' },
    { key: 'ready', label: 'Ready' },
    { key: 'delivered', label: 'Done' },
  ]
  const currentIdx = STEP_ORDER.indexOf(status)

  return (
    <div className="flex items-center w-full mb-6">
      {steps.map((step, i) => {
        // Map each visible step to its STEP_ORDER index for accurate comparison
        const stepIdx = STEP_ORDER.indexOf(step.key)
        const done = stepIdx <= currentIdx && currentIdx !== -1
        const isLast = i === steps.length - 1
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                style={{ background: done ? '#E8A020' : '#e5e7eb', color: done ? '#fff' : '#9ca3af' }}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className="text-[10px] mt-1 text-center leading-tight" style={{ color: done ? '#E8A020' : '#9ca3af', maxWidth: 40 }}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className="flex-1 h-0.5 mx-1 mb-4 transition-colors" style={{ background: stepIdx < currentIdx ? '#E8A020' : '#e5e7eb' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function orderTypeLabel(type: OrderType, tableNum: string | null): string {
  if (type === 'dine-in') return tableNum ? `🪑 Table ${tableNum}` : '🪑 Dine-in'
  if (type === 'takeaway') return '🛍️ Takeaway'
  if (type === 'delivery') return '🛵 Delivery'
  return ''
}

export default function CheckoutModal() {
  const {
    isCheckoutOpen, closeCheckout, items, orderType, tableNumber,
    customerDetails, setCustomerDetails, clearCart, getTotalPrice,
  } = useCartStore()

  // Access the raw Zustand store to read state synchronously in handlePlaceOrder
  // (avoids stale-closure bug when capturing snapshots before clearCart runs)
  const storeRef = useCartStore

  const [step, setStep] = useState<Step>('details')
  const [payment, setPayment] = useState<PaymentMethod>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [placeError, setPlaceError] = useState('')

  // Local form state
  const [name, setName] = useState(customerDetails?.name ?? '')
  const [phone, setPhone] = useState(customerDetails?.phone ?? '')
  const [address, setAddress] = useState(customerDetails?.address ?? '')
  const [landmark, setLandmark] = useState(customerDetails?.landmark ?? '')
  const [pincode, setPincode] = useState(customerDetails?.pincode ?? '')

  // Coupon
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [appliedCoupon, setAppliedCoupon] = useState('')

  // Fix #10: track which order type the coupon was validated against so we can
  // invalidate it when the user navigates back and changes order type.
  const [couponValidatedForType, setCouponValidatedForType] = useState<OrderType>(null)

  // Order tracking
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null)
  const [trackData, setTrackData] = useState<OrderTrack | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Snapshots — captured synchronously from the store right before clearCart()
  // so the tracking screen always has the correct bill data (Fix #1).
  const [snapshotItems, setSnapshotItems] = useState<CartItem[]>([])
  const [snapshotSubtotal, setSnapshotSubtotal] = useState(0)
  const [snapshotDiscount, setSnapshotDiscount] = useState(0)
  const [snapshotGrandTotal, setSnapshotGrandTotal] = useState(0)
  const [snapshotOrderType, setSnapshotOrderType] = useState<OrderType>(null)
  const [snapshotTableNumber, setSnapshotTableNumber] = useState<string | null>(null)
  const [snapshotPayment, setSnapshotPayment] = useState<PaymentMethod>(null)
  const [snapshotAppliedCoupon, setSnapshotAppliedCoupon] = useState('')

  const subtotal = getTotalPrice()
  const deliveryCharge = orderType === 'delivery' ? 30 : 0
  // Fix #2: clamp grandTotal to 0 — coupon can never make total negative
  const grandTotal = Math.max(0, subtotal + deliveryCharge - couponDiscount)

  // Sync form fields when modal opens with previously saved customer details
  useEffect(() => {
    if (isCheckoutOpen && customerDetails) {
      if (customerDetails.name) setName(customerDetails.name)
      if (customerDetails.phone) setPhone(customerDetails.phone)
      if (customerDetails.address) setAddress(customerDetails.address ?? '')
      if (customerDetails.landmark) setLandmark(customerDetails.landmark ?? '')
      if (customerDetails.pincode) setPincode(customerDetails.pincode ?? '')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckoutOpen, customerDetails])

  // Fix #10: invalidate the coupon when the order type changes after it was applied
  useEffect(() => {
    if (appliedCoupon && couponValidatedForType !== null && couponValidatedForType !== orderType) {
      removeCoupon()
    }
  }, [orderType]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fix #4: Polling memory leak — isMounted flag prevents setState after unmount.
  // The cleanup clears the interval regardless of how the component unmounts.
  useEffect(() => {
    if (step !== 'tracking' || !placedOrder) return

    let isMounted = true

    const doPoll = async () => {
      const data = await trackOrder(placedOrder.id)
      if (isMounted && data) setTrackData(data)
    }

    doPoll()
    pollRef.current = setInterval(doPoll, 5000)

    return () => {
      isMounted = false
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [step, placedOrder])

  // Stop polling when terminal status reached
  useEffect(() => {
    const terminal = ['delivered', 'cancelled', 'rejected']
    if (trackData && terminal.includes(trackData.status)) {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [trackData])

  // ── Coupon ───────────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const result = await validateCoupon(couponCode.trim().toUpperCase(), subtotal + deliveryCharge)
      if (result.valid) {
        setCouponDiscount(result.discount_amount)
        setAppliedCoupon(couponCode.trim().toUpperCase())
        setCouponValidatedForType(orderType)
      } else {
        setCouponError('Invalid or expired coupon')
        setCouponDiscount(0)
        setAppliedCoupon('')
        setCouponValidatedForType(null)
      }
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Could not validate coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setCouponCode('')
    setCouponDiscount(0)
    setAppliedCoupon('')
    setCouponError('')
    setCouponValidatedForType(null)
  }

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!/^[0-9]{10}$/.test(phone.trim())) errs.phone = 'Enter a valid 10-digit phone number'
    if (orderType === 'delivery') {
      if (!address.trim()) errs.address = 'Address is required'
      if (!/^[0-9]{6}$/.test(pincode.trim())) errs.pincode = 'Enter a valid 6-digit pincode'
    }
    return errs
  }

  const handleDetailsNext = () => {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    setCustomerDetails({
      name: name.trim(), phone: phone.trim(),
      address: address.trim(), landmark: landmark.trim(),
      pincode: pincode.trim(), tableNumber: tableNumber ?? undefined,
    })
    setStep('payment')
  }

  // ── Place order ──────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!payment) return

    // Fix #9: guard against empty cart reaching submission
    // (items could be removed externally while modal is open)
    if (items.length === 0) {
      setPlaceError('Your cart is empty. Please add items before placing an order.')
      return
    }

    setStep('placing')
    setPlaceError('')

    // Fix #1: Read state synchronously from the Zustand store via getState()
    // instead of using the React-closure values of `items`, `orderType`, etc.
    // This guarantees snapshots are never stale, even if clearCart() has been
    // batched into the same React render cycle.
    const freshState = storeRef.getState()
    const freshItems = freshState.items
    const freshOrderType = freshState.orderType
    const freshTableNumber = freshState.tableNumber
    const freshSubtotal = freshState.getTotalPrice()
    const freshDeliveryCharge = freshOrderType === 'delivery' ? 30 : 0
    const freshGrandTotal = Math.max(0, freshSubtotal + freshDeliveryCharge - couponDiscount)

    setSnapshotItems([...freshItems])
    setSnapshotSubtotal(freshSubtotal)
    setSnapshotDiscount(couponDiscount)
    setSnapshotGrandTotal(freshGrandTotal)
    setSnapshotOrderType(freshOrderType)
    setSnapshotTableNumber(freshTableNumber)
    setSnapshotPayment(payment)
    setSnapshotAppliedCoupon(appliedCoupon)

    const apiItems = freshItems.map(item => ({
      menu_item_id: item.id,
      quantity: item.quantity,
      special_note: item.instruction?.trim() || undefined,
    }))

    const apiOrderType = freshOrderType === 'delivery' ? 'delivery' : 'pickup'

    // Fix #8: Validate the table number against the API to obtain the real UUID.
    // tableNumber in the store is a display string (e.g. "3"); the backend expects
    // the UUID returned by /api/tables/validate. Fall back to null if validation
    // fails so dine-in orders don't send a malformed table_id.
    let apiTableId: string | null = null
    if (freshOrderType === 'dine-in' && freshTableNumber) {
      const tableNum = parseInt(freshTableNumber, 10)
      if (isNaN(tableNum)) {
        setPlaceError('Invalid table number. Please close and scan the QR code again.')
        setStep('summary')
        return
      }
      try {
        const tableValidation = await validateTable(tableNum)
        if (!tableValidation?.table_id) {
          setPlaceError(`Table ${freshTableNumber} could not be verified. Please ask staff for assistance.`)
          setStep('summary')
          return
        }
        apiTableId = tableValidation.table_id
      } catch {
        setPlaceError('Could not verify your table. Please check your connection and try again.')
        setStep('summary')
        return
      }
    }

    try {
      const placed = await placeOrder({
        order_type: apiOrderType,
        table_id: apiTableId,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        delivery_address: freshOrderType === 'delivery'
          ? `${address.trim()}${landmark.trim() ? ', ' + landmark.trim() : ''}, ${pincode.trim()}`
          : undefined,
        items: apiItems,
        coupon_code: appliedCoupon || undefined,
      })
      setPlacedOrder(placed)
      clearCart()
      setStep('tracking')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order'
      setPlaceError(msg)
      setStep('summary')
    }
  }

  // Fix #5: reset ALL state (coupon, form fields, snapshots) on close — not just
  // step/payment/errors. Prevents stale coupon/totals on re-open.
  // Fix #15: also block close during 'placing' state (order in-flight).
  const handleClose = () => {
    if (step === 'tracking' || step === 'placing') return
    closeCheckout()
    setStep('details')
    setPayment(null)
    setErrors({})
    setPlaceError('')
    // Reset coupon state
    setCouponCode('')
    setCouponDiscount(0)
    setAppliedCoupon('')
    setCouponError('')
    setCouponValidatedForType(null)
    // Reset form fields — only overwrite if customerDetails exists; otherwise
    // preserve whatever the user typed so a first-time user doesn't lose input.
    if (customerDetails) {
      setName(customerDetails.name ?? '')
      setPhone(customerDetails.phone ?? '')
      setAddress(customerDetails.address ?? '')
      setLandmark(customerDetails.landmark ?? '')
      setPincode(customerDetails.pincode ?? '')
    }
  }

  // Fix #15: keyboard Escape handler — block close during placing/tracking
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    if (isCheckoutOpen) {
      document.addEventListener('keydown', onKeyDown)
    }
    return () => document.removeEventListener('keydown', onKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckoutOpen, step])

  const handleDoneTracking = () => {
    closeCheckout()
    setStep('details')
    setPayment(null)
    setPlacedOrder(null)
    setTrackData(null)
    setCouponCode('')
    setCouponDiscount(0)
    setAppliedCoupon('')
    setCouponError('')
    setCouponValidatedForType(null)
    setSnapshotItems([])
    setSnapshotSubtotal(0)
    setSnapshotDiscount(0)
    setSnapshotGrandTotal(0)
    setSnapshotOrderType(null)
    setSnapshotTableNumber(null)
    setSnapshotPayment(null)
    setSnapshotAppliedCoupon('')
  }

  const currentStatus = trackData?.status ?? placedOrder?.status ?? 'requested'
  const statusInfo = STATUS_INFO[currentStatus] ?? STATUS_INFO.requested
  const isTerminal = ['delivered', 'cancelled', 'rejected'].includes(currentStatus)

  const displayOrderType = step === 'tracking' ? snapshotOrderType : orderType
  const displayTableNumber = step === 'tracking' ? snapshotTableNumber : tableNumber
  const displayPayment = step === 'tracking' ? snapshotPayment : payment

  // Fix #14: use CHECKOUT_STEPS constant for step indicator math
  const checkoutStepIndex = CHECKOUT_STEPS.indexOf(step as Step)

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.7)' }}
          // Fix #15: backdrop click respects placing/tracking guard via handleClose
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-[20px] w-full max-w-[480px] max-h-[90vh] overflow-y-auto relative mx-2"
            onClick={e => e.stopPropagation()}
          >
            {/* Close — hidden while placing or tracking */}
            {step !== 'placing' && step !== 'tracking' && (
              <button onClick={handleClose} className="absolute top-5 right-5 z-10 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            )}

            {/* Fix #14: Step indicator bar uses CHECKOUT_STEPS constant */}
            {checkoutStepIndex !== -1 && (
              <div className="flex gap-1 px-5 sm:px-8 pt-6 pb-4">
                {CHECKOUT_STEPS.map((s, i) => (
                  <div key={s} className="flex-1 h-1 rounded-full transition-colors"
                    style={{ background: checkoutStepIndex >= i ? '#E8A020' : '#e5e7eb' }} />
                ))}
              </div>
            )}

            <div className="px-5 sm:px-8 pb-6 sm:pb-8">

              {/* ── STEP 1: Details ── */}
              {step === 'details' && (
                <>
                  <h2 className="font-playfair text-2xl font-bold mb-1" style={{ color: '#2C1810' }}>Your Details</h2>
                  <p className="text-xs text-gray-400 mb-5">
                    {orderType === 'dine-in' ? `Dine-in · Table ${tableNumber ?? '?'}` : orderType === 'takeaway' ? 'Takeaway order' : 'Home delivery'}
                  </p>

                  {orderType === 'dine-in' && tableNumber && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-medium" style={{ background: '#FFF3E0', color: '#E8A020' }}>
                      🪑 Table Number: <strong>{tableNumber}</strong>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <input
                        placeholder="Full Name *"
                        value={name}
                        onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none bg-gray-50"
                        style={{ borderColor: errors.name ? '#C4380A' : '#e5e7eb' }}
                      />
                      {errors.name && <p className="text-xs mt-1" style={{ color: '#C4380A' }}>{errors.name}</p>}
                    </div>
                    <div>
                      {/* Fix #11: inputMode + pattern restricts phone to digits on all browsers */}
                      <input
                        placeholder="Phone Number *"
                        value={phone}
                        onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setErrors(p => ({ ...p, phone: '' })) }}
                        maxLength={10}
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none bg-gray-50"
                        style={{ borderColor: errors.phone ? '#C4380A' : '#e5e7eb' }}
                      />
                      {errors.phone && <p className="text-xs mt-1" style={{ color: '#C4380A' }}>{errors.phone}</p>}
                    </div>
                    {orderType === 'delivery' && (
                      <>
                        <div>
                          <textarea
                            placeholder="Full Address *"
                            value={address}
                            onChange={e => { setAddress(e.target.value); setErrors(p => ({ ...p, address: '' })) }}
                            rows={2}
                            className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none bg-gray-50"
                            style={{ borderColor: errors.address ? '#C4380A' : '#e5e7eb' }}
                          />
                          {errors.address && <p className="text-xs mt-1" style={{ color: '#C4380A' }}>{errors.address}</p>}
                        </div>
                        <input
                          placeholder="Landmark (optional)"
                          value={landmark}
                          onChange={e => setLandmark(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none bg-gray-50"
                        />
                        <div>
                          {/* Fix #12: inputMode + replace non-digits restricts pincode input */}
                          <input
                            placeholder="Pincode *"
                            value={pincode}
                            onChange={e => { setPincode(e.target.value.replace(/\D/g, '')); setErrors(p => ({ ...p, pincode: '' })) }}
                            maxLength={6}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="w-full px-4 py-3 rounded-xl border text-sm outline-none bg-gray-50"
                            style={{ borderColor: errors.pincode ? '#C4380A' : '#e5e7eb' }}
                          />
                          {errors.pincode && <p className="text-xs mt-1" style={{ color: '#C4380A' }}>{errors.pincode}</p>}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Coupon */}
                  <div className="mt-4">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <span className="text-sm font-semibold" style={{ color: '#15803d' }}>
                          🎉 {appliedCoupon} — ₹{couponDiscount} off
                        </span>
                        <button onClick={removeCoupon} className="text-xs text-gray-400 hover:text-red-400 transition-colors">Remove</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          placeholder="Coupon code (optional)"
                          value={couponCode}
                          onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-gray-50"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity disabled:opacity-50"
                          style={{ background: '#E8A020' }}
                        >
                          {couponLoading ? '…' : 'Apply'}
                        </button>
                      </div>
                    )}
                    {couponError && <p className="text-xs mt-1" style={{ color: '#C4380A' }}>{couponError}</p>}
                  </div>

                  <button onClick={handleDetailsNext} className="w-full mt-5 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity" style={{ background: '#E8A020' }}>
                    Continue to Payment →
                  </button>
                </>
              )}

              {/* ── STEP 2: Payment ── */}
              {step === 'payment' && (
                <>
                  <h2 className="font-playfair text-2xl font-bold mb-5" style={{ color: '#2C1810' }}>Payment Method</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPayment('cod')}
                      className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200"
                      style={{ borderColor: payment === 'cod' ? '#C4380A' : '#e5e7eb', background: payment === 'cod' ? '#FFF5F2' : '#fafafa' }}
                    >
                      <span className="text-3xl">💵</span>
                      <p className="font-semibold text-sm" style={{ color: '#2C1810' }}>Cash on Delivery</p>
                      <p className="text-xs text-gray-400 text-center">Pay when order arrives</p>
                    </button>
                    <button
                      disabled
                      className="relative flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-gray-100 opacity-50 cursor-not-allowed"
                      style={{ background: '#fafafa' }}
                    >
                      <span className="text-3xl">📱</span>
                      <p className="font-semibold text-sm" style={{ color: '#2C1810' }}>Online Payment</p>
                      <p className="text-xs text-gray-400 text-center">UPI / Card</p>
                      <span className="absolute top-2 right-2 text-[10px] font-bold text-white px-2 py-0.5 rounded-full" style={{ background: '#E8A020' }}>Soon</span>
                    </button>
                  </div>
                  <button
                    onClick={() => { if (payment) setStep('summary') }}
                    className="w-full mt-5 py-3 rounded-xl text-white font-semibold text-sm transition-opacity"
                    style={{ background: payment ? '#E8A020' : '#d1d5db', cursor: payment ? 'pointer' : 'not-allowed' }}
                  >
                    Review Order →
                  </button>
                </>
              )}

              {/* ── STEP 3: Summary ── */}
              {step === 'summary' && (
                <>
                  <h2 className="font-playfair text-2xl font-bold mb-5" style={{ color: '#2C1810' }}>Order Summary</h2>

                  {/* Fix #9: warn user if cart became empty before they submit */}
                  {items.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400">
                      Your cart is empty. Please close and add items.
                    </div>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between gap-2">
                          <span className="text-sm text-gray-600 flex-1 truncate">
                            {item.name} <span className="text-gray-400">×{item.quantity}</span>
                          </span>
                          <span className="text-sm font-medium flex-shrink-0" style={{ color: '#2C1810' }}>
                            {item.priceNumber > 0 ? `₹${item.priceNumber * item.quantity}` : 'At counter'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3 space-y-1.5">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span><span>₹{subtotal}</span>
                    </div>
                    {orderType === 'delivery' && (
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Delivery charge</span><span>₹30</span>
                      </div>
                    )}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm" style={{ color: '#15803d' }}>
                        <span>Coupon ({appliedCoupon})</span><span>-₹{couponDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-1">
                      <span style={{ color: '#2C1810' }}>Grand Total</span>
                      <span style={{ color: '#C4380A' }}>₹{grandTotal}</span>
                    </div>
                  </div>

                  <div className="mt-4 px-4 py-3 rounded-xl text-sm" style={{ background: '#FFF3E0', color: '#E8A020' }}>
                    {payment === 'cod' ? '💵 Cash on Delivery' : '📱 Online Payment'}
                    {' · '}
                    {orderType === 'dine-in' ? `🪑 Table ${tableNumber ?? ''}` : orderType === 'takeaway' ? '🛍️ Takeaway' : '🛵 Delivery'}
                  </div>

                  {placeError && (
                    <div className="mt-3 px-4 py-3 rounded-xl text-sm" style={{ background: '#FFF0F0', color: '#C4380A' }}>
                      {placeError}
                    </div>
                  )}

                  <button
                    onClick={handlePlaceOrder}
                    disabled={items.length === 0}
                    className="w-full mt-5 py-3.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: '#E8A020' }}
                  >
                    Place Order
                  </button>
                </>
              )}

              {/* ── PLACING ── */}
              {step === 'placing' && (
                <div className="flex flex-col items-center text-center py-10 gap-4">
                  <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                  <p className="font-semibold text-base" style={{ color: '#2C1810' }}>Placing your order…</p>
                  <p className="text-sm text-gray-400">Please wait a moment</p>
                </div>
              )}

              {/* ── TRACKING ── */}
              {step === 'tracking' && placedOrder && (
                <div className="pt-4">
                  <div className="text-center mb-6">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Order</p>
                    <h2 className="font-playfair text-2xl font-bold" style={{ color: '#2C1810' }}>
                      #{placedOrder.order_number}
                    </h2>
                  </div>

                  <StatusStepper status={currentStatus} />

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStatus}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center text-center py-5 px-4 rounded-2xl mb-6"
                      style={{ background: '#FFF8F0' }}
                    >
                      <span style={{ color: statusInfo.color }}>{statusInfo.icon}</span>
                      <p className="font-playfair text-xl font-bold mt-3 mb-1" style={{ color: '#2C1810' }}>
                        {statusInfo.label}
                      </p>
                      <p className="text-sm text-gray-500">{statusInfo.sub}</p>
                      {!isTerminal && (
                        <div className="flex items-center gap-1.5 mt-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Bill breakdown — uses snapshots, not live store (which was cleared) */}
                  <div className="rounded-2xl border border-gray-100 overflow-hidden mb-5">
                    <div className="px-4 py-3 border-b border-gray-100" style={{ background: '#FAFAFA' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Your Bill</p>
                    </div>
                    <div className="px-4 py-3 space-y-1.5">
                      {snapshotItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between gap-2">
                          <span className="text-sm text-gray-600 flex-1 truncate">
                            {item.name} <span className="text-gray-400">×{item.quantity}</span>
                          </span>
                          <span className="text-sm font-medium flex-shrink-0" style={{ color: '#2C1810' }}>
                            {item.priceNumber > 0 ? `₹${item.priceNumber * item.quantity}` : 'At counter'}
                          </span>
                        </div>
                      ))}
                      <div className="border-t border-gray-100 pt-2 mt-2 space-y-1.5">
                        {/* Fix #13: use || fallback (not ??) so 0 correctly falls back to
                            placedOrder values when snapshots were never set */}
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Subtotal</span><span>₹{snapshotSubtotal || placedOrder.subtotal}</span>
                        </div>
                        {snapshotOrderType === 'delivery' && (
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Delivery charge</span><span>₹30</span>
                          </div>
                        )}
                        {(snapshotDiscount > 0 || placedOrder.discount_amount > 0) && (
                          <div className="flex justify-between text-sm" style={{ color: '#15803d' }}>
                            <span>Discount{snapshotAppliedCoupon ? ` (${snapshotAppliedCoupon})` : ''}</span>
                            <span>-₹{snapshotDiscount || placedOrder.discount_amount}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-base font-bold pt-1">
                          <span style={{ color: '#2C1810' }}>Grand Total</span>
                          <span style={{ color: '#C4380A' }}>₹{snapshotGrandTotal || placedOrder.total_amount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-5">
                    <span className="flex-1 text-center text-xs font-semibold py-2 rounded-xl" style={{ background: '#FFF3E0', color: '#E8A020' }}>
                      {orderTypeLabel(displayOrderType, displayTableNumber)}
                    </span>
                    <span className="flex-1 text-center text-xs font-semibold py-2 rounded-xl" style={{ background: '#FFF3E0', color: '#E8A020' }}>
                      {displayPayment === 'cod' ? '💵 Cash on Delivery' : '📱 Online Payment'}
                    </span>
                  </div>

                  {isTerminal ? (
                    <button
                      onClick={handleDoneTracking}
                      className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                      style={{ background: '#E8A020' }}
                    >
                      Done
                    </button>
                  ) : (
                    <p className="text-center text-xs text-gray-400">
                      This page updates automatically — no need to refresh
                    </p>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
