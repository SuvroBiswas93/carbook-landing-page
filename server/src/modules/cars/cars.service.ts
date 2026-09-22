import type { Repos } from '../../repos'
import { isRecord } from '../../lib/isRecord'
import { BadRequest, NotFound } from '../../lib/apiError'
import type { Car } from '../../domain'
import { normalizeCar } from '../../repos/carsRepo'

export function createCarsService(repos: Repos) {
  function carFromBody(body: unknown): Omit<Car, 'id'> {
    if (!isRecord(body)) throw BadRequest('Invalid request payload.')
    return {
      brand: String(body.brand ?? '').trim(),
      model: String(body.model ?? '').trim(),
      category: String(body.category ?? '').trim(),
      seats: Number(body.seats ?? 4),
      hasAc: typeof body.hasAc === 'boolean' ? body.hasAc : true,
      transmission: String(body.transmission ?? 'automatic').trim(),
      fuel: String(body.fuel ?? 'petrol').trim(),
      pricePerDay: Number(body.pricePerDay ?? 0),
      pricePerKm: Number(body.pricePerKm ?? 0),
      description: String(body.description ?? '').trim(),
      image: String(body.image ?? '/placeholder.jpg').trim(),
      published: Boolean(body.published),
    }
  }

  function patchFromBody(body: unknown): Partial<Omit<Car, 'id'>> {
    if (!isRecord(body)) throw BadRequest('Invalid request payload.')
    return body as unknown as Partial<Omit<Car, 'id'>>
  }

  return {
    async list(includeUnpublished: boolean) {
      return repos.cars.list(includeUnpublished)
    },

    async create(body: unknown) {
      const car = carFromBody(body)
      if (!car.brand || !car.model || !car.category || !car.image) {
        throw BadRequest('Brand, model, category, and image are required.')
      }
      const created = await repos.cars.create(car)
      return normalizeCar(created)
    },

    async update(id: number, body: unknown) {
      const updated = await repos.cars.update(id, patchFromBody(body))
      if (!updated) throw NotFound('Car not found.')
      return normalizeCar(updated)
    },

    async remove(id: number) {
      const removed = await repos.cars.remove(id)
      if (!removed) throw NotFound('Car not found.')
      return { ok: true }
    },
  }
}

export type CarsService = ReturnType<typeof createCarsService>