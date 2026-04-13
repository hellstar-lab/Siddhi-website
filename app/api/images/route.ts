import { NextRequest, NextResponse } from "next/server"

// Key is server-only — no NEXT_PUBLIC_ prefix
const PEXELS_API_KEY = process.env.PEXELS_API_KEY

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")
  if (!query) {
    return NextResponse.json({ url: null }, { status: 400 })
  }

  if (!PEXELS_API_KEY) {
    return NextResponse.json({ url: null }, { status: 500 })
  }

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: PEXELS_API_KEY } }
    )

    if (!res.ok) {
      return NextResponse.json({ url: null }, { status: res.status })
    }

    const data = await res.json()
    // Use `large` (max ~1200px) — far smaller than `original` (5–10MB uncompressed).
    // Falls back to `medium` if large is absent. Both load fast on a food card.
    const src = data.photos?.[0]?.src
    const url = src?.large ?? src?.medium ?? null
    return NextResponse.json({ url }, {
      headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600' },
    })
  } catch {
    return NextResponse.json({ url: null }, { status: 500 })
  }
}
