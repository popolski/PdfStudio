import { useRef, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { PdfDropzone } from '../../components/PdfDropzone'
import { PageThumbnailGrid } from '../../components/PageThumbnailGrid'
import { ProcessingButton } from '../../components/ProcessingButton'
import { DownloadResultCard } from '../../components/DownloadResultCard'
import { usePageEntries } from '../../lib/pdf/usePageEntries'
import { downloadBytes } from '../../lib/pdf/download'
import { buildPdfFromImages, type OrderedImage } from './imagesToPdfLogic'

let imageCounter = 0

export function ImagesToPdfTool() {
  const imagesRef = useRef<Map<string, OrderedImage>>(new Map())
  const [pages, dispatch] = usePageEntries()
  const [result, setResult] = useState<Uint8Array | null>(null)

  async function handleFiles(files: File[]) {
    setResult(null)
    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const id = `img${imageCounter++}`
      imagesRef.current.set(id, { bytes, mimeType: file.type || 'image/jpeg' })
      const thumbnailUrl = URL.createObjectURL(new Blob([bytes], { type: file.type }))
      dispatch({
        type: 'ADD_PAGES',
        pages: [
          {
            id,
            sourceFileId: id,
            sourceFileName: file.name,
            sourcePageIndex: 0,
            baseRotation: 0,
            rotation: 0,
            selected: false,
            thumbnailUrl,
          },
        ],
      })
    }
  }

  function reset() {
    imagesRef.current.clear()
    setResult(null)
    dispatch({ type: 'CLEAR' })
  }

  async function handleApply() {
    const orderedImages = pages
      .map((p) => imagesRef.current.get(p.sourceFileId))
      .filter((img): img is OrderedImage => img != null)
    const bytes = await buildPdfFromImages(orderedImages)
    setResult(bytes)
  }

  return (
    <ToolLayout title="Images vers PDF" description="Convertissez vos images (JPG, PNG) en un document PDF unique.">
      <PdfDropzone
        accept="image/jpeg,image/png"
        multiple
        label="Déposez vos images ici"
        hint="JPG ou PNG, plusieurs fichiers possibles"
        onFiles={handleFiles}
      />

      {pages.length > 0 && (
        <div className="mt-6 flex flex-col gap-6">
          <p className="text-sm text-gray-500">{pages.length} image(s) — glissez pour réordonner</p>
          <PageThumbnailGrid
            pages={pages}
            onReorder={(fromId, toId) => dispatch({ type: 'REORDER', fromId, toId })}
            onDelete={(id) => dispatch({ type: 'DELETE_PAGE', id })}
          />

          {result ? (
            <DownloadResultCard
              fileSizeBytes={result.byteLength}
              onDownload={() => downloadBytes(result, 'images.pdf')}
              onReset={reset}
            />
          ) : (
            <div className="flex justify-center gap-3">
              <ProcessingButton label="Créer le PDF" onClick={handleApply} disabled={pages.length === 0} />
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
