import { BookingCategory, BookingStatus as PrismaBookingStatus } from '@prisma/client'
import type {
  AdminUser,
  Booking,
  BookingCategory as DomainBookingCategory,
  BookingLocation,
  BookingStatus,
  Car,
  CarTypePricing,
  Pricing,
  Review,
  Session,
} from '../domain'
import { DEFAULT_BASE_FARE, DEFAULT_FARE_PER_KM } from '../domain'
import type { AdminsRepo } from './adminsRepo'
import type { BookingsRepo } from './bookingsRepo'
import type { CarsRepo } from './carsRepo'
import type { PricingRepo } from './pricingRepo'
import type { ReviewsRepo } from './reviewsRepo'
import type { SessionsRepo } from './sessionsRepo'
import { normalizeBookingCategory } from './bookingsRepo'
import { prisma } from './prismaClient'

function adminFromRow(row: { id: string; email: string; passwordHash: string; role: string; createdAt: Date }): AdminUser {
  return { id: row.id, email: row.email, passwordHash: row.passwordHash, role: row.role, createdAt: row.createdAt.toISOString() }
}

function sessionFromRow(row: { id: string; adminId: string; tokenHash: string; createdAt: Date; expiresAt: Date; lastUsedAt: Date; revokedAt: Date | null }): Session {
  return {
    id: row.id,
    adminId: row.adminId,
    tokenHash: row.tokenHash,
    createdAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt.getTime(),
    lastUsedAt: row.lastUsedAt.toISOString(),
    revokedAt: row.revokedAt?.toISOString() ?? null,
  }
}

function carFromRow(row: Car): Car {
  return { ...row, id: Number(row.id), pricePerDay: Number(row.pricePerDay), pricePerKm: Number(row.pricePerKm) }
}

function reviewFromRow(row: { id: number; name: string; rating: number; text: string; location: string; hidden: boolean; createdAt: Date }): Review {
  return {
    id: row.id,
    name: row.name,
    rating: Math.min(5, Math.max(1, row.rating)),
    text: row.text,
    location: row.location,
    hidden: row.hidden,
    createdAt: row.createdAt.toISOString(),
  }
}

function locationParts(value: string | BookingLocation): { name: string; latitude: number | null; longitude: number | null } {
  if (typeof value === 'string') return { name: value, latitude: null, longitude: null }
  return { name: value.name, latitude: value.latitude, longitude: value.longitude }
}

function locationFromParts(name: string | null, latitude: number | null, longitude: number | null): string | BookingLocation {
  if (name === null) return ''
  if (latitude !== null && longitude !== null) return { name, latitude, longitude }
  return name
}

function bookingFromRow(row: {
  id: string; carId: number; carName: string; category: DomainBookingCategory; customerName: string | null; carType: string | null
  mobileNumber: string; pickupName: string; pickupLat: number | null; pickupLng: number | null; dropoffName: string | null
  dropoffLat: number | null; dropoffLng: number | null; pickupDate: string; dropoffDate: string | null; tripType: string
  timestamp: string; status: BookingStatus; distance: number | null; distanceFare: number | null; estimatedFare: number | null
  distanceKm: number | null; durationMinutes: number | null
}): Booking {
  return {
    id: row.id,
    carId: row.carId,
    carName: row.carName,
    category: row.category,
    customerName: row.customerName ?? undefined,
    carType: row.carType ?? undefined,
    mobileNumber: row.mobileNumber,
    pickupLocation: locationFromParts(row.pickupName, row.pickupLat, row.pickupLng),
    dropoffLocation: locationFromParts(row.dropoffName, row.dropoffLat, row.dropoffLng),
    pickupDate: row.pickupDate,
    dropoffDate: row.dropoffDate ?? undefined,
    tripType: row.tripType,
    timestamp: row.timestamp,
    status: row.status,
    distance: row.distance ?? undefined,
    distanceFare: row.distanceFare ?? undefined,
    estimatedFare: row.estimatedFare ?? undefined,
    distanceKm: row.distanceKm ?? undefined,
    durationMinutes: row.durationMinutes ?? undefined,
  }
}

function normalizePricing(value: Partial<CarTypePricing>): CarTypePricing | null {
  const carType = String(value.carType ?? '').trim()
  if (!carType) return null
  const baseFare = Number(value.baseFare)
  const farePerKm = Number(value.farePerKm)
  return {
    carType,
    baseFare: Number.isFinite(baseFare) && baseFare >= 0 ? baseFare : DEFAULT_BASE_FARE,
    farePerKm: Number.isFinite(farePerKm) && farePerKm >= 0 ? farePerKm : DEFAULT_FARE_PER_KM,
  }
}

export const prismaAdminsRepo: AdminsRepo = {
  async list() { return (await prisma.admin.findMany({ orderBy: { createdAt: 'asc' } })).map(adminFromRow) },
  async getById(id) { const row = await prisma.admin.findUnique({ where: { id } }); return row ? adminFromRow(row) : null },
  async getByEmail(email) { const row = await prisma.admin.findUnique({ where: { email: email.trim().toLowerCase() } }); return row ? adminFromRow(row) : null },
  async create(admin) { return adminFromRow(await prisma.admin.create({ data: { ...admin, email: admin.email.trim().toLowerCase(), createdAt: new Date(admin.createdAt) } })) },
}

export const prismaSessionsRepo: SessionsRepo = {
  async getById(id) { const row = await prisma.refreshToken.findUnique({ where: { id } }); return row ? sessionFromRow(row) : null },
  async create(session) {
    return sessionFromRow(await prisma.refreshToken.create({ data: { ...session, createdAt: new Date(session.createdAt), expiresAt: new Date(session.expiresAt), lastUsedAt: new Date(session.lastUsedAt), revokedAt: null } }))
  },
  async revoke(id) { await prisma.refreshToken.updateMany({ where: { id }, data: { revokedAt: new Date() } }) },
  async revokeAllForAdmin(adminId) { await prisma.refreshToken.updateMany({ where: { adminId, revokedAt: null }, data: { revokedAt: new Date() } }) },
  async prune(now = Date.now()) {
    const retention = 30 * 24 * 60 * 60 * 1000
    await prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date(now) }, OR: [{ revokedAt: null }, { revokedAt: { lt: new Date(now - retention) } }] } })
  },
}

export const prismaCarsRepo: CarsRepo = {
  async list(includeUnpublished = false) {
    return (await prisma.car.findMany({ where: includeUnpublished ? undefined : { published: true }, orderBy: { id: 'asc' } })).map(carFromRow)
  },
  async getById(id) { const row = await prisma.car.findUnique({ where: { id } }); return row ? carFromRow(row) : null },
  async create(car) { return carFromRow(await prisma.car.create({ data: car })) },
  async update(id, patch) {
    const current = await prisma.car.findUnique({ where: { id } })
    if (!current) return null
    const data = {
      brand: patch.brand === undefined ? current.brand : String(patch.brand).trim(),
      model: patch.model === undefined ? current.model : String(patch.model).trim(),
      category: patch.category === undefined ? current.category : String(patch.category).trim(),
      seats: patch.seats === undefined ? current.seats : Number(patch.seats),
      hasAc: patch.hasAc === undefined ? current.hasAc : patch.hasAc,
      transmission: patch.transmission === undefined ? current.transmission : String(patch.transmission).trim(),
      fuel: patch.fuel === undefined ? current.fuel : String(patch.fuel).trim(),
      pricePerDay: patch.pricePerDay === undefined ? current.pricePerDay : Number(patch.pricePerDay),
      pricePerKm: patch.pricePerKm === undefined ? current.pricePerKm : Number(patch.pricePerKm),
      description: patch.description === undefined ? current.description : String(patch.description).trim(),
      image: patch.image === undefined ? current.image : String(patch.image).trim(),
      published: patch.published === undefined ? current.published : patch.published,
    }
    return carFromRow(await prisma.car.update({ where: { id }, data }))
  },
  async remove(id) { const result = await prisma.car.deleteMany({ where: { id } }); return result.count > 0 },
}

export const prismaBookingsRepo: BookingsRepo = {
  async list() {
    const rows = await prisma.booking.findMany({ orderBy: [{ createdAt: 'desc' }, { timestamp: 'desc' }] })
    return rows.map(bookingFromRow)
  },
  async create(booking) {
    const pickup = locationParts(booking.pickupLocation)
    const dropoff = locationParts(booking.dropoffLocation)
    const row = await prisma.booking.create({ data: {
      id: booking.id, carId: booking.carId, carName: booking.carName, category: booking.category as BookingCategory,
      customerName: booking.customerName ?? null, carType: booking.carType ?? null, mobileNumber: booking.mobileNumber,
      pickupName: pickup.name, pickupLat: pickup.latitude, pickupLng: pickup.longitude,
      dropoffName: dropoff.name || null, dropoffLat: dropoff.latitude, dropoffLng: dropoff.longitude,
      pickupDate: booking.pickupDate, dropoffDate: booking.dropoffDate ?? null, tripType: booking.tripType,
      timestamp: booking.timestamp, status: booking.status as PrismaBookingStatus,
      distance: booking.distance ?? null, distanceFare: booking.distanceFare ?? null, estimatedFare: booking.estimatedFare ?? null,
      distanceKm: booking.distanceKm ?? null, durationMinutes: booking.durationMinutes ?? null,
    } })
    return bookingFromRow(row)
  },
  async updateStatus(id, status) {
    const result = await prisma.booking.updateMany({ where: { id }, data: { status: status as PrismaBookingStatus } })
    if (!result.count) return null
    const row = await prisma.booking.findUnique({ where: { id } })
    return row ? bookingFromRow(row) : null
  },
  async remove(id) {
    const row = await prisma.booking.findUnique({ where: { id } })
    if (!row) return null
    await prisma.booking.delete({ where: { id } })
    return bookingFromRow(row)
  },
}

export const prismaReviewsRepo: ReviewsRepo = {
  async list(includeHidden = false) { return (await prisma.review.findMany({ where: includeHidden ? undefined : { hidden: false }, orderBy: { createdAt: 'desc' } })).map(reviewFromRow) },
  async create(review) { return reviewFromRow(await prisma.review.create({ data: { ...review, createdAt: new Date(review.createdAt) } })) },
  async update(id, patch) {
    const current = await prisma.review.findUnique({ where: { id } })
    if (!current) return null
    const requestedRating = Number(patch.rating ?? current.rating)
    return reviewFromRow(await prisma.review.update({ where: { id }, data: {
      name: patch.name === undefined ? current.name : String(patch.name).trim(),
      rating: Number.isFinite(requestedRating) ? Math.min(5, Math.max(1, requestedRating)) : current.rating,
      text: patch.text === undefined ? current.text : String(patch.text).trim(),
      location: patch.location === undefined ? current.location : String(patch.location).trim(),
      hidden: typeof patch.hidden === 'boolean' ? patch.hidden : current.hidden,
    } }))
  },
  async remove(id) { const result = await prisma.review.deleteMany({ where: { id } }); return result.count > 0 },
}

export const prismaPricingRepo: PricingRepo = {
  async get() {
    const [setting, tiers] = await Promise.all([prisma.setting.findUnique({ where: { id: 1 } }), prisma.pricingTier.findMany({ orderBy: { id: 'asc' } })])
    return { currency: setting?.currency ?? 'BDT', carTypes: tiers.map((tier) => normalizePricing(tier)).filter((item): item is CarTypePricing => item !== null) }
  },
  async save(pricing: Pricing) {
    const carTypes = pricing.carTypes.map(normalizePricing).filter((item): item is CarTypePricing => item !== null)
    await prisma.$transaction(async (tx) => {
      await tx.setting.upsert({ where: { id: 1 }, update: { currency: String(pricing.currency || 'BDT') }, create: { id: 1, currency: String(pricing.currency || 'BDT') } })
      await tx.pricingTier.deleteMany()
      if (carTypes.length) await tx.pricingTier.createMany({ data: carTypes })
    })
    return { currency: String(pricing.currency || 'BDT'), carTypes }
  },
}
