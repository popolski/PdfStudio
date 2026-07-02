import { useEffect, useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { PdfDropzone } from '../../components/PdfDropzone'
import { ProcessingButton } from '../../components/ProcessingButton'
import { DownloadResultCard } from '../../components/DownloadResultCard'
import { downloadBytes } from '../../lib/pdf/download'
import { compressPdfLight, compressPdfAggressive, estimateAggressiveCompression, type CompressionEstimate } from './compressLogic'

type Mode = 'light' | 'aggressive'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function CompressTool() {
  const [sourceBytes, setSourceBytes] = useState<ArrayBuffer | null>(null)
  const [fileName, setFileName] = useState('')
  const [mode, setMode] = useState<Mode>('light')
  const [quality, setQuality] = useState(60)
  const [estimate, setEstimate] = useState<CompressionEstimate | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [result, setResult] = useState<Uint8Array | null>(null)

  async function handleFiles(files: File[]) {
    const file = files[0]
    const bytes = await file.arrayBuffer()
    setSourceBytes(bytes)
    setFileName(file.name)
    setResult(null)
  }

  function reset() {
    setSourceBytes(null)
    setFileName('')
    setResult(null)
    setEstimate(null)
  }

  useEffect(() => {
    if (!sourceBytes || mode !== 'aggressive') {
      setEstimate(null)
      return
    }
    let cancelled = false
    setIsEstimating(true)
    const timeout = setTimeout(() => {
      estimateAggressiveCompression(sourceBytes, quality / 100).then((result) => {
        if (!cancelled) {
          setEstimate(result)
          setIsEstimating(false)
        }
      })
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [sourceBytes, mode, quality])

  async function handleApply() {
    if (!sourceBytes) return
    const bytes =
      mode === 'light' ? await compressPdfLight(sourceBytes) : await compressPdfAggressive(sourceBytes, quality / 100)
    setResult(bytes)
  }

  const originalSize = sourceBytes?.byteLength ?? 0
  const realSavingsPercent = result ? Math.round((1 - result.byteLength / originalSize) * 100) : null

  return (
    <ToolLayout
      title="Compresser un PDF"
      description="Réduisez la taille de votre PDF. Choisissez entre une compression légère (sûre) ou forte (avec un taux réglable)."
    >
      {!sourceBytes && (
        <PdfDropzone accept="application/pdf" label="Déposez un fichier PDF ici" onFiles={handleFiles} />
      )}

      {sourceBytes && (
        <div className="flex flex-col items-center gap-6">
          <p className="text-sm text-gray-500">
            {fileName} — {formatSize(originalSize)}
          </p>

          {!result && (
            <div className="flex w-full max-w-md flex-col gap-4">
              <div className="flex gap-2 rounded-lg border border-gray-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setMode('light')}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    mode === 'light' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Légère
                </button>
                <button
                  type="button"
                  onClick={() => setMode('aggressive')}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    mode === 'aggressive' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Forte
                </button>
              </div>

              {mode === 'light' && (
                <p className="text-sm text-gray-500">
                  Réorganise le fichier sans perte de qualité. Gains modestes, meilleurs sur les PDF riches en images.
                </p>
              )}

              {mode === 'aggressive' && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
                    Transforme chaque page en image : gains importants, mais le texte devient non sélectionnable et non
                    recherchable. À réserver aux PDF scannés ou riches en images.
                  </p>
                  <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Taux de compression ({quality}% de qualité conservée)
                    <input
                      type="range"
                      min={10}
                      max={95}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                    />
                  </label>
                  <div className="rounded-lg border border-gray-200 bg-white p-3 text-center text-sm">
                    {isEstimating && <span className="text-gray-400">Estimation en cours…</span>}
                    {!isEstimating && estimate && estimate.savingsPercent > 0 && (
                      <span>
                        Estimation : <strong>{formatSize(estimate.estimatedSize)}</strong> (
                        <strong>{estimate.savingsPercent}%</strong> plus léger)
                      </span>
                    )}
                    {!isEstimating && estimate && estimate.savingsPercent <= 0 && (
                      <span className="text-amber-700">
                        Estimation : <strong>{formatSize(estimate.estimatedSize)}</strong> — ce mode alourdirait ce
                        fichier (peu adapté aux PDF surtout composés de texte).
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {result ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-gray-600">
                {formatSize(originalSize)} → {formatSize(result.byteLength)}
                {realSavingsPercent !== null && realSavingsPercent > 0 && (
                  <span className="ml-1 font-semibold text-green-700">(-{realSavingsPercent}%)</span>
                )}
                {realSavingsPercent !== null && realSavingsPercent <= 0 && (
                  <span className="ml-1 font-semibold text-amber-700">(fichier plus lourd qu'à l'origine)</span>
                )}
              </p>
              <DownloadResultCard
                fileSizeBytes={result.byteLength}
                onDownload={() => downloadBytes(result, `compresse-${fileName}`)}
                onReset={reset}
              />
            </div>
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
