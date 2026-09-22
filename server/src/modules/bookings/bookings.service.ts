import type { Repos } from '../../repos'
import { isRecord } from '../../lib/isRecord'
import { BadRequest, NotFound } from '../../lib/apiError'
import {
  BOOKING_STATUSES,
  type Booking,
  type BookingCategory,
  type BookingLocation,
  type BookingStatus,
} from '../../domain'
import { normalizeBookingCategory, normalizeBooking } from '../../repos/bookingsRepo'

function normalizeLocation(loc: unknown): string | BookingLocation {
  if (!loc) return ''
  if (
    typeof loc === 'object' &&
    loc !== null &&
    'name' in loc &&
    'latitude' in loc &&
    'longitude' in loc
  ) {
    const { name, latitude, longitude } = loc as Record<string, unknown>
    return { name: String(name), latitude: Number(latitude), longitude: Number(longitude) }
  }
  return String(loc).trim()
}

function locationHasCoordinates(loc: unknown): boolean {
  if (typeof loc === 'object' && loc !== null && 'latitude' in loc && 'longitude' in loc) {
    const { latitude, longitude } = loc as Record<string, unknown>
    const lat = Number(latitude)
    const lng = Number(longitude)
    return !Number.isNaN(lat) && !Number.isNaN(lng)
  }
  return false
}

function isRecordWithStatus(value: unknown): value is { status?: unknown } {
  return typeof value === 'object' && value !== null
}

export function createBookingsService(repos: Repos) {
  function bookingFromBody(body: unknown): Booking {
    if (!isRecord(body)) throw BadRequest('Invalid request payload.')
    const pickupLoc = normalizeLocation(body.pickupLocation)
    const dropoffLoc = normalizeLocation(body.dropoffLocation)
    const category: BookingCategory = normalizeBookingCategory(
      body.category,
      String(body.tripType ?? ''),
      Boolean(body.dropoffLocation)
    )

    const finiteOrUndefined = (value: unknown): number | undefined =>
      Number.isFinite(Number(value)) ? Number(value) : undefined

    return {
      id: `BD-${String(Date.now()).slice(-6)}`,
      carId: Number(body.carId ?? 0),
      carName: String(body.carName ?? 'Unselected car'),
      category,
      customerName: String(body.customerName ?? '').trim(),
      carType: String(body.carType ?? '').trim(),
      mobileNumber: String(body.mobileNumber ?? '').trim(),
      pickupLocation: pickupLoc,
      dropoffLocation: dropoffLoc,
      pickupDate: String(body.pickupDate ?? '').trim(),
      dropoffDate: String(body.dropoffDate ?? '').trim(),
      tripType: String(body.tripType ?? 'One Way').trim(),
      timestamp: new Date().toLocaleString(),
      status: 'New',
      distance: finiteOrUndefined(body.distance),
      distanceFare: finiteOrUndefined(body.distanceFare),
      estimatedFare: finiteOrUndefined(body.estimatedFare),
      distanceKm: finiteOrUndefined(body.distanceKm),
      durationMinutes: finiteOrUndefined(body.durationMinutes),
    }
  }

  return {
    async list() {
      return repos.bookings.list()
    },

    async create(body: unknown) {
      const booking = bookingFromBody(body)

      if (!booking.mobileNumber || !locationHasCoordinates(booking.pickupLocation)) {
        throw BadRequest(
          'Mobile number, pickup location with coordinates, and date are required.'
        )
      }

      if (booking.customerName && !booking.carType) {
        throw BadRequest('Car type is required.')
      }

      if (booking.customerName && !/^01[3-9]\d{8}$/.test(booking.mobileNumber)) {
        throw BadRequest('Enter a valid Bangladesh mobile number.')
      }

      if (booking.customerName && new Date(booking.pickupDate).getTime() < Date.now()) {
        throw BadRequest('Pickup date must be in the future.')
      }

      return repos.bookings.create(booking)
    },

    async updateStatus(id: string, body: unknown) {
      if (!isRecordWithStatus(body)) throw BadRequest('Invalid request payload.')
      const status = body.status as unknown
      if (typeof status !== 'string' || !(BOOKING_STATUSES as string[]).includes(status)) {
        throw BadRequest('Invalid booking status.')
      }
      const updated = await repos.bookings.updateStatus(id, status as BookingStatus)
      if (!updated) throw NotFound('Booking not found.')
      return normalizeBooking(updated)
    },

    async remove(id: string) {
      const removed = await repos.bookings.remove(id)
      if (!removed) throw NotFound('Booking not found.')
      return normalizeBooking(removed)
    },
  }
}

export type BookingsService = ReturnType<typeof createBookingsService>