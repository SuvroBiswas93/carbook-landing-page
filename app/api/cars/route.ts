import { NextResponse } from 'next/server'
import { getCars, nextNumericId, saveCars, type Car } from '@/lib/store'

function carFromBody(body: Partial<Car>, id: number): Car {
  return {
    id,
    brand: String(body.brand ?? '').trim(),
    model: String(body.model ?? '').trim(),
    category: String(body.category ?? '').trim(),
    seats: Number(body.seats ?? 4),
    transmission: String(body.transmission ?? 'automatic').trim(),
    fuel: String(body.fuel ?? 'petrol').trim(),
    pricePerDay: Number(body.pricePerDay ?? 0),
    pricePerKm: Number(body.pricePerKm ?? 0),
    description: String(body.description ?? '').trim(),
    image: String(body.image ?? '/placeholder.jpg').trim(),
    published: Boolean(body.published),
  }
}

export async function GET(request: Request) {
  const includeUnpublished = new URL(request.url).searchParams.get('admin') === '1'
  return NextResponse.json(await getCars(includeUnpublished))
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Car>
  const cars = await getCars(true)
  const car = carFromBody(body, nextNumericId(cars))

  if (!car.brand || !car.model || !car.category || !car.image || !car.description) {
    return NextResponse.json({ error: 'Brand, model, category, image, and description are required.' }, { status: 400 })
  }

  cars.push(car)
  await saveCars(cars)
  return NextResponse.json(car, { status: 201 })
}
