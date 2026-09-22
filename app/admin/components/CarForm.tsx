'use client'

import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'react-toastify'
import type { Car as FleetCar } from '@/lib/store'
import { uploadCarImage } from '@/lib/uploadImage'

interface CarFormProps {
  form: Omit<FleetCar, 'id'>
  setForm: (form: Omit<FleetCar, 'id'>) => void
  onSave: () => void
  editing: boolean
}

const inputClass = 'rounded-xl border border-[#e7e0d5] px-4 py-3'

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold text-[#292724]">{label}</span>
      {children}
      {hint && <span className="text-xs leading-snug text-[#8c8378]">{hint}</span>}
    </label>
  )
}

function CheckField({
  label,
  hint,
  checked,
  text,
  onChange,
}: {
  label: string
  hint: string
  checked: boolean
  text: string
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-bold text-[#292724]">{label}</span>
      <label className="flex items-center gap-3 rounded-xl border border-[#e7e0d5] px-4 py-3 text-sm font-bold">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        {text}
      </label>
      <span className="text-xs leading-snug text-[#8c8378]">{hint}</span>
    </div>
  )
}

export function CarForm({ form, setForm, onSave, editing }: CarFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const update = (
    key: keyof Omit<FleetCar, 'id'>,
    value: string | number | boolean
  ) => setForm({ ...form, [key]: value })

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadCarImage(file)
      update('image', url)
      toast.success('Image uploaded. Save the car to keep the change.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Image upload failed.'
      )
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="mb-8 rounded-2xl border border-[#e7e0d5] bg-[#fffdf9] p-5">
      <h3 className="font-serif text-xl font-bold">
        {editing ? 'Edit Car' : 'Add Car'}
      </h3>
      <p className="mt-1 text-sm text-[#8c8378]">
        Fill in the details exactly as they should appear on the home page car
        card.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Field
          label="Brand"
          hint="Shown as the first part of the car card title."
        >
          <input
            value={form.brand}
            onChange={(e) => update('brand', e.target.value)}
            placeholder="e.g. Toyota"
            className={inputClass}
          />
        </Field>

        <Field
          label="Model"
          hint="Shown after the brand in the car card title."
        >
          <input
            value={form.model}
            onChange={(e) => update('model', e.target.value)}
            placeholder="e.g. Camry"
            className={inputClass}
          />
        </Field>

        <Field
          label="Category"
          hint="Small text under the title, e.g. sedan, luxury, mpv, suv."
        >
          <input
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            placeholder="e.g. sedan"
            className={inputClass}
          />
        </Field>

        <Field
          label="Seats"
          hint="Passenger count shown with the seat icon."
        >
          <input
            type="number"
            value={form.seats}
            onChange={(e) => update('seats', Number(e.target.value))}
            placeholder="e.g. 5"
            className={inputClass}
          />
        </Field>

        <Field
          label="Fuel"
          hint="Shown with the fuel icon, e.g. petrol, diesel, hybrid."
        >
          <input
            value={form.fuel}
            onChange={(e) => update('fuel', e.target.value)}
            placeholder="e.g. petrol"
            className={inputClass}
          />
        </Field>

        <Field
          label="Transmission"
          hint="Gearbox shown as Trans, e.g. automatic, manual."
        >
          <input
            value={form.transmission}
            onChange={(e) => update('transmission', e.target.value)}
            placeholder="e.g. automatic"
            className={inputClass}
          />
        </Field>

        <CheckField
          label="Air conditioning"
          text="AC available"
          checked={form.hasAc}
          onChange={(checked) => update('hasAc', checked)}
          hint="Shown as আছে / নেই on the car card."
        />

        <Field
          label="Price per day"
          hint="Card shows “From ৳… শুরু” using this value."
        >
          <input
            type="number"
            value={form.pricePerDay}
            onChange={(e) => update('pricePerDay', Number(e.target.value))}
            placeholder="e.g. 4500"
            className={inputClass}
          />
        </Field>

        <Field
          label="Price per km"
          hint="Shown as ৳…/কিমি under the daily price."
        >
          <input
            type="number"
            value={form.pricePerKm}
            onChange={(e) => update('pricePerKm', Number(e.target.value))}
            placeholder="e.g. 45"
            className={inputClass}
          />
        </Field>

        <CheckField
          label="Visibility"
          text="Publish on website"
          checked={form.published}
          onChange={(checked) => update('published', checked)}
          hint="Only published cars appear on the home page slider."
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field
          label="Image URL"
          hint="Photo shown at the top of the car card. Filled in automatically when you upload."
        >
          <input
            value={form.image}
            onChange={(e) => update('image', e.target.value)}
            placeholder="https://cdn.example.com/fleet/car-photo.jpg"
            className={inputClass}
          />
        </Field>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-[#292724]">
            Upload from device
          </span>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-xl bg-[#a8865f] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#97744e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? 'Uploading…' : 'Choose image'}
            </button>
            {form.image ? (
              <img
                src={form.image}
                alt="Car preview"
                className="h-12 w-16 rounded-lg border border-[#e7e0d5] object-cover"
              />
            ) : (
              <span className="text-xs text-[#8c8378]">No image yet</span>
            )}
          </div>
          <span className="text-xs leading-snug text-[#8c8378]">
            JPG, PNG, WebP, AVIF or GIF up to 5 MB. You can type a public URL
            in the field above instead.
          </span>
        </div>
      </div>

      <button
        onClick={onSave}
        className="mt-4 rounded-xl bg-[#292724] px-5 py-3 text-sm font-bold text-white"
      >
        {editing ? 'Save Changes' : 'Add Car'}
      </button>
    </div>
  )
}
