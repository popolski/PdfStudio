import { useRef, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { PdfDropzone } from '../../components/PdfDropzone'
import { PageThumbnailGrid } from '../../components/PageThumbnailGrid'
import { ProcessingButton } from '../../components/ProcessingButton'
import { DownloadResultCard } from '../../components/DownloadResultCard'
import { usePageEntries } from '../../lib/pdf/usePageEntries'
import { loadPageEntries } from '../../lib/pdf/loadPageEntries'
import { downloadBytes } from '../../lib/pdf/download'
import { applyMerge } from './mergeLogic'

let fileCounter = 0

export function MergeTool() {
  const sourcesRef = useRef<Map<string, ArrayBuffer>>(new Map())
  const [pages, dispatch] = usePageEntries()
  const [result, setResult] = useState<Uint8Array | null>(null)

  async function handleFiles(files: File[]) {
    setResult(null)
    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const fileId = `f${fileCounter++}`
      sourcesRef.current.set(fileId, bytes)
      const entries = await loadPageEntries({ id: fileId, name: file.name, bytes })
      dispatch({ type: 'ADD_PAGES', pages: entries })
    }
  }

  function reset() {
    sourcesRef.current.clear()
    setResult(null)
    dispatch({ type: 'CLEAR' })
  }

  async function handleApply() {
    const bytes = await applyMerge(sourcesRef.current, pages)
    setResult(bytes)
  }

  return (
    <ToolLayout title="Fusionner des PDF" description="Combinez plusieurs fichiers PDF en un seul, dans l'ordre de votre choix.">
      <PdfDropzone
        accept="application/pdf"
        multiple
        label="Déposez vos fichiers PDF ici"
        hint="Vous pouvez ajouter plusieurs fichiers, glissez les pages pour changer l'ordre"
        onFiles={handleFiles}
      />

      {pages.length > 0 && (
        <div className="mt-6 flex flex-col gap-6">
          <p className="text-sm text-gray-500">{pages.length} page(s) au total</p>
          <PageThumbnailGrid
            pages={pages}
            onReorder={(fromId, toId) => dispatch({ type: 'REORDER', fromId, toId })}
            onDelete={(id) => dispatch({ type: 'DELETE_PAGE', id })}
            onRotate={(id) => dispatch({ type: 'ROTATE_PAGE', id })}
          />

          {result ? (
            <DownloadResultCard
              fileSizeBytes={result.byteLength}
              onDownload={() => downloadBytes(result, 'fusion.pdf')}
              onReset={reset}
            />
          ) : (
            <div className="flex justify-center gap-3">
              <ProcessingButton label="Fusionner" onClick={handleApply} disabled={pages.length === 0} />
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
