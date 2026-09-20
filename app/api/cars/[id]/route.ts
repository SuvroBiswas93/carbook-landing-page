import { NextResponse } from 'next/server'
import { getCars, saveCars, type Car } from '@/lib/store'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params
  const carId = Number(id)
  const body = (await request.json()) as Partial<Car>
  const cars = await getCars(true)
  const index = cars.findIndex((car) => car.id === carId)

  if (index === -1) {
    return NextResponse.json({ error: 'Car not found.' }, { status: 404 })
  }

  const updated: Car = {
    ...cars[index],
    brand: String(body.brand ?? cars[index].brand).trim(),
    model: String(body.model ?? cars[index].model).trim(),
    category: String(body.category ?? cars[index].category).trim(),
    seats: Number(body.seats ?? cars[index].seats),
    hasAc: body.hasAc ?? cars[index].hasAc,
    transmission: String(body.transmission ?? cars[index].transmission).trim(),
    fuel: String(body.fuel ?? cars[index].fuel).trim(),
    pricePerDay: Number(body.pricePerDay ?? cars[index].pricePerDay),
    pricePerKm: Number(body.pricePerKm ?? cars[index].pricePerKm),
    description: String(body.description ?? cars[index].description).trim(),
    image: String(body.image ?? cars[index].image).trim(),
    published: body.published ?? cars[index].published,
  }

  cars[index] = updated
  await saveCars(cars)
  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const carId = Number(id)
  const cars = await getCars(true)
  const nextCars = cars.filter((car) => car.id !== carId)

  if (nextCars.length === cars.length) {
    return NextResponse.json({ error: 'Car not found.' }, { status: 404 })
  }

  await saveCars(nextCars)
  return NextResponse.json({ ok: true })
}
