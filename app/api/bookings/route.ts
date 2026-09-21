import { NextResponse } from 'next/server'
import { getBookings, saveBookings, type Booking, type BookingLocation } from '@/lib/store'

function normalizeLocation(loc: unknown): string | BookingLocation {
  if (!loc) return ''
  if (typeof loc === 'object' && loc !== null && 'name' in loc && 'latitude' in loc && 'longitude' in loc) {
    const { name, latitude, longitude } = loc as Record<string, unknown>
    return { name: String(name), latitude: Number(latitude), longitude: Number(longitude) }
  }
  return String(loc).trim()
}

function locationHasCoordinates(loc: unknown): boolean {
  if (typeof loc === 'object' && loc !== null && 'latitude' in loc && 'longitude' in loc) {
    const { latitude, longitude } = loc as Record<string, unknown>
    return typeof Number(latitude) === 'number' && typeof Number(longitude) === 'number'
      && !isNaN(Number(latitude)) && !isNaN(Number(longitude))
  }
  return false
}

function locationToString(loc: unknown): string {
  if (typeof loc === 'object' && loc !== null && 'name' in loc) {
    return String((loc as Record<string, unknown>).name)
  }
  return String(loc ?? '')
}

export async function GET() {
  return NextResponse.json(await getBookings())
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Booking>
  const pickupLoc = normalizeLocation(body.pickupLocation)
  const dropoffLoc = normalizeLocation(body.dropoffLocation)
  const booking: Booking = {
    id: `BD-${String(Date.now()).slice(-6)}`,
    carId: Number(body.carId ?? 0),
    carName: String(body.carName ?? 'Unselected car'),
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
    distance: Number.isFinite(Number(body.distance)) ? Number(body.distance) : undefined,
    distanceFare: Number.isFinite(Number(body.distanceFare)) ? Number(body.distanceFare) : undefined,
    estimatedFare: Number.isFinite(Number(body.estimatedFare)) ? Number(body.estimatedFare) : undefined,
    distanceKm: Number.isFinite(Number(body.distanceKm)) ? Number(body.distanceKm) : undefined,
    durationMinutes: Number.isFinite(Number(body.durationMinutes)) ? Number(body.durationMinutes) : undefined,
  }

  if (!booking.mobileNumber || !locationHasCoordinates(pickupLoc)) {
    return NextResponse.json({ error: 'Mobile number, pickup location with coordinates, and date are required.' }, { status: 400 })
  }

  if (booking.customerName && !booking.carType) {
    return NextResponse.json({ error: 'Car type is required.' }, { status: 400 })
  }

  if (booking.customerName && !/^01[3-9]\d{8}$/.test(booking.mobileNumber)) {
    return NextResponse.json({ error: 'Enter a valid Bangladesh mobile number.' }, { status: 400 })
  }

  if (booking.customerName && new Date(booking.pickupDate).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Pickup date must be in the future.' }, { status: 400 })
  }

  const bookings = await getBookings()
  bookings.push(booking)
  await saveBookings(bookings)
  return NextResponse.json(booking, { status: 201 })
}
