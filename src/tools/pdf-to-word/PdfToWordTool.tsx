import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { PdfDropzone } from '../../components/PdfDropzone'
import { downloadBlob } from '../../lib/pdf/download'
import { convertPdfToWord } from './pdfToWordLogic'

export function PdfToWordTool() {
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState<Blob | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: File[]) {
    const file = files[0]
    setError(null)
    setIsConverting(true)
    try {
      const bytes = await file.arrayBuffer()
      const blob = await convertPdfToWord(bytes)
      setResult(blob)
      setFileName(file.name)
    } catch {
      setError('Conversion impossible. Vérifiez que le PDF est lisible et non protégé.')
    } finally {
      setIsConverting(false)
    }
  }

  function reset() {
    setFileName('')
    setResult(null)
    setError(null)
  }

  return (
    <ToolLayout
      title="PDF vers Word"
      description="Reconstruit de vrais paragraphes, détecte les titres selon la taille de police et réintègre les images à leur position dans un document Word (.docx). Le gras/italique et les mises en page complexes (colonnes, tableaux) ne sont pas préservés — limite du format PDF, pas de l'outil."
    >
      {!fileName && !isConverting && (
        <PdfDropzone accept="application/pdf" label="Déposez un fichier PDF ici" onFiles={handleFiles} />
      )}

      {isConverting && <p className="text-center text-gray-500">Conversion en cours…</p>}

      {error && <p className="text-center text-red-600">{error}</p>}

      {result && !isConverting && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <p className="font-medium text-green-800">{fileName} converti avec succès</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => downloadBlob(result, `${fileName.replace(/\.pdf$/i, '')}.docx`)}
              className="rounded-lg bg-gold px-5 py-2 font-semibold text-brand-700 hover:bg-gold-hover"
            >
              Télécharger le .docx
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              Recommencer
            </button>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
