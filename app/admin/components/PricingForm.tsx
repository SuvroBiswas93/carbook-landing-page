import type { Pricing } from '@/lib/store'

interface PricingFormProps {
  form: Pricing
  setForm: (form: Pricing) => void
  savedPricing: Pricing
  onSave: () => void
}

export function PricingForm({
  form,
  setForm,
  savedPricing,
  onSave,
}: PricingFormProps) {
  return (
    <div className="max-w-2xl rounded-2xl border border-[#e7e0d5] bg-[#fffdf9] p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Per kilometer rate
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.farePerKm}
            onChange={(e) =>
              setForm({ ...form, farePerKm: Number(e.target.value) })
            }
            className="rounded-xl border border-[#e7e0d5] px-4 py-3 font-normal"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Minimum fare
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.minimumFare}
            onChange={(e) =>
              setForm({ ...form, minimumFare: Number(e.target.value) })
            }
            className="rounded-xl border border-[#e7e0d5] px-4 py-3 font-normal"
          />
        </label>
      </div>
      <p className="mt-4 text-sm text-[#766e64]">
        Current calculator rate: ৳{savedPricing.farePerKm}/km. Changes apply to
        the website calculator after saving.
      </p>
      <button
        onClick={onSave}
        className="mt-5 rounded-xl bg-[#292724] px-5 py-3 text-sm font-bold text-white"
      >
        Save pricing
      </button>
    </div>
  )
}