import { promises as fs } from 'fs'
import path from 'path'

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'

export interface Car {
  id: number
  brand: string
  model: string
  category: string
  seats: number
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

export interface Booking {
  id: string
  carId: number
  carName: string
  mobileNumber: string
  pickupLocation: string
  dropoffLocation: string
  pickupDate: string
  tripType: string
  timestamp: string
  status: BookingStatus
  distance?: number
  distanceFare?: number
  estimatedFare?: number
  dropoffDate?: string
}

export interface Pricing {
  farePerKm: number
  minimumFare: number
  currency: string
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
  return readJson<Booking[]>('bookings.json', [])
}

export async function saveBookings(bookings: Booking[]): Promise<void> {
  await writeJson('bookings.json', bookings)
}

export async function getPricing(): Promise<Pricing> {
  const config = await readJson<Partial<AppConfig>>('config.json', {})
  const pricing = (config.pricing ?? {}) as Partial<Pricing>

  return {
    farePerKm: Number.isFinite(Number(pricing.farePerKm)) && Number(pricing.farePerKm) >= 0 ? Number(pricing.farePerKm) : 5,
    minimumFare: Number.isFinite(Number(pricing.minimumFare)) && Number(pricing.minimumFare) >= 0 ? Number(pricing.minimumFare) : 25,
    currency: String(pricing.currency ?? 'USD'),
  }
}

export async function savePricing(pricing: Pricing): Promise<void> {
  const config = await readJson<Record<string, unknown>>('config.json', {})
  await writeJson('config.json', { ...config, pricing })
}

export function nextNumericId(items: { id: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}
