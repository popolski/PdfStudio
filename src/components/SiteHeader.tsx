import { Link, useLocation } from 'react-router-dom'

export function SiteHeader() {
  const { pathname } = useLocation()

  return (
    <header className="bg-brand-700 text-white">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <Link to="/" className="inline-flex items-center gap-3 font-bold tracking-tight text-white no-underline">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-xl font-extrabold text-brand-700" aria-hidden="true">P</span>
          <span className="text-xl">PdfStudio</span>
          <span className="hidden border-l border-white/30 pl-3 text-sm font-medium tracking-normal text-white/75 sm:inline">Atelier PDF</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          <span className="hidden text-sm text-white/75 md:inline">Vos fichiers restent sur cet appareil</span>
          {pathname !== '/' && (
            <Link to="/" className="inline-flex min-h-10 items-center rounded-lg bg-gold px-4 text-sm font-semibold text-brand-700 transition-colors hover:bg-gold-hover">
              Tous les outils
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
