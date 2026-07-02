import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { PdfDropzone } from '../../components/PdfDropzone'
import { ProcessingButton } from '../../components/ProcessingButton'
import { DownloadResultCard } from '../../components/DownloadResultCard'
import { downloadBytes } from '../../lib/pdf/download'
import { loadPdfDocument } from '../../lib/pdf/pdfjs'
import { renderPageThumbnail } from '../../lib/pdf/thumbnail'
import { applyPageNumbers, type PageNumberPosition } from '../../lib/pdf/textStamp'

const PREVIEW_SCALE = 0.6

interface LoadedDoc {
  bytes: ArrayBuffer
  fileName: string
  previewUrl: string
}

export function PageNumbersTool() {
  const [doc, setDoc] = useState<LoadedDoc | null>(null)
  const [position, setPosition] = useState<PageNumberPosition>('bottom-center')
  const [startAt, setStartAt] = useState(1)
  const [fontSize, setFontSize] = useState(12)
  const [result, setResult] = useState<Uint8Array | null>(null)

  async function handleFiles(files: File[]) {
    const file = files[0]
    const bytes = await file.arrayBuffer()
    const pdf = await loadPdfDocument(bytes)
    const previewUrl = await renderPageThumbnail(pdf, 1, PREVIEW_SCALE)
    setResult(null)
    setDoc({ bytes, fileName: file.name, previewUrl })
  }

  function reset() {
    setDoc(null)
    setResult(null)
  }

  async function handleApply() {
    if (!doc) return
    const bytes = await applyPageNumbers(doc.bytes, { position, startAt, fontSize })
    setResult(bytes)
  }

  const previewLabel = `${startAt} / ${startAt}`
  const previewAlign = position === 'bottom-left' ? 'left-2' : position === 'bottom-right' ? 'right-2' : 'left-1/2 -translate-x-1/2'

  return (
    <ToolLayout title="Ajouter des numéros de page" description="Numérotez automatiquement toutes les pages de votre PDF.">
      {!doc && (
        <PdfDropzone accept="application/pdf" label="Déposez un fichier PDF ici" onFiles={handleFiles} />
      )}

      {doc && (
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white p-4">
            <div className="relative inline-block">
              <img src={doc.previewUrl} alt="Aperçu" className="max-h-[500px] rounded border border-gray-100" />
              <div className={`pointer-events-none absolute bottom-2 ${previewAlign} text-gray-700`} style={{ fontSize: fontSize * PREVIEW_SCALE }}>
                {previewLabel}
              </div>
            </div>
          </div>

          <div className="flex w-full max-w-xs flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Position
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as PageNumberPosition)}
                className="rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="bottom-left">Bas à gauche</option>
                <option value="bottom-center">Bas au centre</option>
                <option value="bottom-right">Bas à droite</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Commencer à
              <input
                type="number"
                min={1}
                value={startAt}
                onChange={(e) => setStartAt(Number(e.target.value) || 1)}
                className="rounded-md border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Taille du texte ({fontSize}pt)
              <input
                type="range"
                min={8}
                max={24}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
            </label>

            {result ? (
              <DownloadResultCard
                fileSizeBytes={result.byteLength}
                onDownload={() => downloadBytes(result, `numerote-${doc.fileName}`)}
                onReset={reset}
              />
            ) : (
              <div className="flex flex-col gap-2">
                <ProcessingButton label="Ajouter les numéros" onClick={handleApply} />
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
