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
    setSourceBytes(bytes)
    setFileName(file.name)
    setResult(null)
    const entries = await loadPageEntries({ id: 'file', name: file.name, bytes })
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

  return (
    <ToolLayout
      title="Organiser un PDF"
      description="Réorganisez, supprimez ou faites pivoter les pages par glisser-déposer."
    >
      {!sourceBytes && (
        <PdfDropzone
          accept="application/pdf"
          label="Déposez un fichier PDF ici"
          hint="ou cliquez pour parcourir vos fichiers"
          onFiles={handleFiles}
        />
      )}

      {sourceBytes && pages.length > 0 && (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-gray-500">{fileName} — {pages.length} page(s)</p>
          <PageThumbnailGrid
            pages={pages}
            onReorder={(fromId, toId) => dispatch({ type: 'REORDER', fromId, toId })}
            onDelete={(id) => dispatch({ type: 'DELETE_PAGE', id })}
            onRotate={(id) => dispatch({ type: 'ROTATE_PAGE', id })}
          />

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
