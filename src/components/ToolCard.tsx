import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface ToolCardProps {
  to: string
  icon: ReactNode
  title: string
  description: string
}

export function ToolCard({ to, icon, title, description }: ToolCardProps) {
  return (
    <Link
      to={to}
      className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  )
}
