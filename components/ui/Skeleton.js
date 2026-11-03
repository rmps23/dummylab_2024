export default function Skeleton({ className = "" }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-white/[0.05] ${className}`} />;
}

export function SkeletonCards({ count = 3, className = "h-24" }) {
  return (
    <div role="status" aria-label="Loading" className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </div>
  );
}

export function SkeletonKpis({ count = 5 }) {
  return (
    <div role="status" aria-label="Loading" className="flex flex-wrap gap-3">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-[6.5rem] min-w-[8.5rem] flex-1" />
      ))}
    </div>
  );
}
