import type { Repos } from '../../repos'
import { isRecord } from '../../lib/isRecord'
import { BadRequest } from '../../lib/apiError'
import type { CarTypePricing, Pricing } from '../../domain'

export function createPricingService(repos: Repos) {
  function numberOrNull(value: unknown): number | null {
    const number = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(number) && number >= 0 ? number : null
  }

  return {
    async get(): Promise<Pricing> {
      return repos.pricing.get()
    },

    async update(body: unknown): Promise<Pricing> {
      if (!isRecord(body)) throw BadRequest('Invalid request payload.')
      const rawCarTypes = Array.isArray(body.carTypes) ? body.carTypes : []

      const carTypes: CarTypePricing[] = []
      for (const raw of rawCarTypes) {
        const item = (raw ?? {}) as Partial<CarTypePricing>
        const carType = String(item.carType ?? '').trim()
        const baseFare = numberOrNull(item.baseFare)
        const farePerKm = numberOrNull(item.farePerKm)

        if (!carType || baseFare === null || farePerKm === null) {
          throw BadRequest(
            'Each car type needs a valid name, base fare, and per-kilometer rate.'
          )
        }
        carTypes.push({ carType, baseFare, farePerKm })
      }

      const pricing: Pricing = {
        carTypes,
        currency: String(body.currency ?? 'BDT').trim() || 'BDT',
      }
      return repos.pricing.save(pricing)
    },
  }
}

export type PricingService = ReturnType<typeof createPricingService>