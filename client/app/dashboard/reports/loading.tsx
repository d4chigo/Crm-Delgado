export default function ReportsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-20 bg-muted rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-muted rounded-lg" />
        <div className="h-80 bg-muted rounded-lg" />
      </div>
      <div className="h-64 bg-muted rounded-lg" />
      <div className="h-96 bg-muted rounded-lg" />
    </div>
  )
}
