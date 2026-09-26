interface DownloadResultCardProps {
  fileSizeBytes: number
  onDownload: () => void
  onReset: () => void
  compact?: boolean
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function DownloadResultCard({ fileSizeBytes, onDownload, onReset, compact = false }: DownloadResultCardProps) {
  return (
    <div className={`flex flex-col items-center gap-3 text-center ${compact ? '' : 'rounded-2xl border border-line bg-white p-6 shadow-sm'}`}>
      <p className="font-semibold text-green-800">Votre fichier est prêt ({formatSize(fileSizeBytes)})</p>
      <div className={`flex gap-3 ${compact ? 'w-full flex-col' : 'flex-wrap justify-center'}`}>
        <button
          type="button"
          onClick={onDownload}
          className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700"
        >
          Télécharger
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-line bg-white px-5 py-2.5 font-medium text-ink hover:bg-brand-50"
        >
          Recommencer
        </button>
      </div>
    </div>
  )
}
