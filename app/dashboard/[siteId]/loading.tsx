export default function Loading() {
  return (
    <div className="grid gap-4">
      <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-md border bg-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-md border bg-muted" />
    </div>
  )
}