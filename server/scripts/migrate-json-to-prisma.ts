import { PrismaClient, BookingCategory, BookingStatus } from '@prisma/client'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const prisma = new PrismaClient()
const dataDir = path.resolve(process.cwd(), 'data')

async function readJson<T>(fileName: string): Promise<T> {
  return JSON.parse(await fs.readFile(path.join(dataDir, fileName), 'utf8')) as T
}

function locationParts(value: unknown): { name: string; latitude: number | null; longitude: number | null } {
  if (typeof value === 'object' && value !== null && 'name' in value) {
    const location = value as { name?: unknown; latitude?: unknown; longitude?: unknown }
    return {
      name: String(location.name ?? ''),
      latitude: Number.isFinite(Number(location.latitude)) ? Number(location.latitude) : null,
      longitude: Number.isFinite(Number(location.longitude)) ? Number(location.longitude) : null,
    }
  }
  return { name: String(value ?? ''), latitude: null, longitude: null }
}

function bookingCategory(value: unknown, tripType: unknown, hasDropoff: boolean): BookingCategory {
  const raw = String(value ?? '').trim().toLowerCase()
  if (['city', 'hourly', 'intercity', 'airport'].includes(raw)) return raw as BookingCategory
  const type = String(tripType ?? '').toLowerCase()
  if (type.includes('hour')) return BookingCategory.hourly
  if (type.includes('round')) return BookingCategory.intercity
  return hasDropoff ? BookingCategory.city : BookingCategory.hourly
}

function bookingStatus(value: unknown): BookingStatus {
  return ['New', 'Called', 'Confirmed', 'Cancelled'].includes(String(value))
    ? (String(value) as BookingStatus)
    : BookingStatus.New
}

function dateOrNow(value: unknown): Date {
  const date = new Date(String(value ?? ''))
  return Number.isNaN(date.getTime()) ? new Date() : date
}

async function migrateAdmins() {
  const admins = await readJson<Array<Record<string, unknown>>>('admins.json')
  for (const admin of admins) {
    await prisma.admin.upsert({
      where: { id: String(admin.id) },
      update: {
        email: String(admin.email ?? '').trim().toLowerCase(),
        passwordHash: String(admin.passwordHash ?? ''),
        role: String(admin.role ?? 'admin'),
        createdAt: dateOrNow(admin.createdAt),
      },
      create: {
        id: String(admin.id),
        email: String(admin.email ?? '').trim().toLowerCase(),
        passwordHash: String(admin.passwordHash ?? ''),
        role: String(admin.role ?? 'admin'),
        createdAt: dateOrNow(admin.createdAt),
      },
    })
  }
  return admins.length
}

async function migrateSessions() {
  const sessions = await readJson<Array<Record<string, unknown>>>('sessions.json')
  for (const session of sessions) {
    await prisma.refreshToken.upsert({
      where: { id: String(session.id) },
      update: {
        adminId: String(session.adminId),
        tokenHash: String(session.tokenHash),
        createdAt: dateOrNow(session.createdAt),
        expiresAt: new Date(Number(session.expiresAt)),
        lastUsedAt: dateOrNow(session.lastUsedAt),
        revokedAt: session.revokedAt ? dateOrNow(session.revokedAt) : null,
      },
      create: {
        id: String(session.id),
        adminId: String(session.adminId),
        tokenHash: String(session.tokenHash),
        createdAt: dateOrNow(session.createdAt),
        expiresAt: new Date(Number(session.expiresAt)),
        lastUsedAt: dateOrNow(session.lastUsedAt),
        revokedAt: session.revokedAt ? dateOrNow(session.revokedAt) : null,
      },
    })
  }
  return sessions.length
}

async function migrateCars() {
  const cars = await readJson<Array<Record<string, unknown>>>('cars.json')
  for (const car of cars) {
    const data = {
      brand: String(car.brand ?? ''),
      model: String(car.model ?? ''),
      category: String(car.category ?? ''),
      seats: Number(car.seats ?? 4),
      hasAc: Boolean(car.hasAc),
      transmission: String(car.transmission ?? 'automatic'),
      fuel: String(car.fuel ?? 'petrol'),
      pricePerDay: Number(car.pricePerDay ?? 0),
      pricePerKm: Number(car.pricePerKm ?? 0),
      description: String(car.description ?? ''),
      image: String(car.image ?? '/placeholder.jpg'),
      published: car.published !== false,
    }
    await prisma.car.upsert({ where: { id: Number(car.id) }, update: data, create: { id: Number(car.id), ...data } })
  }
  return cars.length
}

async function migrateBookings() {
  const bookings = await readJson<Array<Record<string, unknown>>>('bookings.json')
  for (const booking of bookings) {
    const pickup = locationParts(booking.pickupLocation)
    const dropoff = locationParts(booking.dropoffLocation)
    const data = {
      carId: Number(booking.carId ?? 0),
      carName: String(booking.carName ?? 'Unselected car'),
      category: bookingCategory(booking.category, booking.tripType, Boolean(dropoff.name)),
      customerName: booking.customerName ? String(booking.customerName) : null,
      carType: booking.carType ? String(booking.carType) : null,
      mobileNumber: String(booking.mobileNumber ?? ''),
      pickupName: pickup.name,
      pickupLat: pickup.latitude,
      pickupLng: pickup.longitude,
      dropoffName: dropoff.name || null,
      dropoffLat: dropoff.latitude,
      dropoffLng: dropoff.longitude,
      pickupDate: String(booking.pickupDate ?? ''),
      dropoffDate: booking.dropoffDate ? String(booking.dropoffDate) : null,
      tripType: String(booking.tripType ?? 'One Way'),
      timestamp: String(booking.timestamp ?? ''),
      status: bookingStatus(booking.status),
      distance: booking.distance !== undefined ? Number(booking.distance) : null,
      distanceFare: booking.distanceFare !== undefined ? Number(booking.distanceFare) : null,
      estimatedFare: booking.estimatedFare !== undefined ? Number(booking.estimatedFare) : null,
      distanceKm: booking.distanceKm !== undefined ? Number(booking.distanceKm) : null,
      durationMinutes: booking.durationMinutes !== undefined ? Number(booking.durationMinutes) : null,
      createdAt: dateOrNow(booking.timestamp),
    }
    await prisma.booking.upsert({ where: { id: String(booking.id) }, update: data, create: { id: String(booking.id), ...data } })
  }
  return bookings.length
}

async function migrateReviews() {
  const reviews = await readJson<Array<Record<string, unknown>>>('reviews.json')
  for (const review of reviews) {
    const data = {
      name: String(review.name ?? ''),
      rating: Number(review.rating ?? 5),
      text: String(review.text ?? ''),
      location: String(review.location ?? ''),
      hidden: Boolean(review.hidden),
      createdAt: dateOrNow(review.createdAt),
    }
    await prisma.review.upsert({ where: { id: Number(review.id) }, update: data, create: { id: Number(review.id), ...data } })
  }
  return reviews.length
}

async function migratePricing() {
  const config = await readJson<{ pricing?: { currency?: string; carTypes?: Array<Record<string, unknown>> } }>('config.json')
  for (const tier of config.pricing?.carTypes ?? []) {
    const data = { baseFare: Number(tier.baseFare ?? 0), farePerKm: Number(tier.farePerKm ?? 0) }
    await prisma.pricingTier.upsert({ where: { carType: String(tier.carType) }, update: data, create: { carType: String(tier.carType), ...data } })
  }
  await prisma.setting.upsert({ where: { id: 1 }, update: { currency: config.pricing?.currency ?? 'BDT' }, create: { id: 1, currency: config.pricing?.currency ?? 'BDT' } })
  return config.pricing?.carTypes?.length ?? 0
}

async function main() {
  const counts = {
    admins: await migrateAdmins(),
    sessions: await migrateSessions(),
    cars: await migrateCars(),
    bookings: await migrateBookings(),
    reviews: await migrateReviews(),
    pricingTiers: await migratePricing(),
  }
  console.log('[migrate-json-to-prisma] Imported:', counts)
}

main()
  .catch((error) => {
    console.error('[migrate-json-to-prisma] Failed:', error)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
