import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import type { Car as FleetCar } from '@/lib/store'

interface CarCardsProps {
  cars: FleetCar[]
  onEdit: (car: FleetCar) => void
  onDelete: (id: number) => void
  onToggle: (car: FleetCar) => void
}

export function CarCards({
  cars,
  onEdit,
  onDelete,
  onToggle,
}: CarCardsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {cars.map((car) => (
        <article
          key={car.id}
          className="rounded-2xl border border-[#e7e0d5] bg-[#fffdf9] p-4 sm:p-5"
        >
          <div className="flex gap-3 sm:gap-4">
            <img
              src={car.image}
              alt={`${car.brand} ${car.model}`}
              className="h-20 w-24 shrink-0 rounded-xl object-cover sm:h-24 sm:w-32"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-lg font-bold leading-snug sm:text-xl">
                {car.brand} {car.model}
              </h3>
              <p className="text-sm text-[#8c8378]">
                {car.category} | {car.seats} seats | {car.hasAc ? 'AC' : 'Non-AC'} | ৳{car.pricePerDay}/day | ৳{car.pricePerKm}/km
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-[#766e64]">
                {car.description}
              </p>
              <span
                className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                  car.published
                    ? 'bg-green-100 text-green-800'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {car.published ? 'Published' : 'Hidden'}
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => onEdit(car)}
              className="flex items-center gap-2 rounded-lg bg-[#f0ebe3] px-3 py-2 text-sm font-bold"
            >
              <Pencil size={15} />
              Edit
            </button>
            <button
              onClick={() => onToggle(car)}
              className="flex items-center gap-2 rounded-lg bg-[#f0ebe3] px-3 py-2 text-sm font-bold"
            >
              {car.published ? <EyeOff size={15} /> : <Eye size={15} />}
              {car.published ? 'Unpublish' : 'Publish'}
            </button>
            <button
              onClick={() => onDelete(car.id)}
              className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-bold text-red-700"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}