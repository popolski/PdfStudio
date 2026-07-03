import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { PdfDropzone } from '../../components/PdfDropzone'
import { downloadBlob } from '../../lib/pdf/download'
import { convertPdfToHtml } from './pdfToHtmlLogic'

export function PdfToHtmlTool() {
  const [fileName, setFileName] = useState('')
  const [html, setHtml] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: File[]) {
    const file = files[0]
    setFileName(file.name)
    setError(null)
    setIsConverting(true)
    try {
      const bytes = await file.arrayBuffer()
      const result = await convertPdfToHtml(bytes, file.name)
      setHtml(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion impossible.')
    } finally {
      setIsConverting(false)
    }
  }

  function reset() {
    setFileName('')
    setHtml(null)
    setError(null)
  }

  function handleDownload() {
    if (!html) return
    downloadBlob(new Blob([html], { type: 'text/html' }), `${fileName.replace(/\.pdf$/i, '')}.html`)
  }

  return (
    <ToolLayout
      title="PDF vers HTML"
      description="Extrait le texte de chaque page en HTML positionné. Fidèle au contenu, mais la mise en page reste une approximation visuelle — ce n'est pas du HTML sémantique."
    >
      {!fileName && (
        <PdfDropzone accept="application/pdf" label="Déposez un fichier PDF ici" onFiles={handleFiles} />
      )}

      {fileName && isConverting && <p className="text-center text-gray-500">Conversion en cours…</p>}

      {error && <p className="text-center text-red-600">{error}</p>}

      {html && !isConverting && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{fileName}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDownload}
                className="rounded-lg bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-700"
              >
                Télécharger le HTML
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Recommencer
              </button>
            </div>
          </div>
          <iframe
            title="Aperçu HTML"
            srcDoc={html}
            className="h-[600px] w-full rounded-lg border border-gray-200 bg-white"
          />
        </div>
      )}
    </ToolLayout>
  )
}
