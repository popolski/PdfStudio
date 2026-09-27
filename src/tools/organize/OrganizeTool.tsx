import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { PdfDropzone } from '../../components/PdfDropzone'
import { PageThumbnailGrid } from '../../components/PageThumbnailGrid'
import { ProcessingButton } from '../../components/ProcessingButton'
import { DownloadResultCard } from '../../components/DownloadResultCard'
import { usePageEntries } from '../../lib/pdf/usePageEntries'
import { loadPageEntries } from '../../lib/pdf/loadPageEntries'
import { downloadBytes } from '../../lib/pdf/download'
import { applyOrganize } from './organizeLogic'

export function OrganizeTool() {
  const [sourceBytes, setSourceBytes] = useState<ArrayBuffer | null>(null)
  const [fileName, setFileName] = useState('')
  const [pages, dispatch] = usePageEntries()
  const [result, setResult] = useState<Uint8Array | null>(null)

  async function handleFiles(files: File[]) {
    const file = files[0]
    const bytes = await file.arrayBuffer()
    const entries = await loadPageEntries({ id: 'file', name: file.name, bytes })
    setSourceBytes(bytes)
    setFileName(file.name)
    setResult(null)
    dispatch({ type: 'ADD_PAGES', pages: entries })
  }

  function reset() {
    setSourceBytes(null)
    setFileName('')
    setResult(null)
    dispatch({ type: 'CLEAR' })
  }

  async function handleApply() {
    if (!sourceBytes) return
    const bytes = await applyOrganize(sourceBytes, pages)
    setResult(bytes)
  }

  function updatePages(action: Parameters<typeof dispatch>[0]) {
    setResult(null)
    dispatch(action)
  }

  return (
    <ToolLayout
      title="Organiser un PDF"
      description="Réorganisez, supprimez ou faites pivoter les pages par glisser-déposer."
    >
      {!sourceBytes && (
        <PdfDropzone
          accept="application/pdf"
          label="Glissez un PDF ici"
          hint="ou cliquez pour en choisir un"
          features={['Réordonner les pages', 'Pivoter ou retirer une page', 'Exporter le PDF réorganisé']}
          onFiles={handleFiles}
        />
      )}

      {sourceBytes && (
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
            <p className="mb-4 text-sm font-medium text-muted">{fileName} · {pages.length} page{pages.length > 1 ? 's' : ''}</p>
            {pages.length > 0 ? (
              <PageThumbnailGrid
                pages={pages}
                onReorder={(fromId, toId) => updatePages({ type: 'REORDER', fromId, toId })}
                onDelete={(id) => updatePages({ type: 'DELETE_PAGE', id })}
                onRotate={(id) => updatePages({ type: 'ROTATE_PAGE', id })}
              />
            ) : (
              <p className="rounded-xl bg-brand-50 p-5 text-sm text-muted">Toutes les pages ont été retirées. Recommencez avec un autre PDF.</p>
            )}
          </div>

          {result ? (
            <DownloadResultCard
              fileSizeBytes={result.byteLength}
              onDownload={() => downloadBytes(result, `organise-${fileName}`)}
              onReset={reset}
            />
          ) : (
            <div className="flex justify-center gap-3">
              <ProcessingButton label="Appliquer les modifications" onClick={handleApply} disabled={pages.length === 0} />
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
