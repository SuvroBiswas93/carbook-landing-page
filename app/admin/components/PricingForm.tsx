'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  DEFAULT_BASE_FARE,
  DEFAULT_FARE_PER_KM,
} from '@/lib/pricing'
import type { CarTypePricing, Pricing } from '@/lib/store'
import { Dropdown } from './Dropdown'

interface PricingFormProps {
  form: Pricing
  setForm: (form: Pricing) => void
  categories: string[]
  onSave: () => void | Promise<void>
}

export function PricingForm({
  form,
  setForm,
  categories,
  onSave,
}: PricingFormProps) {
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      await onSave()
    } finally {
      setSaving(false)
    }
  }

  const carTypes = form.carTypes
  const usedTypes = carTypes.map((item) => item.carType).filter(Boolean)
  const availableTypes = categories.filter((type) => !usedTypes.includes(type))
  const hasPendingEntry = carTypes.some((item) => !item.carType)

  const updateEntry = (
    index: number,
    patch: Partial<Pick<CarTypePricing, 'carType' | 'baseFare' | 'farePerKm'>>
  ) => {
    setForm({
      ...form,
      carTypes: carTypes.map((item, i) =>
        i === index ? { ...item, ...patch } : item
      ),
    })
  }

  const removeEntry = (index: number) => {
    setForm({
      ...form,
      carTypes: carTypes.filter((_, i) => i !== index),
    })
  }

  const addEntry = () => {
    if (availableTypes.length === 0 || hasPendingEntry) return
    setForm({
      ...form,
      carTypes: [
        ...carTypes,
        {
          carType: '',
          baseFare: DEFAULT_BASE_FARE,
          farePerKm: DEFAULT_FARE_PER_KM,
        },
      ],
    })
  }

  return (
    <div className="max-w-3xl rounded-2xl border border-[#e7e0d5] bg-[#fffdf9] p-5">
      <div className="overflow-hidden rounded-xl border border-[#e7e0d5]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e7e0d5] bg-[#f5f1ea]">
              <th className="px-4 py-3 font-bold">Car type</th>
              <th className="px-4 py-3 font-bold">Base fare</th>
              <th className="px-4 py-3 font-bold">Per kilometer</th>
              <th className="px-4 py-3 text-right font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {carTypes.map((entry, index) => {
              const options = categories
                .filter(
                  (type) =>
                    !carTypes.some(
                      (item, i) => i !== index && item.carType === type
                    )
                )
                .map((type) => ({ value: type, label: type }))

              return (
                <tr
                  key={index}
                  className={index % 2 ? 'bg-[#faf7f2]' : 'bg-white'}
                >
                  <td className="px-4 py-3">
                    {entry.carType ? (
                      <span className="font-semibold capitalize">
                        {entry.carType}
                      </span>
                    ) : options.length > 0 ? (
                      <Dropdown
                        value=""
                        options={options}
                        onChange={(value) =>
                          updateEntry(index, { carType: value })
                        }
                        ariaLabel="Select car type"
                        placeholder="Select car type"
                        triggerClassName="h-9 min-w-36 bg-white text-sm text-[#766e64] ring-[#e7e0d5] hover:ring-[#c9bda9]"
                        menuClassName="capitalize"
                        menuWidth={192}
                      />
                    ) : (
                      <span className="text-sm text-[#766e64]">
                        No car types left
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">৳</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={entry.baseFare}
                        onChange={(e) =>
                          updateEntry(index, {
                            baseFare: Number(e.target.value),
                          })
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
                        value={entry.farePerKm}
                        onChange={(e) =>
                          updateEntry(index, {
                            farePerKm: Number(e.target.value),
                          })
                        }
                        className="w-28 rounded-lg border border-[#e7e0d5] bg-white px-3 py-2"
                      />
                      <span className="text-sm text-[#766e64]">/km</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeEntry(index)}
                      aria-label={`Delete ${
                        entry.carType || 'car type'
                      } pricing`}
                      title="Delete"
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#f0d9d9] bg-white text-[#c0392b] transition-colors hover:bg-[#fdeceb]"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {carTypes.length === 0 && (
        <p className="mt-4 text-sm text-[#766e64]">
          No car types yet. Add one below.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addEntry}
          disabled={availableTypes.length === 0 || hasPendingEntry}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#e7e0d5] bg-white px-4 py-2.5 text-sm font-bold text-[#292724] transition-colors hover:bg-[#f5f1ea] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} />
          Add car type
        </button>
        {categories.length === 0 && (
          <span className="text-sm text-[#766e64]">
            Add car categories in the Fleet section first.
          </span>
        )}
        {categories.length > 0 && availableTypes.length === 0 && (
          <span className="text-sm text-[#766e64]">
            Every fleet car type is already priced.
          </span>
        )}
      </div>

      <p className="mt-4 text-sm text-[#766e64]">
        Car types come from the Fleet section. Pick one only while adding a new
        entry, set its base fare and per-kilometer rate, and remove any entry
        you no longer need. Changes apply to the website fare calculator after
        saving.
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
