import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { SiteHeader } from './SiteHeader'

interface ToolLayoutProps {
  title: string
  description: string
  children: ReactNode
}

export function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        <Link to="/" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-brand-600">
          <span aria-hidden="true">←</span> Tous les outils
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
        <p className="mb-8 mt-3 max-w-2xl leading-relaxed text-muted">{description}</p>
        {children}
      </main>
    </>
  )
}
