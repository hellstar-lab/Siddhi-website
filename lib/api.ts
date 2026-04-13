/**
 * API client for Siddhi Sweets backend
 * Base: https://siddhi-backend-a5nw.onrender.com
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://siddhi-backend-a5nw.onrender.com'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  const json = await res.json()
  if (!res.ok) {
    // Backend may use .message, .error, or .detail (FastAPI/Django style)
    const msg = json.message ?? json.error ?? json.detail ?? `Request failed: ${res.status}`
    throw new Error(msg)
  }
  return json
}

// ── Restaurant ─────────────────────────────────────────────────────────────

export interface RestaurantInfo {
  name: string
  address: string
  phone: string
  whatsapp_number: string
  logo_url: string | null   // backend field is logo_url, not logo
  is_open: boolean
  opening_time: string
  closing_time: string
  google_review_link: string | null
  delivery_radius_km: number
}

export async function getRestaurantInfo(): Promise<RestaurantInfo | null> {
  try {
    const json = await apiFetch<{ success: boolean; data: RestaurantInfo }>('/api/restaurant')
    return json.data ?? null
  } catch {
    return null
  }
}

export interface OperatingHours {
  [day: string]: { open: string; close: string; closed: boolean }
}

export async function getOperatingHours(): Promise<OperatingHours | null> {
  try {
    const json = await apiFetch<{ success: boolean; data: OperatingHours }>('/api/restaurant/hours')
    return json.data ?? null
  } catch {
    return null
  }
}

// ── Menu ───────────────────────────────────────────────────────────────────

export interface ApiMenuItem {
  id: string
  name: string
  description: string
  price: number
  is_veg: boolean
  is_available: boolean
  image_url: string | null
  variants: { name: string; price: number }[]
  tags: string[]
  preparation_time_mins: number
}

export interface ApiCategory {
  id: string
  name: string
  description: string
  sort_order: number
  items: ApiMenuItem[]
}

export async function getFullMenu(): Promise<ApiCategory[] | null> {
  try {
    const json = await apiFetch<{ success: boolean; data: ApiCategory[] }>('/api/menu/full')
    return json.data ?? null
  } catch {
    return null
  }
}

// ── Tables ─────────────────────────────────────────────────────────────────

export interface TableValidation {
  valid: boolean
  table_number: number
  table_id: string
}

export async function validateTable(tableNumber: number): Promise<TableValidation | null> {
  try {
    const json = await apiFetch<{ success: boolean; data: TableValidation }>(
      `/api/tables/validate?table=${tableNumber}`
    )
    return json.data ?? null
  } catch {
    return null
  }
}

// ── Coupons ────────────────────────────────────────────────────────────────

export interface CouponValidation {
  valid: boolean
  code: string
  discount_amount: number
  final_amount: number
}

export async function validateCoupon(code: string, orderTotal: number): Promise<CouponValidation> {
  try {
    const json = await apiFetch<{ success: boolean; data: CouponValidation }>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, order_total: orderTotal }),
    })
    if (!json.data) {
      throw new Error('Malformed coupon response from server')
    }
    return json.data
  } catch (err) {
    // Re-throw so callers get a typed Error, not a raw TypeError
    throw err instanceof Error ? err : new Error('Could not validate coupon')
  }
}

// ── Orders ─────────────────────────────────────────────────────────────────

export interface OrderItem {
  menu_item_id: string
  quantity: number
  variant?: string
  special_note?: string
}

export interface PlaceOrderPayload {
  order_type: 'pickup' | 'delivery'
  table_id?: string | null
  customer_name: string
  customer_phone: string
  delivery_address?: string
  latitude?: number | null
  longitude?: number | null
  items: OrderItem[]
  coupon_code?: string
  special_instructions?: string
}

export interface PlacedOrder {
  id: string
  order_number: number   // backend returns integer, not string
  status: string
  payment_status: string
  subtotal: number
  discount_amount: number
  total_amount: number
}

export async function placeOrder(payload: PlaceOrderPayload): Promise<PlacedOrder> {
  const json = await apiFetch<{ success: boolean; data: PlacedOrder; message?: string }>(
    '/api/orders/request',
    { method: 'POST', body: JSON.stringify(payload) }
  )
  return json.data
}

export interface OrderTrack {
  status: string
  payment_status: string
  can_pay: boolean
  approved_items: unknown[]
  pending_items: unknown[]
  approved_total: number
  razorpay_key_id?: string
}

export async function trackOrder(orderId: string): Promise<OrderTrack | null> {
  try {
    const json = await apiFetch<{ success: boolean; data: OrderTrack }>(`/api/orders/${orderId}/track`)
    return json.data ?? null
  } catch {
    return null
  }
}
