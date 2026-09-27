import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react'
import { acceptsFile } from './acceptsFile'

interface PdfDropzoneProps {
  accept: string
  multiple?: boolean
  compact?: boolean
  label: string
  hint?: string
  features?: string[]
  onFiles: (files: File[]) => void | Promise<void>
}

export function PdfDropzone({ accept, multiple = false, compact = false, label, hint, features, onFiles }: PdfDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const acceptsImage = accept.includes('image')

  const deliver = useCallback(async (files: File[]) => {
    const accepted = files.filter((file) => acceptsFile(file, accept))
    if (accepted.length === 0) {
      setError('Format non pris en charge. Choisissez un fichier au format indiqué.')
      return
    }
    setError(accepted.length < files.length ? 'Certains fichiers ont été ignorés : format non pris en charge.' : null)
    try {
      await onFiles(multiple ? accepted : [accepted[0]])
    } catch {
      setError("Impossible d'ouvrir ce fichier. Vérifiez son format ou son état.")
    }
  }, [accept, multiple, onFiles])

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    const files = Array.from(event.dataTransfer.files)
    if (files.length > 0) void deliver(files)
  }

  useEffect(() => {
    if (!acceptsImage) return

    function handlePaste(event: ClipboardEvent) {
      const items = event.clipboardData?.items
      if (!items) return
      const pastedFiles = Array.from(items)
        .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null)
      if (pastedFiles.length > 0) void deliver(pastedFiles)
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [acceptsImage, deliver])

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        className={`mx-auto flex w-full items-center justify-center gap-3 border-2 border-dashed text-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
          compact ? 'min-h-20 flex-row rounded-xl p-4' : 'min-h-[22rem] max-w-3xl flex-col rounded-[1.4rem] bg-white p-7 shadow-xl sm:p-10'
        } ${
          isDragging ? 'border-brand-500 bg-brand-50' : compact ? 'border-brand-200 bg-brand-50 hover:border-brand-500' : 'border-[#b8c9da] hover:border-brand-500'
        }`}
      >
        <span className={`grid shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-500 ${compact ? 'h-10 w-10' : 'mb-1 h-16 w-16'}`}>
          <svg className={compact ? 'h-6 w-6' : 'h-9 w-9'} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm8 0v5h5M8 12h8M8 16h8" />
          </svg>
        </span>
        <div>
          <p className={`${compact ? 'text-sm' : 'text-2xl tracking-tight sm:text-3xl'} font-bold text-ink`}>{label}</p>
          {hint && <p className={`text-muted ${compact ? 'mt-1 text-xs sm:text-sm' : 'mt-2 text-sm sm:text-base'}`}>{hint}</p>}
          {acceptsImage && !compact && <p className="mt-1 text-sm text-muted">Vous pouvez aussi coller une image (Ctrl+V)</p>}
        </div>
        {!compact && features && features.length > 0 && (
          <ul className="mt-4 space-y-2 text-left text-sm text-ink">
            {features.map((feature) => <li key={feature} className="flex items-center gap-2"><span className="text-brand-500" aria-hidden="true">✓</span>{feature}</li>)}
          </ul>
        )}
        {!compact && <p className="mt-5 rounded-lg bg-[#eff5ee] px-3 py-2 text-xs font-medium text-[#3c7550]">🔒 Le fichier reste sur cet appareil</p>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            if (files.length > 0) void deliver(files)
            e.target.value = ''
          }}
        />
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
