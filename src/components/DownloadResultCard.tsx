interface DownloadResultCardProps {
  fileSizeBytes: number
  onDownload: () => void
  onReset: () => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function DownloadResultCard({ fileSizeBytes, onDownload, onReset }: DownloadResultCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-6 text-center">
      <p className="font-medium text-green-800">Votre fichier est prêt ({formatSize(fileSizeBytes)})</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onDownload}
          className="rounded-lg bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-700"
        >
          Télécharger
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          Recommencer
        </button>
      </div>
    </div>
  )
}
