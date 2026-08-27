export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse py-2 select-none">
      {/* Top Header Skeleton */}
      <div className="space-y-2 pb-4 border-b border-slate-100">
        <div className="h-6 w-48 bg-slate-200 rounded-md" />
        <div className="h-3 w-72 bg-slate-100 rounded" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2">
            <div className="w-full aspect-square rounded-xl bg-slate-200" />
            <div className="h-3 w-16 bg-slate-200 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Track List Skeleton */}
      <div className="space-y-2 pt-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-10 w-full bg-slate-100 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
