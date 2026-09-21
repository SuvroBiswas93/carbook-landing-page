import { NextResponse } from 'next/server'
import { getBookings, saveBookings, type Booking, type BookingStatus } from '@/lib/store'

interface RouteContext {
  params: Promise<{ id: string }>
}

const validStatuses: BookingStatus[] = ['New', 'Called', 'Confirmed', 'Cancelled']

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  const body = (await request.json()) as Partial<Booking>
  const bookings = await getBookings()
  const index = bookings.findIndex((booking) => booking.id === id)

  if (index === -1) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
  }

  const status = validateStatus(body.status)
  if (!status) {
    return NextResponse.json({ error: 'Invalid booking status.' }, { status: 400 })
  }

  bookings[index] = { ...bookings[index], status }
  await saveBookings(bookings)
  return NextResponse.json(bookings[index])
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const bookings = await getBookings()
  const index = bookings.findIndex((booking) => booking.id === id)

  if (index === -1) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
  }

  const [removed] = bookings.splice(index, 1)
  await saveBookings(bookings)
  return NextResponse.json(removed)
}

function validateStatus(value: unknown): BookingStatus | null {
  if (typeof value === 'string' && validStatuses.includes(value as BookingStatus)) {
    return value as BookingStatus
  }
  return null
}