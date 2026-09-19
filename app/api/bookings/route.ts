import { NextResponse } from 'next/server'
import { getBookings, saveBookings, type Booking } from '@/lib/store'

export async function GET() {
  return NextResponse.json(await getBookings())
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Booking>
  const booking: Booking = {
    id: `BD-${String(Date.now()).slice(-6)}`,
    carId: Number(body.carId ?? 0),
    carName: String(body.carName ?? 'Unselected car'),
    mobileNumber: String(body.mobileNumber ?? '').trim(),
    pickupLocation: String(body.pickupLocation ?? '').trim(),
    dropoffLocation: String(body.dropoffLocation ?? '').trim(),
    pickupDate: String(body.pickupDate ?? '').trim(),
    dropoffDate: String(body.dropoffDate ?? '').trim(),
    tripType: String(body.tripType ?? 'One Way').trim(),
    timestamp: new Date().toLocaleString(),
    status: 'Pending',
    distance: Number.isFinite(Number(body.distance)) ? Number(body.distance) : undefined,
    distanceFare: Number.isFinite(Number(body.distanceFare)) ? Number(body.distanceFare) : undefined,
    estimatedFare: Number.isFinite(Number(body.estimatedFare)) ? Number(body.estimatedFare) : undefined,
  }

  if (!booking.mobileNumber || !booking.pickupLocation || !booking.dropoffLocation || !booking.pickupDate) {
    return NextResponse.json({ error: 'Mobile number, pickup, drop-off, and date are required.' }, { status: 400 })
  }

  const bookings = await getBookings()
  bookings.push(booking)
  await saveBookings(bookings)
  return NextResponse.json(booking, { status: 201 })
}
