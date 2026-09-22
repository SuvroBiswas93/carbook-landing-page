import { readJson, writeJson } from '../lib/jsonStore'
import { DEFAULT_BASE_FARE, DEFAULT_FARE_PER_KM, type CarTypePricing, type Pricing } from '../domain'

export interface PricingRepo {
  get(): Promise<Pricing>
  save(pricing: Pricing): Promise<Pricing>
}

function normalizeCarTypePricing(value: unknown): CarTypePricing | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Partial<CarTypePricing>
  const carType = String(item.carType ?? '').trim()
  const baseFare = Number(item.baseFare)
  const farePerKm = Number(item.farePerKm)
  if (!carType) return null
  return {
    carType,
    baseFare: Number.isFinite(baseFare) && baseFare >= 0 ? baseFare : DEFAULT_BASE_FARE,
    farePerKm:
      Number.isFinite(farePerKm) && farePerKm >= 0 ? farePerKm : DEFAULT_FARE_PER_KM,
  }
}

export const jsonPricingRepo: PricingRepo = {
  async get() {
    const config = await readJson<{ pricing?: Partial<Pricing> }>('config.json', {})
    const pricing = (config.pricing ?? {}) as Partial<Pricing>
    const carTypes = Array.isArray(pricing.carTypes)
      ? pricing.carTypes
          .map(normalizeCarTypePricing)
          .filter((item): item is CarTypePricing => item !== null)
      : []
    return {
      carTypes,
      currency: String(pricing.currency ?? 'BDT') || 'BDT',
    }
  },

  async save(pricing) {
    const config = await readJson<Record<string, unknown>>('config.json', {})
    const carTypes = (pricing.carTypes ?? [])
      .map(normalizeCarTypePricing)
      .filter((item): item is CarTypePricing => item !== null)
    const saved: Pricing = {
      currency: String(pricing.currency ?? 'BDT') || 'BDT',
      carTypes,
    }
    await writeJson('config.json', { ...config, pricing: saved })
    return saved
  },
}