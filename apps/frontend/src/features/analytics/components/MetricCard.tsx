interface MetricCardProps {
  label: string
  value: string | number
  icon: string
  color?: string
}

export function MetricCard({ label, value, icon, color = 'text-sky-600' }: MetricCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
      <span className={`text-2xl ${color}`}>{icon}</span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  )
}
