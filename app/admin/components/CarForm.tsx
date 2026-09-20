import type { Car as FleetCar } from '@/lib/store'

interface CarFormProps {
  form: Omit<FleetCar, 'id'>
  setForm: (form: Omit<FleetCar, 'id'>) => void
  onSave: () => void
  editing: boolean
}

export function CarForm({ form, setForm, onSave, editing }: CarFormProps) {
  const update = (
    key: keyof Omit<FleetCar, 'id'>,
    value: string | number | boolean
  ) => setForm({ ...form, [key]: value })

  return (
    <div className="mb-8 rounded-2xl border border-[#e7e0d5] bg-[#fffdf9] p-5">
      <h3 className="font-serif text-xl font-bold">
        {editing ? 'Edit Car' : 'Add Car'}
      </h3>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <input
          value={form.brand}
          onChange={(e) => update('brand', e.target.value)}
          placeholder="Brand"
          className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        />
        <input
          value={form.model}
          onChange={(e) => update('model', e.target.value)}
          placeholder="Model"
          className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        />
        <input
          value={form.category}
          onChange={(e) => update('category', e.target.value)}
          placeholder="Category"
          className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        />
        <input
          type="number"
          value={form.seats}
          onChange={(e) => update('seats', Number(e.target.value))}
          placeholder="Seats"
          className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        />
        <label className="flex items-center gap-3 rounded-xl border border-[#e7e0d5] px-4 py-3 text-sm font-bold">
          <input
            type="checkbox"
            checked={form.hasAc}
            onChange={(e) => update('hasAc', e.target.checked)}
          />
          AC available
        </label>
        <input
          value={form.transmission}
          onChange={(e) => update('transmission', e.target.value)}
          placeholder="Transmission"
          className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        />
        <input
          value={form.fuel}
          onChange={(e) => update('fuel', e.target.value)}
          placeholder="Fuel"
          className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        />
        <input
          type="number"
          value={form.pricePerDay}
          onChange={(e) => update('pricePerDay', Number(e.target.value))}
          placeholder="Price per day"
          className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        />
        <input
          type="number"
          value={form.pricePerKm}
          onChange={(e) => update('pricePerKm', Number(e.target.value))}
          placeholder="Price per km"
          className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        />
        <label className="flex items-center gap-3 rounded-xl border border-[#e7e0d5] px-4 py-3 text-sm font-bold">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => update('published', e.target.checked)}
          />
          Publish on website
        </label>
      </div>
      <input
        value={form.image}
        onChange={(e) => update('image', e.target.value)}
        placeholder="Image URL"
        className="mt-4 w-full rounded-xl border border-[#e7e0d5] px-4 py-3"
      />
      <textarea
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
        placeholder="Description"
        className="mt-4 min-h-24 w-full rounded-xl border border-[#e7e0d5] px-4 py-3"
      />
      <button
        onClick={onSave}
        className="mt-4 rounded-xl bg-[#292724] px-5 py-3 text-sm font-bold text-white"
      >
        {editing ? 'Save Changes' : 'Add Car'}
      </button>
    </div>
  )
}