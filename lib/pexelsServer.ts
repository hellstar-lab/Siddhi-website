/**
 * Server-only Pexels helper — calls Pexels directly using the secret key.
 * Never import this file from a "use client" component.
 */
const PEXELS_API_KEY = process.env.PEXELS_API_KEY

export async function fetchFoodImageServer(query: string): Promise<string> {
  if (!PEXELS_API_KEY) return "/placeholder-food.svg"
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: { Authorization: PEXELS_API_KEY },
        next: { revalidate: 86400 }, // cache for 24 h — images don't change often
      }
    )
    if (!res.ok) return "/placeholder-food.svg"
    const data = await res.json()
    // Use `original` — no query params, so Next.js <Image> won't trigger
    // Content-Disposition: attachment when proxied through /_next/image
    return data.photos?.[0]?.src?.original ?? "/placeholder-food.svg"
  } catch {
    return "/placeholder-food.svg"
  }
}
