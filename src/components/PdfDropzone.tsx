import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react'
import { acceptsFile } from './acceptsFile'

interface PdfDropzoneProps {
  accept: string
  multiple?: boolean
  compact?: boolean
  label: string
  hint?: string
  onFiles: (files: File[]) => void | Promise<void>
}

export function PdfDropzone({ accept, multiple = false, compact = false, label, hint, onFiles }: PdfDropzoneProps) {
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
        className={`flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed text-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
          compact ? 'min-h-20 flex-row p-4' : 'min-h-44 flex-col p-8'
        } ${
          isDragging ? 'border-brand-500 bg-brand-100' : 'border-brand-200 bg-brand-50 hover:border-brand-500'
        }`}
      >
        <svg className={`${compact ? 'h-7 w-7' : 'h-10 w-10'} shrink-0 text-brand-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        <div>
          <p className={`${compact ? 'text-sm' : 'text-lg'} font-semibold text-ink`}>{label}</p>
          {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
          {acceptsImage && !compact && <p className="mt-1 text-xs text-muted">ou collez une image copiée (Ctrl+V)</p>}
        </div>
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
