"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ backgroundColor: "#FAF8F5" }}>
      <p className="text-5xl mb-6" aria-hidden="true">🍽️</p>
      <h2 className="font-playfair text-2xl font-bold mb-3" style={{ color: "#2C1810" }}>
        Something went wrong
      </h2>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        We&apos;re having trouble loading the page. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        style={{ backgroundColor: "#E8A020" }}
      >
        Try again
      </button>
    </div>
  )
}
