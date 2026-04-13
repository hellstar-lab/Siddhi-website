'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/lib/cartStore'
import { getTableFromURL } from '@/lib/qrHelper'

interface Props {
  isOpen: boolean
  onClose: () => void
  /** Called after order type is confirmed so pending addItem can proceed */
  onConfirmed?: () => void
}

type Step = 'choose' | 'takeaway-form' | 'delivery-form'

export default function OrderTypeModal({ isOpen, onClose, onConfirmed }: Props) {
  const { setOrderType, setTableNumber, setCustomerDetails } = useCartStore()
  const [step, setStep] = useState<Step>('choose')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [landmark, setLandmark] = useState('')
  const [pincode, setPincode] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset to choose step each time modal opens
  useEffect(() => {
    if (isOpen) setStep('choose')
  }, [isOpen])

  const handleDineIn = () => {
    const table = getTableFromURL()
    setOrderType('dine-in')
    if (table) setTableNumber(table)
    onClose()
    onConfirmed?.()
  }

  const handleTakeaway = () => setStep('takeaway-form')
  const handleDelivery = () => setStep('delivery-form')

  const validateBase = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!/^[0-9]{10}$/.test(phone.trim())) errs.phone = 'Enter a valid 10-digit phone number'
    return errs
  }

  const submitTakeaway = () => {
    const errs = validateBase()
    setErrors(errs)
    if (Object.keys(errs).length) return
    setOrderType('takeaway')
    setCustomerDetails({ name: name.trim(), phone: phone.trim() })
    onClose()
    onConfirmed?.()
  }

  const submitDelivery = () => {
    const errs = validateBase()
    if (!address.trim()) errs.address = 'Address is required'
    if (!/^[0-9]{6}$/.test(pincode.trim())) errs.pincode = 'Enter a valid 6-digit pincode'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setOrderType('delivery')
    setCustomerDetails({ name: name.trim(), phone: phone.trim(), address: address.trim(), landmark: landmark.trim(), pincode: pincode.trim() })
    onClose()
    onConfirmed?.()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.7)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-[20px] w-full max-w-[480px] p-5 sm:p-8 relative"
          >
            {/* Back button for sub-steps */}
            {step !== 'choose' && (
              <button onClick={() => { setStep('choose'); setErrors({}) }} className="absolute top-5 left-5 text-gray-400 hover:text-gray-700 text-sm flex items-center gap-1">
                ← Back
              </button>
            )}

            {/* Close */}
            <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>

            {step === 'choose' && (
              <>
                <h2 className="font-playfair text-2xl font-bold text-center mb-2" style={{ color: '#2C1810' }}>How would you like to order?</h2>
                <p className="text-sm text-gray-400 text-center mb-7">Choose your order type to continue</p>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {/* Dine-in */}
                  <button
                    onClick={handleDineIn}
                    className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl border-2 border-transparent hover:border-[#E8A020] transition-all duration-200 group"
                    style={{ background: '#FFF8F0' }}
                  >
                    <span className="text-2xl sm:text-3xl">🍽️</span>
                    <div className="text-center">
                      <p className="font-semibold text-sm" style={{ color: '#2C1810' }}>Dine-in</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-tight">Scan QR at table</p>
                    </div>
                  </button>

                  {/* Takeaway */}
                  <button
                    onClick={handleTakeaway}
                    className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl border-2 border-transparent hover:border-[#E8A020] transition-all duration-200 group"
                    style={{ background: '#FFF8F0' }}
                  >
                    <span className="text-2xl sm:text-3xl">🛍️</span>
                    <div className="text-center">
                      <p className="font-semibold text-sm" style={{ color: '#2C1810' }}>Takeaway</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-tight">Pick up from restaurant</p>
                    </div>
                  </button>

                  {/* Delivery */}
                  <button
                    onClick={handleDelivery}
                    className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl border-2 border-transparent hover:border-[#E8A020] transition-all duration-200 group"
                    style={{ background: '#FFF8F0' }}
                  >
                    <span className="text-2xl sm:text-3xl">🛵</span>
                    <div className="text-center">
                      <p className="font-semibold text-sm" style={{ color: '#2C1810' }}>Delivery</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-tight">Delivered to door</p>
                    </div>
                  </button>
                </div>
              </>
            )}

            {step === 'takeaway-form' && (
              <>
                <h2 className="font-playfair text-2xl font-bold text-center mb-6" style={{ color: '#2C1810' }}>🛍️ Takeaway Details</h2>
                <CustomerFields
                  name={name} setName={setName}
                  phone={phone} setPhone={setPhone}
                  errors={errors}
                />
                <button onClick={submitTakeaway} className="w-full mt-5 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90" style={{ background: '#E8A020' }}>
                  Confirm Takeaway
                </button>
              </>
            )}

            {step === 'delivery-form' && (
              <>
                <h2 className="font-playfair text-2xl font-bold text-center mb-6" style={{ color: '#2C1810' }}>🛵 Delivery Details</h2>
                <CustomerFields
                  name={name} setName={setName}
                  phone={phone} setPhone={setPhone}
                  errors={errors}
                />
                <div className="mt-3 space-y-3">
                  <div>
                    <textarea
                      placeholder="Full Address *"
                      value={address}
                      onChange={e => { setAddress(e.target.value); setErrors(p => ({ ...p, address: '' })) }}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none transition-colors bg-gray-50"
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
                    <input
                      placeholder="Pincode *"
                      value={pincode}
                      onChange={e => { setPincode(e.target.value); setErrors(p => ({ ...p, pincode: '' })) }}
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none bg-gray-50"
                      style={{ borderColor: errors.pincode ? '#C4380A' : '#e5e7eb' }}
                    />
                    {errors.pincode && <p className="text-xs mt-1" style={{ color: '#C4380A' }}>{errors.pincode}</p>}
                  </div>
                </div>
                <button onClick={submitDelivery} className="w-full mt-5 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90" style={{ background: '#E8A020' }}>
                  Confirm Delivery Address
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function CustomerFields({
  name, setName, phone, setPhone, errors,
}: {
  name: string; setName: (v: string) => void
  phone: string; setPhone: (v: string) => void
  errors: Record<string, string>
}) {
  return (
    <div className="space-y-3">
      <div>
        <input
          placeholder="Full Name *"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none bg-gray-50 transition-colors"
          style={{ borderColor: errors.name ? '#C4380A' : '#e5e7eb' }}
        />
        {errors.name && <p className="text-xs mt-1" style={{ color: '#C4380A' }}>{errors.name}</p>}
      </div>
      <div>
        <input
          placeholder="Phone Number *"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          maxLength={10}
          type="tel"
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none bg-gray-50 transition-colors"
          style={{ borderColor: errors.phone ? '#C4380A' : '#e5e7eb' }}
        />
        {errors.phone && <p className="text-xs mt-1" style={{ color: '#C4380A' }}>{errors.phone}</p>}
      </div>
    </div>
  )
}
