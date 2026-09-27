import type { ReactNode } from 'react'
import { SiteHeader } from './SiteHeader'
import { ToolNav } from './ToolNav'

interface ToolLayoutProps {
  title: string
  description: string
  children: ReactNode
}

export function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <>
      <SiteHeader />
      <ToolNav />
      <main className="min-h-[calc(100vh-9rem)] bg-workspace px-4 pb-16 pt-7 sm:px-8 sm:pt-9">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Atelier PDF</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
          <p className="mb-8 mt-3 max-w-2xl leading-relaxed text-muted">{description}</p>
          {children}
        </div>
      </main>
    </>
  )
}
