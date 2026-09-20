export default function Loading() {
  return (
    <div className="grid animate-pulse gap-7">
      <div>
        <div className="h-8 w-40 rounded-lg bg-[#e4ddd2]" />
        <div className="mt-2 h-4 w-64 rounded bg-[#ece5da]" />
      </div>
      <div className="h-72 rounded-2xl bg-[#ede6da]" />
    </div>
  )
}