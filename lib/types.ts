export type BookingStatus = 'New' | 'Called' | 'Confirmed' | 'Cancelled'

export type BookingCategory = 'city' | 'hourly' | 'intercity' | 'airport'

// Newest reviews first (by createdAt, with id as tiebreaker for legacy seeds
// that have an empty timestamp).
export function sortReviewsNewestFirst<T extends { createdAt: string; id: number }>(reviews: T[]): T[] {
  return [...reviews].sort((a, b) => {
    const timeA = Date.parse(a.createdAt) || a.id
    const timeB = Date.parse(b.createdAt) || b.id
    if (timeB !== timeA) return timeB - timeA
    return b.id - a.id
  })
}

export interface Car {
  id: number
  brand: string
  model: string
  category: string
  seats: number
  hasAc: boolean
  transmission: string
  fuel: string
  pricePerDay: number
  pricePerKm: number
  description: string
  image: string
  published: boolean
}

export interface Review {
  id: number
  name: string
  rating: number
  text: string
  location: string
  hidden: boolean
  createdAt: string
}

export interface BookingLocation {
  name: string
  latitude: number
  longitude: number
  formattedAddress?: string
}

export interface Booking {
  id: string
  carId: number
  carName: string
  category: BookingCategory
  customerName?: string
  carType?: string
  mobileNumber: string
  pickupLocation: string | BookingLocation
  dropoffLocation: string | BookingLocation
  pickupDate: string
  tripType: string
  timestamp: string
  status: BookingStatus
  distance?: number
  distanceFare?: number
  estimatedFare?: number
  dropoffDate?: string
  distanceKm?: number
  durationMinutes?: number
}

export interface CarTypePricing {
  carType: string
  baseFare: number
  farePerKm: number
}

export interface Pricing {
  currency: string
  carTypes: CarTypePricing[]
}