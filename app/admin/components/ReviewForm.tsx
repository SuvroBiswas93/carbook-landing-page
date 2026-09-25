import type { Review } from '@/lib/types'

interface ReviewFormProps {
  form: Omit<Review, 'id' | 'createdAt'>
  setForm: (form: Omit<Review, 'id' | 'createdAt'>) => void
  onSave: () => void
}

export function ReviewForm({ form, setForm, onSave }: ReviewFormProps) {
  return (
    <div className="mt-6 grid gap-4">
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        placeholder="Name"
      />
      <input
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        className="rounded-xl border border-[#e7e0d5] px-4 py-3"
        placeholder="Location"
      />
      <select
        value={form.rating}
        onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
        className="rounded-xl border border-[#e7e0d5] px-4 py-3"
      >
        {[5, 4, 3, 2, 1].map((rating) => (
          <option key={rating} value={rating}>
            {rating} stars
          </option>
        ))}
      </select>
      <textarea
        value={form.text}
        onChange={(e) => setForm({ ...form, text: e.target.value })}
        className="min-h-28 rounded-xl border border-[#e7e0d5] px-4 py-3"
        placeholder="Review text"
      />
      <label className="flex items-center gap-3 text-sm font-bold">
        <input
          type="checkbox"
          checked={form.hidden}
          onChange={(e) => setForm({ ...form, hidden: e.target.checked })}
        />
        Unpublish from website
      </label>
      <button
        onClick={onSave}
        className="cursor-pointer rounded-xl bg-[#292724] py-3 font-bold text-white"
      >
        Save Review
      </button>
    </div>
  )
}