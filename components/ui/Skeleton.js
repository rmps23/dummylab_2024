export default function Skeleton({ className = "" }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-zinc-800 ${className}`} />;
}

export function SkeletonCards({ count = 3, className = "h-20" }) {
  return (
    <div role="status" aria-label="Loading" className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
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
        <Skeleton key={i} className="h-20 w-32" />
      ))}
    </div>
  );
}
