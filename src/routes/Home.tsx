import { ToolCard } from '../components/ToolCard'

const icons = {
  organize: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  ),
  merge: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v18M3 9l6-6 6 6M15 21V3M21 15l-6 6-6-6" />
    </svg>
  ),
  split: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h8M8 12h8M4 4h16v16H4z" />
    </svg>
  ),
  imagesToPdf: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16l4-4 3 3 5-6 6 7M3 6h18M3 6v14h18V6" />
    </svg>
  ),
  pdfToImages: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4h16v16H4zM8 12l2 2 4-4" />
    </svg>
  ),
  watermark: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4h16v16H4zM7 17l5-10 5 10" />
    </svg>
  ),
  pageNumbers: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 4h9l3 3v13H6zM9 18h6" />
    </svg>
  ),
  compress: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  ),
  toHtml: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l-3 3 3 3M16 9l3 3-3 3M13 7l-2 10" />
    </svg>
  ),
  toWord: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 4h9l3 3v13H6zM8 12l1.5 6L11 13l1.5 5L14 12" />
    </svg>
  ),
  toExcel: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 4h9l3 3v13H6zM9 12l6 6M15 12l-6 6" />
    </svg>
  ),
}

export function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">PdfStudio</h1>
        <p className="mt-2 text-gray-500">
          Modifiez vos PDF simplement, directement dans votre navigateur. Rien n'est envoyé sur un serveur.
        </p>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <ToolCard
          to="/organiser"
          icon={icons.organize}
          title="Organiser"
          description="Réorganiser, supprimer ou pivoter des pages"
        />
        <ToolCard to="/fusion" icon={icons.merge} title="Fusionner" description="Combiner plusieurs PDF en un seul" />
        <ToolCard to="/split" icon={icons.split} title="Diviser" description="Extraire des pages ou scinder un PDF" />
        <ToolCard
          to="/images-vers-pdf"
          icon={icons.imagesToPdf}
          title="Images vers PDF"
          description="Convertir des images en document PDF"
        />
        <ToolCard
          to="/pdf-vers-images"
          icon={icons.pdfToImages}
          title="PDF vers images"
          description="Exporter chaque page en image"
        />
        <ToolCard
          to="/filigrane"
          icon={icons.watermark}
          title="Filigrane"
          description="Ajouter un texte ou une image en filigrane"
        />
        <ToolCard
          to="/numeros-de-page"
          icon={icons.pageNumbers}
          title="Numéros de page"
          description="Ajouter une numérotation automatique"
        />
        <ToolCard
          to="/compresser"
          icon={icons.compress}
          title="Compresser"
          description="Réduire la taille du fichier PDF"
        />
        <ToolCard
          to="/pdf-vers-html"
          icon={icons.toHtml}
          title="PDF vers HTML"
          description="Extraire le contenu en page web"
        />
        <ToolCard
          to="/pdf-vers-word"
          icon={icons.toWord}
          title="PDF vers Word"
          description="Extraire le texte dans un .docx"
        />
        <ToolCard
          to="/pdf-vers-excel"
          icon={icons.toExcel}
          title="PDF vers Excel"
          description="Extraire un tableau dans un .xlsx"
        />
      </div>
    </div>
  )
}
