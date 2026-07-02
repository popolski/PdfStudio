import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { PdfDropzone } from '../../components/PdfDropzone'
import { PageThumbnailGrid } from '../../components/PageThumbnailGrid'
import { ProcessingButton } from '../../components/ProcessingButton'
import { DownloadResultCard } from '../../components/DownloadResultCard'
import { usePageEntries } from '../../lib/pdf/usePageEntries'
import { loadPageEntries } from '../../lib/pdf/loadPageEntries'
import { downloadBlob } from '../../lib/pdf/download'
import { exportPagesAsImages } from './pdfToImagesLogic'

export function PdfToImagesTool() {
  const [sourceBytes, setSourceBytes] = useState<ArrayBuffer | null>(null)
  const [fileName, setFileName] = useState('')
  const [pages, dispatch] = usePageEntries()
  const [result, setResult] = useState<Blob | null>(null)

  async function handleFiles(files: File[]) {
    const file = files[0]
    const bytes = await file.arrayBuffer()
    setSourceBytes(bytes)
    setFileName(file.name)
    setResult(null)
    const entries = await loadPageEntries({ id: 'file', name: file.name, bytes })
    dispatch({ type: 'ADD_PAGES', pages: entries.map((e) => ({ ...e, selected: true })) })
  }

  function reset() {
    setSourceBytes(null)
    setFileName('')
    setResult(null)
    dispatch({ type: 'CLEAR' })
  }

  const selectedPageNumbers = pages.filter((p) => p.selected).map((p) => p.sourcePageIndex + 1)

  async function handleApply() {
    if (!sourceBytes) return
    const blob = await exportPagesAsImages(sourceBytes, selectedPageNumbers, fileName.replace(/\.pdf$/i, ''))
    setResult(blob)
  }

  return (
    <ToolLayout title="PDF vers images" description="Exportez chaque page sélectionnée en image PNG.">
      {!sourceBytes && (
        <PdfDropzone accept="application/pdf" label="Déposez un fichier PDF ici" onFiles={handleFiles} />
      )}

      {sourceBytes && pages.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{fileName} — {selectedPageNumbers.length} / {pages.length} page(s) sélectionnée(s)</span>
            <button
              type="button"
              onClick={() => dispatch({ type: 'SELECT_ALL' })}
              className="rounded-md border border-gray-300 px-3 py-1 font-medium text-gray-700 hover:bg-gray-50"
            >
              Tout sélectionner
            </button>
          </div>
          <PageThumbnailGrid
            pages={pages}
            selectable
            onReorder={(fromId, toId) => dispatch({ type: 'REORDER', fromId, toId })}
            onToggleSelect={(id) => dispatch({ type: 'TOGGLE_SELECT', id })}
          />

          {result ? (
            <DownloadResultCard
              fileSizeBytes={result.size}
              onDownload={() => downloadBlob(result, `images-${fileName.replace(/\.pdf$/i, '')}.zip`)}
              onReset={reset}
            />
          ) : (
            <div className="flex justify-center gap-3">
              <ProcessingButton
                label="Exporter en images (ZIP)"
                onClick={handleApply}
                disabled={selectedPageNumbers.length === 0}
              />
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
