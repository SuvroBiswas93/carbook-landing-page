import { DEFAULT_BASE_FARE, DEFAULT_FARE_PER_KM } from '@/lib/pricing'

export interface FareEstimate {
  baseFare: number
  distanceFare: number
  totalFare: number
  distanceKm: number
}

export class FareCalculationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FareCalculationError'
  }
}

export function calculateFare(
  car: { pricePerDay: number; pricePerKm: number },
  distanceKm: number,
): FareEstimate {
  const rate = Number(car.pricePerKm ?? DEFAULT_FARE_PER_KM)
  const baseFare = Number(car.pricePerDay ?? DEFAULT_BASE_FARE)

  if (!Number.isFinite(rate) || rate < 0 || !Number.isFinite(baseFare) || baseFare < 0) {
    throw new FareCalculationError('Pricing is temporarily unavailable')
  }

  const distanceFare = distanceKm * rate
  const totalFare = Math.max(baseFare, distanceFare)

  return { baseFare, distanceFare, totalFare, distanceKm }
}