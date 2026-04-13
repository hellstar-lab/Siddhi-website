export function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/₹/g, '').trim()
  if (cleaned === 'On MRP') return 0
  const parts = cleaned.split('/')
  const num = parseFloat(parts[0].trim())
  return isNaN(num) ? 0 : num
}
