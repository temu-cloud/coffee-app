interface CardProps {
  title: string
  value: string | number
  icon?: string | React.ReactNode
  subtitle?: string
  variant?: 'default' | 'warning' | 'danger'
  className?: string
}

const variants = {
  default: 'border-amber-100',
  warning: 'border-yellow-200 bg-yellow-50',
  danger: 'border-red-200 bg-red-50',
}

export default function Card({ title, value, icon, subtitle, variant = 'default', className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border p-5 shadow-sm ${variants[variant]} ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-amber-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-amber-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-amber-500 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className="text-3xl opacity-80">{icon}</div>
        )}
      </div>
    </div>
  )
}
