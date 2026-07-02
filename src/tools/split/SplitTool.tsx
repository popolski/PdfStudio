import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { PdfDropzone } from '../../components/PdfDropzone'
import { PageThumbnailGrid } from '../../components/PageThumbnailGrid'
import { ProcessingButton } from '../../components/ProcessingButton'
import { DownloadResultCard } from '../../components/DownloadResultCard'
import { usePageEntries } from '../../lib/pdf/usePageEntries'
import { loadPageEntries } from '../../lib/pdf/loadPageEntries'
import { downloadBytes, downloadBlob } from '../../lib/pdf/download'
import { extractPages, splitToIndividualPages } from './splitLogic'

export function SplitTool() {
  const [sourceBytes, setSourceBytes] = useState<ArrayBuffer | null>(null)
  const [fileName, setFileName] = useState('')
  const [pages, dispatch] = usePageEntries()
  const [result, setResult] = useState<{ kind: 'pdf' | 'zip'; data: Uint8Array | Blob } | null>(null)

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

  const selectedIndices = pages.filter((p) => p.selected).map((p) => p.sourcePageIndex)

  async function handleExtractOne() {
    if (!sourceBytes) return
    const bytes = await extractPages(sourceBytes, selectedIndices)
    setResult({ kind: 'pdf', data: bytes })
  }

  async function handleSplitIndividual() {
    if (!sourceBytes) return
    const blob = await splitToIndividualPages(sourceBytes, selectedIndices, fileName.replace(/\.pdf$/i, ''))
    setResult({ kind: 'zip', data: blob })
  }

  function handleDownload() {
    if (!result) return
    if (result.kind === 'pdf') downloadBytes(result.data as Uint8Array, `extrait-${fileName}`)
    else downloadBlob(result.data as Blob, `pages-${fileName.replace(/\.pdf$/i, '')}.zip`)
  }

  return (
    <ToolLayout title="Diviser un PDF" description="Sélectionnez les pages à extraire, en un seul fichier ou en pages séparées.">
      {!sourceBytes && (
        <PdfDropzone accept="application/pdf" label="Déposez un fichier PDF ici" onFiles={handleFiles} />
      )}

      {sourceBytes && pages.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{fileName} — {selectedIndices.length} / {pages.length} page(s) sélectionnée(s)</span>
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
              fileSizeBytes={result.data instanceof Blob ? result.data.size : result.data.byteLength}
              onDownload={handleDownload}
              onReset={reset}
            />
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              <ProcessingButton
                label="Extraire en un seul PDF"
                onClick={handleExtractOne}
                disabled={selectedIndices.length === 0}
              />
              <ProcessingButton
                label="Diviser en fichiers séparés (ZIP)"
                onClick={handleSplitIndividual}
                disabled={selectedIndices.length === 0}
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
