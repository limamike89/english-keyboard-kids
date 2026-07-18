interface StatusBadgeProps {
  isActive: boolean
}

export function CmsStatusBadge({ isActive }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isActive
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}
