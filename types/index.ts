export interface Category {
  id: string
  name: string
  name_fr: string
  name_ar: string
  icon: string
  color: string
  image_url: string
  created_at: string
}

export interface Establishment {
  id: string
  name: string
  description: string
  description_fr: string
  description_ar: string
  category_id: string
  address: string
  city: string
  city_fr: string
  city_ar: string
  phone: string
  website: string
  hours: string
  rating: number
  review_count: number
  price_level: number
  latitude: number
  longitude: number
  images: string
  features: string
  owner_id: string
  status: string
  created_at: string
}

export interface Reservation {
  id: string
  establishment_id: string
  user_id: string
  date: string
  time: string
  guests: number
  service: string
  notes: string
  status: string
  payment_status: string
  amount: number
  created_at: string
}

export interface Review {
  id: string
  establishment_id: string
  user_id: string
  rating: number
  comment: string
  owner_reply: string
  created_at: string
}

export interface Favorite {
  id: string
  establishment_id: string
  user_id: string
  created_at: string
}

export type Language = 'fr' | 'en' | 'ar'

export type UserType = 'client' | 'owner'

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'
