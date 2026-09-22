export type BookingStatus = 'New' | 'Called' | 'Confirmed' | 'Cancelled'

export type BookingCategory = 'city' | 'hourly' | 'intercity' | 'airport'

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