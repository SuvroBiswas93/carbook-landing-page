import { readJson, writeJson } from '../lib/jsonStore'
import {
  BOOKING_STATUSES,
  VALID_BOOKING_CATEGORIES,
  type Booking,
  type BookingCategory,
  type BookingLocation,
  type BookingStatus,
} from '../domain'

export interface BookingsRepo {
  list(): Promise<Booking[]>
  create(booking: Booking): Promise<Booking>
  updateStatus(id: string, status: BookingStatus): Promise<Booking | null>
  remove(id: string): Promise<Booking | null>
}

export function normalizeBookingCategory(
  raw: unknown,
  tripType = '',
  hasDropoff = true
): BookingCategory {
  const rawValue = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  const value = (VALID_BOOKING_CATEGORIES as string[]).includes(rawValue)
    ? (rawValue as BookingCategory)
    : null
  if (value) return value
  const type = String(tripType ?? '').toLowerCase()
  if (type.includes('hour')) return 'hourly'
  if (type.includes('round')) return 'intercity'
  if (!hasDropoff) return 'hourly'
  return 'city'
}

export function normalizeBooking(raw: Partial<Booking>): Booking {
  return {
    id: String(raw.id ?? ''),
    carId: Number(raw.carId ?? 0),
    carName: String(raw.carName ?? 'Unselected car'),
    category: normalizeBookingCategory(
      raw.category,
      String(raw.tripType ?? ''),
      Boolean(raw.dropoffLocation)
    ),
    customerName: raw.customerName ? String(raw.customerName) : undefined,
    carType: raw.carType ? String(raw.carType) : undefined,
    mobileNumber: String(raw.mobileNumber ?? ''),
    pickupLocation:
      typeof raw.pickupLocation === 'object' && raw.pickupLocation !== null
        ? String((raw.pickupLocation as BookingLocation).name)
        : String(raw.pickupLocation ?? ''),
    dropoffLocation:
      typeof raw.dropoffLocation === 'object' && raw.dropoffLocation !== null
        ? String((raw.dropoffLocation as BookingLocation).name)
        : String(raw.dropoffLocation ?? ''),
    pickupDate: String(raw.pickupDate ?? ''),
    dropoffDate: raw.dropoffDate ? String(raw.dropoffDate) : undefined,
    tripType: String(raw.tripType ?? 'One Way'),
    timestamp: String(raw.timestamp ?? ''),
    status: BOOKING_STATUSES.includes(raw.status as BookingStatus)
      ? (raw.status as BookingStatus)
      : 'New',
    distance: raw.distance !== undefined ? Number(raw.distance) : undefined,
    distanceFare: raw.distanceFare !== undefined ? Number(raw.distanceFare) : undefined,
    estimatedFare: raw.estimatedFare !== undefined ? Number(raw.estimatedFare) : undefined,
    distanceKm: raw.distanceKm !== undefined ? Number(raw.distanceKm) : undefined,
    durationMinutes: raw.durationMinutes !== undefined ? Number(raw.durationMinutes) : undefined,
  }
}

export const jsonBookingsRepo: BookingsRepo = {
  async list() {
    const bookings = await readJson<Partial<Booking>[]>('bookings.json', [])
    return bookings.map(normalizeBooking)
  },

  async create(booking) {
    const bookings = await readJson<Partial<Booking>[]>('bookings.json', [])
    bookings.push(booking)
    await writeJson('bookings.json', bookings)
    return booking
  },

  async updateStatus(id, status) {
    const bookings = await readJson<Partial<Booking>[]>('bookings.json', [])
    const index = bookings.findIndex((item) => String(item.id) === id)
    if (index === -1) return null
    const updated: Booking = { ...normalizeBooking(bookings[index]), status }
    bookings[index] = updated
    await writeJson('bookings.json', bookings)
    return updated
  },

  async remove(id) {
    const bookings = await readJson<Partial<Booking>[]>('bookings.json', [])
    const index = bookings.findIndex((item) => String(item.id) === id)
    if (index === -1) return null
    const [removed] = bookings.splice(index, 1)
    await writeJson('bookings.json', bookings)
    return normalizeBooking(removed)
  },
}