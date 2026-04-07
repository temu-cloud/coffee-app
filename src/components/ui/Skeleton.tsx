interface SkeletonProps {
  width?: string
  height?: string
  count?: number
  className?: string
}

export default function Skeleton({ width = 'w-full', height = 'h-4', count = 1, className = '' }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-amber-100 rounded ${width} ${height} ${className}`}
        />
      ))}
    </>
  )
}
