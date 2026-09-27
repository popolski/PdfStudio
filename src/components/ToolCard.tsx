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
      className="group flex min-h-32 items-center gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm transition-colors hover:border-brand-500 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-500 sm:min-h-44 sm:flex-col sm:items-start sm:gap-3"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-snug text-muted">{description}</p>
      </div>
      <span className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold/40 text-brand-700 transition-colors group-hover:bg-gold sm:self-end" aria-hidden="true">↗</span>
    </Link>
  )
}
