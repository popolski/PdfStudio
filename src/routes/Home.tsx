import { Link } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { ToolCard } from '../components/ToolCard'
import { ToolNav } from '../components/ToolNav'

const featured = [
  {
    to: '/organiser',
    title: 'Organiser',
    description: 'Réordonner, pivoter ou retirer des pages',
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" /></svg>,
  },
  {
    to: '/fusion',
    title: 'Fusionner',
    description: 'Assembler plusieurs PDF dans le bon ordre',
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v18M3 9l6-6 6 6M15 21V3M21 15l-6 6-6-6" /></svg>,
  },
  {
    to: '/compresser',
    title: 'Compresser',
    description: 'Réduire la taille avec une option adaptée',
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>,
  },
]

const sections = [
  {
    title: 'Modifier le document',
    tools: [
      { to: '/split', title: 'Diviser un PDF', detail: 'Extraire des pages' },
      { to: '/filigrane', title: 'Ajouter un filigrane', detail: 'Texte' },
      { to: '/numeros-de-page', title: 'Numéroter les pages', detail: 'Automatique' },
    ],
  },
  {
    title: 'Images et texte',
    tools: [
      { to: '/images-vers-pdf', title: 'Images vers PDF', detail: 'JPG ou PNG' },
      { to: '/pdf-vers-images', title: 'PDF vers images', detail: 'Pages en PNG' },
      { to: '/image-vers-texte', title: 'Image vers texte', detail: 'OCR' },
    ],
  },
  {
    title: 'Exporter le contenu',
    tools: [
      { to: '/pdf-vers-word', title: 'PDF vers Word', detail: 'Texte et images' },
      { to: '/pdf-vers-excel', title: 'PDF vers Excel', detail: 'Tableaux simples' },
      { to: '/pdf-vers-html', title: 'PDF vers HTML', detail: 'Texte positionné' },
    ],
  },
]

export function Home() {
  return (
    <>
      <SiteHeader />
      <ToolNav />
      <main className="min-h-screen bg-workspace px-4 pb-16 pt-10 sm:px-8 sm:pt-14">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Atelier PDF</p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Que faire avec votre PDF ?
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            Choisissez une action, puis ouvrez votre fichier. Tout se passe dans votre navigateur.
          </p>

        <section aria-labelledby="actions-principales" className="mt-10">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="actions-principales" className="text-lg font-semibold text-ink">Les actions principales</h2>
            <span className="text-sm text-muted">Un clic pour commencer</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {featured.map((tool) => <ToolCard key={tool.to} {...tool} />)}
          </div>
        </section>

        <section id="outils" aria-labelledby="tous-les-outils" className="mt-12">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="tous-les-outils" className="text-lg font-semibold text-ink">Tous les outils</h2>
            <span className="text-sm text-muted">Classés selon le résultat souhaité</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {sections.map((section) => (
              <div key={section.title} className="rounded-2xl border border-line bg-white px-5 py-4 shadow-sm">
                <h3 className="mb-2 text-base font-semibold text-ink">{section.title}</h3>
                <ul>
                  {section.tools.map((tool) => (
                    <li key={tool.to} className="border-t border-line">
                      <Link to={tool.to} className="group flex min-h-14 items-center justify-between gap-3 py-3 text-sm hover:text-brand-600">
                        <span className="font-medium text-ink group-hover:text-brand-600">{tool.title}</span>
                        <span className="shrink-0 text-right text-xs text-muted">{tool.detail} <span aria-hidden="true">→</span></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
        <p className="mt-9 inline-flex items-center gap-2 rounded-lg bg-[#eff5ee] px-4 py-2 text-sm font-medium text-[#3c7550]">
          <span aria-hidden="true">🔒</span> Vos fichiers restent sur cet appareil
        </p>
        </div>
      </main>
    </>
  )
}
