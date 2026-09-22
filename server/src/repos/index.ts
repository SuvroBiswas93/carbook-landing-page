import { env } from '../config/env'
import type { CarsRepo } from './carsRepo'
import type { BookingsRepo } from './bookingsRepo'
import type { ReviewsRepo } from './reviewsRepo'
import type { PricingRepo } from './pricingRepo'
import type { AdminsRepo } from './adminsRepo'
import type { SessionsRepo } from './sessionsRepo'
import { jsonCarsRepo } from './carsRepo'
import { jsonBookingsRepo } from './bookingsRepo'
import { jsonReviewsRepo } from './reviewsRepo'
import { jsonPricingRepo } from './pricingRepo'
import { jsonAdminsRepo } from './adminsRepo'
import { jsonSessionsRepo } from './sessionsRepo'

export interface Repos {
  cars: CarsRepo
  bookings: BookingsRepo
  reviews: ReviewsRepo
  pricing: PricingRepo
  admins: AdminsRepo
  sessions: SessionsRepo
}

export function createRepos(source: 'json' | 'prisma' = env.DATA_SOURCE): Repos {
  if (source === 'prisma') {
    throw new Error(
      'Prisma data source is not active yet. Keep DATA_SOURCE=json until Prisma + MySQL are wired up.'
    )
  }
  return {
    cars: jsonCarsRepo,
    bookings: jsonBookingsRepo,
    reviews: jsonReviewsRepo,
    pricing: jsonPricingRepo,
    admins: jsonAdminsRepo,
    sessions: jsonSessionsRepo,
  }
}