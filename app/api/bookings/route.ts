import { NextResponse } from 'next/server'
import { getBookings, saveBookings, normalizeBookingCategory, type Booking } from '@/lib/store'

export async function GET() {
  return NextResponse.json(await getBookings())
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Booking>
  const hasDropoff = Boolean(String(body.dropoffLocation ?? '').trim())
  const tripType = String(body.tripType ?? 'One Way').trim()
  const booking: Booking = {
    id: `BD-${String(Date.now()).slice(-6)}`,
    carId: Number(body.carId ?? 0),
    carName: String(body.carName ?? 'Unselected car'),
    category: normalizeBookingCategory(body.category, tripType, hasDropoff),
    customerName: String(body.customerName ?? '').trim(),
    carType: String(body.carType ?? '').trim(),
    mobileNumber: String(body.mobileNumber ?? '').trim(),
    pickupLocation: String(body.pickupLocation ?? '').trim(),
    dropoffLocation: String(body.dropoffLocation ?? '').trim(),
    pickupDate: String(body.pickupDate ?? '').trim(),
    dropoffDate: String(body.dropoffDate ?? '').trim(),
    tripType,
    timestamp: new Date().toLocaleString(),
    status: 'New',
    distance: Number.isFinite(Number(body.distance)) ? Number(body.distance) : undefined,
    distanceFare: Number.isFinite(Number(body.distanceFare)) ? Number(body.distanceFare) : undefined,
    estimatedFare: Number.isFinite(Number(body.estimatedFare)) ? Number(body.estimatedFare) : undefined,
  }

  if (!booking.mobileNumber || !booking.pickupLocation || !booking.pickupDate) {
    return NextResponse.json({ error: 'Mobile number, pickup, and date are required.' }, { status: 400 })
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
