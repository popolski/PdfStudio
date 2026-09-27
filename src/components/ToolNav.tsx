import { Link, NavLink, useLocation } from 'react-router-dom'

const mainTools = [
  { to: '/organiser', label: 'Organiser', icon: 'organize' },
  { to: '/fusion', label: 'Fusionner', icon: 'merge' },
  { to: '/split', label: 'Diviser', icon: 'split' },
  { to: '/filigrane', label: 'Filigrane', icon: 'watermark' },
  { to: '/numeros-de-page', label: 'Numéroter', icon: 'numbers' },
  { to: '/compresser', label: 'Compresser', icon: 'compress' },
] as const

const otherTools = [
  { to: '/images-vers-pdf', label: 'Images vers PDF' },
  { to: '/pdf-vers-images', label: 'PDF vers images' },
  { to: '/image-vers-texte', label: 'Image vers texte' },
  { to: '/pdf-vers-word', label: 'PDF vers Word' },
  { to: '/pdf-vers-excel', label: 'PDF vers Excel' },
  { to: '/pdf-vers-html', label: 'PDF vers HTML' },
] as const

function ToolIcon({ name }: { name: typeof mainTools[number]['icon'] }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" {...common}>
      {name === 'organize' && <><rect x="4" y="3" width="12" height="15" rx="2" /><path d="M8 8h5M8 12h5M18 7v12m-3-3 3 3 3-3" /></>}
      {name === 'merge' && <><path d="M4 4h6v6H4zM14 4h6v6h-6zM7 10v4h10v-4M12 14v6m-3-3 3 3 3-3" /></>}
      {name === 'split' && <><circle cx="6" cy="17" r="2" /><circle cx="18" cy="17" r="2" /><path d="M8 15 18 4M16 15 6 4" /></>}
      {name === 'watermark' && <><path d="m5 18 7-14 7 14M8 13h8M4 21h16" /></>}
      {name === 'numbers' && <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 8h1v8M13 10c0-1 4-1 4 1 0 1-4 3-4 5h4" /></>}
      {name === 'compress' && <><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></>}
    </svg>
  )
}

export function ToolNav() {
  const { pathname } = useLocation()
  const otherIsActive = otherTools.some((tool) => tool.to === pathname)

  return (
    <nav aria-label="Outils PDF" className="relative z-10 border-b border-line bg-white shadow-sm">
      <div className="mx-auto grid max-w-6xl grid-cols-4 gap-1 px-2 py-2 sm:flex sm:flex-wrap sm:px-6">
        {mainTools.map((tool) => (
          <NavLink
            key={tool.to}
            to={tool.to}
            className={({ isActive }) => `flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg px-1.5 text-center text-[11px] font-semibold transition-colors sm:min-w-24 sm:px-3 sm:text-xs ${
              isActive ? 'bg-brand-700 text-white' : 'text-muted hover:bg-brand-50 hover:text-brand-700'
            }`}
          >
            <ToolIcon name={tool.icon} />
            <span>{tool.label}</span>
          </NavLink>
        ))}
        <details key={pathname} className="group relative col-span-2 sm:ml-1">
          <summary className={`flex min-h-16 cursor-pointer list-none items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors [&::-webkit-details-marker]:hidden ${
            otherIsActive ? 'bg-brand-700 text-white' : 'text-muted hover:bg-brand-50 hover:text-brand-700'
          }`}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>
            Autres outils
            <span aria-hidden="true" className="text-base group-open:rotate-180">⌄</span>
          </summary>
          <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-line bg-white p-2 shadow-xl">
            {otherTools.map((tool) => (
              <Link key={tool.to} to={tool.to} aria-current={pathname === tool.to ? 'page' : undefined} className={`block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-brand-50 ${pathname === tool.to ? 'bg-brand-50 text-brand-700' : 'text-ink'}`}>
                {tool.label}
              </Link>
            ))}
          </div>
        </details>
      </div>
    </nav>
  )
}
