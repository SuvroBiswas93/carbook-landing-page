import { readJson, writeJson, nextNumericId } from '../lib/jsonStore'
import type { Car } from '../domain'

export interface CarsRepo {
  list(includeUnpublished?: boolean): Promise<Car[]>
  getById(id: number): Promise<Car | null>
  create(car: Omit<Car, 'id'>): Promise<Car>
  update(id: number, patch: Partial<Omit<Car, 'id'>>): Promise<Car | null>
  remove(id: number): Promise<boolean>
}

export function normalizeCar(raw: Partial<Car>): Car {
  return {
    id: Number(raw.id),
    brand: String(raw.brand ?? ''),
    model: String(raw.model ?? ''),
    category: String(raw.category ?? ''),
    seats: Number(raw.seats ?? 4),
    hasAc: raw.hasAc ?? true,
    transmission: String(raw.transmission ?? 'automatic'),
    fuel: String(raw.fuel ?? 'petrol'),
    pricePerDay: Number(raw.pricePerDay ?? 0),
    pricePerKm: Number(raw.pricePerKm ?? 0),
    description: String(raw.description ?? ''),
    image: String(raw.image ?? '/placeholder.jpg'),
    published: raw.published ?? true,
  }
}

export const jsonCarsRepo: CarsRepo = {
  async list(includeUnpublished = false) {
    const cars = await readJson<Partial<Car>[]>('cars.json', [])
    const normalized = cars.map(normalizeCar)
    return includeUnpublished ? normalized : normalized.filter((car) => car.published)
  },

  async getById(id) {
    const cars = await readJson<Partial<Car>[]>('cars.json', [])
    const car = cars.find((item) => Number(item.id) === id)
    return car ? normalizeCar(car) : null
  },

  async create(car) {
    const cars = await readJson<Partial<Car>[]>('cars.json', [])
    const created: Car = { ...car, id: nextNumericId(cars) }
    cars.push(created)
    await writeJson('cars.json', cars)
    return created
  },

  async update(id, patch) {
    const cars = await readJson<Partial<Car>[]>('cars.json', [])
    const index = cars.findIndex((item) => Number(item.id) === id)
    if (index === -1) return null

    const current = normalizeCar(cars[index])
    const updated: Car = {
      ...current,
      brand: String(patch.brand ?? current.brand).trim(),
      model: String(patch.model ?? current.model).trim(),
      category: String(patch.category ?? current.category).trim(),
      seats: Number(patch.seats ?? current.seats),
      hasAc: patch.hasAc ?? current.hasAc,
      transmission: String(patch.transmission ?? current.transmission).trim(),
      fuel: String(patch.fuel ?? current.fuel).trim(),
      pricePerDay: Number(patch.pricePerDay ?? current.pricePerDay),
      pricePerKm: Number(patch.pricePerKm ?? current.pricePerKm),
      description: String(patch.description ?? current.description).trim(),
      image: String(patch.image ?? current.image).trim(),
      published: patch.published ?? current.published,
    }

    cars[index] = updated
    await writeJson('cars.json', cars)
    return updated
  },

  async remove(id) {
    const cars = await readJson<Partial<Car>[]>('cars.json', [])
    const next = cars.filter((item) => Number(item.id) !== id)
    if (next.length === cars.length) return false
    await writeJson('cars.json', next)
    return true
  },
}