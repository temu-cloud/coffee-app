import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'

interface StatsCardProps {
  title: string
  value?: number
  icon:  string | React.ReactNode
  subtitle?: string
  variant?: 'default' | 'warning' | 'danger'
  loading?: boolean
}

export default function StatsCard({ title, value, icon, subtitle, variant, loading }: StatsCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-amber-100 p-5 shadow-sm space-y-3">
        <Skeleton height="h-4" width="w-24" />
        <Skeleton height="h-8" width="w-16" />
      </div>
    )
  }
  return (
    <Card
      title={title}
      value={value ?? 0}
      icon={icon}
      subtitle={subtitle}
      variant={variant}
    />
  )
}
