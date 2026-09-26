import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react'
import { acceptsFile } from './acceptsFile'

interface PdfDropzoneProps {
  accept: string
  multiple?: boolean
  label: string
  hint?: string
  onFiles: (files: File[]) => void | Promise<void>
}

export function PdfDropzone({ accept, multiple = false, label, hint, onFiles }: PdfDropzoneProps) {
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
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
          isDragging ? 'border-brand-500 bg-brand-50' : 'border-gray-300 bg-white hover:border-brand-300'
        }`}
      >
        <svg className="h-10 w-10 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        <p className="text-lg font-medium text-gray-800">{label}</p>
        {hint && <p className="text-sm text-gray-500">{hint}</p>}
        {acceptsImage && <p className="text-xs text-gray-400">ou collez une image copiée (Ctrl+V)</p>}
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
