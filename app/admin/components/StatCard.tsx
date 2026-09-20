interface StatCardProps {
  label: string
  value: number
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <article className="min-w-0 rounded-2xl border border-[#e7e0d5] bg-[#fffdf9] p-4 sm:p-5">
      <p className="text-sm text-[#8c8378]">{label}</p>
      <strong className="mt-3 block truncate font-serif text-2xl sm:text-3xl">{value}</strong>
    </article>
  )
}