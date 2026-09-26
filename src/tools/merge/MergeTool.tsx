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
      const entries = await loadPageEntries({ id: fileId, name: file.name, bytes })
      sourcesRef.current.set(fileId, bytes)
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

  function updatePages(action: Parameters<typeof dispatch>[0]) {
    setResult(null)
    dispatch(action)
  }

  const fileCount = new Set(pages.map((page) => page.sourceFileId)).size
  const step = result ? 3 : pages.length > 0 ? 2 : 1

  return (
    <ToolLayout title="Fusionner des PDF" description="Ajoutez vos fichiers, vérifiez l'ordre des pages, puis téléchargez le résultat.">
      <ol aria-label="Étapes de la fusion" className="mb-7 grid grid-cols-3 gap-1 text-[11px] sm:gap-2 sm:text-sm">
        {['Ajouter', 'Ajuster', 'Télécharger'].map((label, index) => (
          <li
            key={label}
            aria-current={step === index + 1 ? 'step' : undefined}
            className={`flex min-w-0 items-center gap-1 rounded-lg px-1 py-2 font-medium sm:gap-2 sm:px-3 ${
              step === index + 1 ? 'bg-brand-100 text-brand-700' : index + 1 < step ? 'text-ink' : 'text-muted'
            }`}
          >
            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs sm:h-6 sm:w-6 ${
              step === index + 1 ? 'bg-brand-600 text-white' : 'bg-white text-muted'
            }`}>{index + 1}</span>
            <span>{label}</span>
          </li>
        ))}
      </ol>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <section className="min-w-0 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6" aria-label="Fichiers et pages">
          <PdfDropzone
            accept="application/pdf"
            multiple
            compact={pages.length > 0}
            label={pages.length > 0 ? 'Ajouter un autre PDF' : 'Choisir des fichiers PDF'}
            hint={pages.length > 0 ? 'Les nouvelles pages sont ajoutées à la fin' : 'Glissez vos fichiers ici ou parcourez votre appareil'}
            onFiles={handleFiles}
          />

          {pages.length > 0 && (
            <div className="mt-7">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold text-ink">Pages du document</h2>
                <p className="text-sm text-muted">{pages.length} page{pages.length > 1 ? 's' : ''} · {fileCount} fichier{fileCount > 1 ? 's' : ''}</p>
              </div>
              <p className="mb-4 text-sm text-muted">Glissez une page ou utilisez les flèches pour changer l'ordre.</p>
              <PageThumbnailGrid
                pages={pages}
                onReorder={(fromId, toId) => updatePages({ type: 'REORDER', fromId, toId })}
                onDelete={(id) => updatePages({ type: 'DELETE_PAGE', id })}
                onRotate={(id) => updatePages({ type: 'ROTATE_PAGE', id })}
              />
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-line bg-white p-5 shadow-sm lg:sticky lg:top-6" aria-label="Résultat de la fusion">
          <h2 className="text-base font-semibold text-ink">Votre document</h2>
          {pages.length === 0 ? (
            <p className="mt-3 text-sm leading-relaxed text-muted">Ajoutez des PDF pour voir les pages à assembler.</p>
          ) : (
            <>
              <p className="my-4 text-sm text-muted">{pages.length} page{pages.length > 1 ? 's' : ''} dans le fichier final</p>
              {result ? (
                <DownloadResultCard
                  compact
                  fileSizeBytes={result.byteLength}
                  onDownload={() => downloadBytes(result, 'fusion.pdf')}
                  onReset={reset}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  <ProcessingButton fullWidth label="Fusionner les PDF" onClick={handleApply} />
                  <button type="button" onClick={reset} className="rounded-lg border border-line px-5 py-2.5 font-medium text-muted hover:bg-brand-50">
                    Tout effacer
                  </button>
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </ToolLayout>
  )
}
