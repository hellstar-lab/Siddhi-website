/**
 * Fetch a food image URL via our server-side API route.
 * The Pexels API key never reaches the client bundle.
 */
export async function fetchFoodImage(query: string): Promise<string> {
  try {
    const res = await fetch(`/api/images?q=${encodeURIComponent(query)}`)
    if (!res.ok) return "/placeholder-food.svg"
    const data = await res.json()
    return data.url ?? "/placeholder-food.svg"
  } catch {
    return "/placeholder-food.svg"
  }
}
