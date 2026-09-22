'use client'

import { useState } from 'react'
import type { Car } from '@/lib/store'

export interface CarPricingUpdate {
  id: number
  pricePerDay: number
  pricePerKm: number
}

interface PricingFormProps {
  cars: Car[]
  onSave: (updates: CarPricingUpdate[]) => Promise<boolean>
}

export function PricingForm({ cars, onSave }: PricingFormProps) {
  const [edits, setEdits] = useState<Record<number, { pricePerDay: number; pricePerKm: number }>>({})
  const [saving, setSaving] = useState(false)

  const getEdits = (car: Car) => ({
    pricePerDay: edits[car.id]?.pricePerDay ?? car.pricePerDay,
    pricePerKm: edits[car.id]?.pricePerKm ?? car.pricePerKm,
  })

  const setValue = (
    id: number,
    key: 'pricePerDay' | 'pricePerKm',
    value: number
  ) => {
    setEdits((current) => ({
      ...current,
      [id]: { ...current[id], [key]: value },
    }))
  }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      const updates: CarPricingUpdate[] = cars.map((car) => {
        const current = getEdits(car)
        return {
          id: car.id,
          pricePerDay: current.pricePerDay,
          pricePerKm: current.pricePerKm,
        }
      })
      await onSave(updates)
    } finally {
      setSaving(false)
    }
  }

  if (cars.length === 0) {
    return (
      <div className="max-w-3xl rounded-2xl border border-[#e7e0d5] bg-[#fffdf9] p-5">
        <p className="text-sm text-[#766e64]">
          No cars yet. Add cars in the Fleet section first.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl rounded-2xl border border-[#e7e0d5] bg-[#fffdf9] p-5">
      <div className="overflow-hidden rounded-xl border border-[#e7e0d5]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e7e0d5] bg-[#f5f1ea]">
              <th className="px-4 py-3 font-bold">Car</th>
              <th className="px-4 py-3 font-bold">Base fare</th>
              <th className="px-4 py-3 font-bold">Per kilometer</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car, index) => {
              const current = getEdits(car)
              return (
                <tr
                  key={car.id}
                  className={index % 2 ? 'bg-[#faf7f2]' : 'bg-white'}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={car.image}
                        alt={`${car.brand} ${car.model}`}
                        className="h-12 w-16 rounded-lg border border-[#e7e0d5] object-cover"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-[#292724]">
                          {car.brand} {car.model}
                        </p>
                        <p className="text-xs capitalize text-[#8c8378]">
                          {car.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">৳</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={current.pricePerDay}
                        onChange={(e) =>
                          setValue(car.id, 'pricePerDay', Number(e.target.value))
                        }
                        className="w-28 rounded-lg border border-[#e7e0d5] bg-white px-3 py-2"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">৳</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={current.pricePerKm}
                        onChange={(e) =>
                          setValue(car.id, 'pricePerKm', Number(e.target.value))
                        }
                        className="w-28 rounded-lg border border-[#e7e0d5] bg-white px-3 py-2"
                      />
                      <span className="text-sm text-[#766e64]">/km</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-[#766e64]">
        Edit the base fare and per-kilometer rate for each car. Changes apply to
        the website fare calculator and booking flow after saving.
      </p>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-5 rounded-xl bg-[#292724] px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save pricing'}
      </button>
    </div>
  )
}