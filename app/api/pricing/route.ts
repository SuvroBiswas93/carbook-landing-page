import { NextResponse } from 'next/server'
import { getPricing, savePricing, type Pricing } from '@/lib/store'

function numberOrNull(value: unknown): number | null {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

export async function GET() {
  return NextResponse.json(await getPricing())
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<Pricing>
  const farePerKm = numberOrNull(body.farePerKm)
  const minimumFare = numberOrNull(body.minimumFare)

  if (farePerKm === null || minimumFare === null) {
    return NextResponse.json(
      { error: 'Per-kilometer rate and minimum fare must be valid non-negative numbers.' },
      { status: 400 },
    )
  }

  const pricing: Pricing = {
    farePerKm,
    minimumFare,
    currency: String(body.currency ?? 'USD').trim() || 'USD',
  }

  await savePricing(pricing)
  return NextResponse.json(pricing)
}
