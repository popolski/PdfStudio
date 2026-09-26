import { Link } from 'react-router-dom'

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <Link to="/" className="inline-flex items-center gap-3 text-xl font-bold tracking-tight text-ink no-underline">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-lg text-white" aria-hidden="true">P</span>
          PdfStudio
        </Link>
        <span className="hidden text-sm text-muted sm:block">Vos fichiers restent sur cet appareil</span>
      </div>
    </header>
  )
}
