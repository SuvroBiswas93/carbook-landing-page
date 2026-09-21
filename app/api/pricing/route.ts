import { NextResponse } from 'next/server'
import {
  getPricing,
  savePricing,
  type CarTypePricing,
  type Pricing,
} from '@/lib/store'

function numberOrNull(value: unknown): number | null {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

export async function GET() {
  return NextResponse.json(await getPricing())
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<Pricing>
  const rawCarTypes = Array.isArray(body.carTypes) ? body.carTypes : []

  const carTypes: CarTypePricing[] = []
  for (const raw of rawCarTypes) {
    const item = (raw ?? {}) as Partial<CarTypePricing>
    const carType = String(item.carType ?? '').trim()
    const baseFare = numberOrNull(item.baseFare)
    const farePerKm = numberOrNull(item.farePerKm)

    if (!carType || baseFare === null || farePerKm === null) {
      return NextResponse.json(
        {
          error:
            'Each car type needs a valid name, base fare, and per-kilometer rate.',
        },
        { status: 400 },
      )
    }

    carTypes.push({ carType, baseFare, farePerKm })
  }

  const pricing: Pricing = {
    carTypes,
    currency: String(body.currency ?? 'BDT').trim() || 'BDT',
  }

  await savePricing(pricing)
  return NextResponse.json(pricing)
}