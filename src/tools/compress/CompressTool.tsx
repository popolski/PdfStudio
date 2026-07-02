import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { PdfDropzone } from '../../components/PdfDropzone'
import { ProcessingButton } from '../../components/ProcessingButton'
import { DownloadResultCard } from '../../components/DownloadResultCard'
import { downloadBytes } from '../../lib/pdf/download'
import { compressPdf } from './compressLogic'

export function CompressTool() {
  const [sourceBytes, setSourceBytes] = useState<ArrayBuffer | null>(null)
  const [fileName, setFileName] = useState('')
  const [originalSize, setOriginalSize] = useState(0)
  const [result, setResult] = useState<Uint8Array | null>(null)

  async function handleFiles(files: File[]) {
    const file = files[0]
    const bytes = await file.arrayBuffer()
    setSourceBytes(bytes)
    setFileName(file.name)
    setOriginalSize(bytes.byteLength)
    setResult(null)
  }

  function reset() {
    setSourceBytes(null)
    setFileName('')
    setResult(null)
  }

  async function handleApply() {
    if (!sourceBytes) return
    const bytes = await compressPdf(sourceBytes)
    setResult(bytes)
  }

  return (
    <ToolLayout
      title="Compresser un PDF"
      description="Réduit la taille du fichier via une compression légère. Les gains sont modestes et varient selon le contenu — meilleurs résultats sur les PDF riches en images."
    >
      {!sourceBytes && (
        <PdfDropzone accept="application/pdf" label="Déposez un fichier PDF ici" onFiles={handleFiles} />
      )}

      {sourceBytes && (
        <div className="flex flex-col items-center gap-6">
          <p className="text-sm text-gray-500">
            {fileName} — {(originalSize / 1024).toFixed(1)} Ko
          </p>

          {result ? (
            <DownloadResultCard
              fileSizeBytes={result.byteLength}
              onDownload={() => downloadBytes(result, `compresse-${fileName}`)}
              onReset={reset}
            />
          ) : (
            <div className="flex justify-center gap-3">
              <ProcessingButton label="Compresser" onClick={handleApply} />
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  )
}
