'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { generateTableURL } from '@/lib/qrHelper'

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN ?? '1234'

export default function QRAdminPage() {
  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [tableCount, setTableCount] = useState(10)
  const tables = Array.from({ length: tableCount }, (_, i) => i + 1)

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      setAuthed(true)
      setPinError(false)
    } else {
      setPinError(true)
      setPin('')
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
          <h1 className="font-playfair text-2xl font-bold text-center mb-1" style={{ color: '#2C1810' }}>
            Admin Access
          </h1>
          <p className="text-sm text-gray-400 text-center mb-6">Enter PIN to view QR codes</p>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              placeholder="Enter PIN"
              value={pin}
              onChange={e => { setPin(e.target.value); setPinError(false) }}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none bg-gray-50 text-center tracking-widest"
              style={{ borderColor: pinError ? '#C4380A' : '#e5e7eb' }}
              autoFocus
            />
            {pinError && <p className="text-xs text-center" style={{ color: '#C4380A' }}>Incorrect PIN</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ background: '#E8A020' }}
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 print:hidden">
          <h1 className="font-playfair text-3xl font-bold mb-1" style={{ color: '#2C1810' }}>
            Table QR Codes
          </h1>
          <p className="text-sm text-gray-500">Generate and print QR codes for each table. Customers scan to order instantly.</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-8 print:hidden">
          <label className="text-sm font-medium text-gray-600">Number of tables:</label>
          <input
            type="number"
            min={1}
            max={50}
            value={tableCount}
            onChange={e => setTableCount(Math.max(1, Math.min(50, Number(e.target.value))))}
            className="w-24 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400 bg-white"
          />
          <button
            onClick={() => window.print()}
            className="px-5 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ background: '#E8A020' }}
          >
            Print All QR Codes
          </button>
        </div>

        {/* QR Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {tables.map(num => {
            const url = generateTableURL(num)
            return (
              <div
                key={num}
                className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 shadow-sm border border-gray-100 print:shadow-none print:border print:border-gray-200 break-inside-avoid"
              >
                <p className="font-playfair text-lg font-bold" style={{ color: '#C4380A' }}>
                  Table {num}
                </p>
                <QRCodeSVG
                  value={url}
                  size={140}
                  bgColor="#ffffff"
                  fgColor="#2C1810"
                  level="M"
                />
                <p className="text-[10px] text-gray-400 text-center break-all">{url}</p>
                <p className="text-xs text-gray-500 font-medium">Siddhi Sweets</p>
              </div>
            )
          })}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
