import { promises as fs } from 'fs'
import path from 'path'
import { DEFAULT_BASE_FARE, DEFAULT_FARE_PER_KM } from './pricing'

export type BookingStatus = 'New' | 'Called' | 'Confirmed' | 'Cancelled'

export type BookingCategory = 'city' | 'hourly' | 'intercity' | 'airport'

const VALID_BOOKING_CATEGORIES: BookingCategory[] = ['city', 'hourly', 'intercity', 'airport']

export function normalizeBookingCategory(
  raw: unknown,
  tripType = '',
  hasDropoff = true
): BookingCategory {
  const rawValue = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  const value: BookingCategory | null = (VALID_BOOKING_CATEGORIES as string[]).includes(rawValue)
    ? (rawValue as BookingCategory)
    : null
  if (value) return value
  const type = String(tripType ?? '').toLowerCase()
  if (type.includes('hour')) return 'hourly'
  if (type.includes('round')) return 'intercity'
  if (!hasDropoff) return 'hourly'
  return 'city'
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

interface AppConfig {
  pricing: Pricing
}

const dataDir = path.join(process.cwd(), 'data')

async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const file = await fs.readFile(path.join(dataDir, fileName), 'utf8')
    return JSON.parse(file) as T
  } catch {
    return fallback
  }
}

async function writeJson<T>(fileName: string, data: T): Promise<void> {
  await fs.writeFile(path.join(dataDir, fileName), `${JSON.stringify(data, null, 2)}\n`)
}

export async function getCars(includeUnpublished = false): Promise<Car[]> {
  const cars = await readJson<Partial<Car>[]>('cars.json', [])
  const normalized = cars.map((car) => ({
    id: Number(car.id),
    brand: String(car.brand ?? ''),
    model: String(car.model ?? ''),
    category: String(car.category ?? ''),
    seats: Number(car.seats ?? 4),
    hasAc: car.hasAc ?? true,
    transmission: String(car.transmission ?? 'automatic'),
    fuel: String(car.fuel ?? 'petrol'),
    pricePerDay: Number(car.pricePerDay ?? 0),
    pricePerKm: Number(car.pricePerKm ?? 0),
    description: String(car.description ?? ''),
    image: String(car.image ?? '/placeholder.jpg'),
    published: car.published ?? true,
  }))

  return includeUnpublished ? normalized : normalized.filter((car) => car.published)
}

export async function saveCars(cars: Car[]): Promise<void> {
  await writeJson('cars.json', cars)
}

export async function getReviews(includeHidden = false): Promise<Review[]> {
  const reviews = await readJson<Partial<Review>[]>('reviews.json', [])
  const normalized = reviews.map((review) => ({
    id: Number(review.id),
    name: String(review.name ?? ''),
    rating: Math.min(5, Math.max(1, Number(review.rating ?? 5))),
    text: String(review.text ?? ''),
    location: String(review.location ?? ''),
    hidden: review.hidden ?? false,
    createdAt: String(review.createdAt ?? ''),
  }))

  return includeHidden ? normalized : normalized.filter((review) => !review.hidden)
}

export async function saveReviews(reviews: Review[]): Promise<void> {
  await writeJson('reviews.json', reviews)
}

export async function getBookings(): Promise<Booking[]> {
  const bookings = await readJson<Partial<Booking>[]>('bookings.json', [])
  const validStatuses: BookingStatus[] = ['New', 'Called', 'Confirmed', 'Cancelled']

  return bookings.map((booking) => ({
    id: String(booking.id ?? ''),
    carId: Number(booking.carId ?? 0),
    carName: String(booking.carName ?? 'Unselected car'),
    category: normalizeBookingCategory(
      booking.category,
      String(booking.tripType ?? ''),
      Boolean(booking.dropoffLocation)
    ),
    customerName: booking.customerName ? String(booking.customerName) : undefined,
    carType: booking.carType ? String(booking.carType) : undefined,
    mobileNumber: String(booking.mobileNumber ?? ''),
    pickupLocation: typeof booking.pickupLocation === 'object' && booking.pickupLocation !== null
      ? `${booking.pickupLocation.name}`
      : String(booking.pickupLocation ?? ''),
    dropoffLocation: typeof booking.dropoffLocation === 'object' && booking.dropoffLocation !== null
      ? `${booking.dropoffLocation.name}`
      : String(booking.dropoffLocation ?? ''),
    pickupDate: String(booking.pickupDate ?? ''),
    dropoffDate: booking.dropoffDate ? String(booking.dropoffDate) : undefined,
    tripType: String(booking.tripType ?? 'One Way'),
    timestamp: String(booking.timestamp ?? ''),
    status: validStatuses.includes(booking.status as BookingStatus)
      ? (booking.status as BookingStatus)
      : 'New',
    distance: booking.distance !== undefined ? Number(booking.distance) : undefined,
    distanceFare: booking.distanceFare !== undefined ? Number(booking.distanceFare) : undefined,
    estimatedFare: booking.estimatedFare !== undefined ? Number(booking.estimatedFare) : undefined,
    distanceKm: booking.distanceKm !== undefined ? Number(booking.distanceKm) : undefined,
    durationMinutes: booking.durationMinutes !== undefined ? Number(booking.durationMinutes) : undefined,
  }))
}

export async function saveBookings(bookings: Booking[]): Promise<void> {
  await writeJson('bookings.json', bookings)
}

function normalizeCarTypePricing(value: unknown): CarTypePricing | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Partial<CarTypePricing>
  const carType = String(item.carType ?? '').trim()
  const baseFare = Number(item.baseFare)
  const farePerKm = Number(item.farePerKm)
  if (!carType) return null
  return {
    carType,
    baseFare:
      Number.isFinite(baseFare) && baseFare >= 0 ? baseFare : DEFAULT_BASE_FARE,
    farePerKm:
      Number.isFinite(farePerKm) && farePerKm >= 0
        ? farePerKm
        : DEFAULT_FARE_PER_KM,
  }
}

export async function getPricing(): Promise<Pricing> {
  const config = await readJson<Partial<AppConfig>>('config.json', {})
  const pricing = (config.pricing ?? {}) as Partial<Pricing>

  const rawCarTypes = pricing.carTypes
  const carTypes = Array.isArray(rawCarTypes)
    ? rawCarTypes
        .map(normalizeCarTypePricing)
        .filter((item): item is CarTypePricing => item !== null)
    : []

  return {
    carTypes,
    currency: String(pricing.currency ?? 'BDT') || 'BDT',
  }
}

export async function savePricing(pricing: Pricing): Promise<void> {
  const config = await readJson<Record<string, unknown>>('config.json', {})
  const carTypes = (pricing.carTypes ?? [])
    .map(normalizeCarTypePricing)
    .filter((item): item is CarTypePricing => item !== null)
  await writeJson('config.json', {
    ...config,
    pricing: { currency: String(pricing.currency ?? 'BDT') || 'BDT', carTypes },
  })
}

export function nextNumericId(items: { id: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}
