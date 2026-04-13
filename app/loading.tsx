export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF8F5" }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "#E8A020", borderTopColor: "transparent" }}
          role="status"
          aria-label="Loading"
        />
        <p className="font-playfair text-lg font-semibold" style={{ color: "#E8A020" }}>
          Siddhi Sweets
        </p>
      </div>
    </div>
  )
}
