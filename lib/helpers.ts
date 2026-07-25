/**
 * Utility helpers for localized content and data parsing.
 */

/**
 * Returns the localized name for an item based on the current locale.
 * Falls back to the default `name` field if no localized variant exists.
 */
export function getLocalizedName(
  item: { name?: string; name_fr?: string; name_ar?: string },
  locale: string,
): string {
  if (locale === 'fr' && item.name_fr) return item.name_fr
  if (locale === 'ar' && item.name_ar) return item.name_ar
  return item.name ?? ''
}

/**
 * Returns a localized field from an item object (e.g. description_fr, description_ar).
 */
export function getLocalizedField(
  item: Record<string, any>,
  field: string,
  locale: string,
): string {
  const key = `${field}_${locale}`
  return (item[key] as string) ?? (item[field] as string) ?? ''
}

/**
 * Returns a price level label string (e.g. "$", "$$", "$$$").
 */
export function priceLevelLabel(level: number): string {
  return '$'.repeat(Math.max(1, Math.min(4, level)))
}

/**
 * Returns human-readable feature labels.
 */
export function featureLabel(feature: string): string {
  const labels: Record<string, string> = {
    wifi: 'Wi-Fi',
    parking: 'Parking',
    terrace: 'Terrace',
    'air-conditioned': 'AC',
    'outdoor-seating': 'Outdoor',
    'vegan-options': 'Vegan',
    'changing-rooms': 'Lockers',
    'night-lighting': 'Night',
    'equipment-rental': 'Equipment',
    'premium-products': 'Premium',
    sauna: 'Sauna',
    'personal-trainer': 'Trainer',
    'group-classes': 'Classes',
    pool: 'Pool',
    'room-service': 'Room Service',
    concierge: 'Concierge',
    restaurant: 'Restaurant',
    'couples-room': 'Couples',
    jacuzzi: 'Jacuzzi',
    'tea-lounge': 'Tea Lounge',
    takeaway: 'Takeaway',
    delivery: 'Delivery',
    'vegetarian-options': 'Veg',
    'live-music': 'Live Music',
    accessible: 'Accessible',
    'online-consultation': 'Online',
  }
  return labels[feature.toLowerCase()] ?? feature
}

/**
 * Parses a JSON-encoded images string (from the DB) into a URL array.
 */
export function parseImages(images: string): string[] {
  if (!images) return []
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Parses a JSON-encoded features string into a string array.
 */
export function parseFeatures(features: string): string[] {
  if (!features) return []
  try {
    const parsed = JSON.parse(features)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Generates an array of next N days with day names and values.
 */
export function nextDays(n: number): { dayName: string; dayNum: number; value: string }[] {
  const days: { dayName: string; dayNum: number; value: string }[] = []
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()

  for (let i = 0; i < n; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    days.push({
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      value: `${yyyy}-${mm}-${dd}`,
    })
  }

  return days
}

/**
 * Generates time slots between start and end times.
 */
export function generateTimeSlots(start: string, end: string, intervalMin: number): string[] {
  const slots: string[] = []
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)
  const startTotal = startH * 60 + startM
  const endTotal = endH * 60 + endM

  for (let t = startTotal; t <= endTotal; t += intervalMin) {
    const h = String(Math.floor(t / 60)).padStart(2, '0')
    const m = String(t % 60).padStart(2, '0')
    slots.push(`${h}:${m}`)
  }

  return slots
}
