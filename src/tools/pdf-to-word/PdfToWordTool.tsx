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
    setFileName(file.name)
    setError(null)
    setIsConverting(true)
    try {
      const bytes = await file.arrayBuffer()
      const blob = await convertPdfToWord(bytes)
      setResult(blob)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion impossible.')
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
      description="Extrait le texte du PDF en paragraphes dans un document Word (.docx). Le texte est préservé, mais les mises en page complexes (colonnes, tableaux) ne sont pas reconstruites."
    >
      {!fileName && (
        <PdfDropzone accept="application/pdf" label="Déposez un fichier PDF ici" onFiles={handleFiles} />
      )}

      {fileName && isConverting && <p className="text-center text-gray-500">Conversion en cours…</p>}

      {error && <p className="text-center text-red-600">{error}</p>}

      {result && !isConverting && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <p className="font-medium text-green-800">{fileName} converti avec succès</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => downloadBlob(result, `${fileName.replace(/\.pdf$/i, '')}.docx`)}
              className="rounded-lg bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-700"
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
