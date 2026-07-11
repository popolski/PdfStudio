import { useState } from 'react'
import { ToolLayout } from '../../components/ToolLayout'
import { PdfDropzone } from '../../components/PdfDropzone'
import { downloadBlob } from '../../lib/pdf/download'
import { recognizeImageText, OCR_LANGUAGES } from './imageToTextLogic'

export function ImageToTextTool() {
  const [imageUrl, setImageUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [language, setLanguage] = useState('fra')
  const [text, setText] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusLabel, setStatusLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function handleFiles(files: File[]) {
    const file = files[0]
    setPendingFile(file)
    setFileName(file.name)
    setImageUrl(URL.createObjectURL(file))
    setText(null)
    setError(null)
  }

  async function handleRecognize() {
    if (!pendingFile) return
    setIsRunning(true)
    setError(null)
    setProgress(0)
    try {
      const result = await recognizeImageText(pendingFile, language, (p, status) => {
        setProgress(p)
        setStatusLabel(status)
      })
      setText(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "La reconnaissance a échoué.")
    } finally {
      setIsRunning(false)
    }
  }

  function reset() {
    setImageUrl('')
    setFileName('')
    setPendingFile(null)
    setText(null)
    setError(null)
    setProgress(0)
  }

  async function handleCopy() {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout
      title="Image vers texte (OCR)"
      description="Extrait le texte visible dans une image par reconnaissance optique de caractères. Le moteur OCR est téléchargé au premier usage (nécessite une connexion internet), mais l'image elle-même ne quitte jamais votre navigateur."
    >
      {!imageUrl && (
        <PdfDropzone
          accept="image/png,image/jpeg,image/webp,image/bmp"
          label="Déposez une image ici"
          hint="PNG, JPEG, WebP ou BMP"
          onFiles={handleFiles}
        />
      )}

      {imageUrl && (
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white p-4">
            <img src={imageUrl} alt="Aperçu" className="max-h-[500px] rounded" />
          </div>

          <div className="flex w-full max-w-sm flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Langue du texte
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isRunning}
                className="rounded-md border border-gray-300 px-3 py-2"
              >
                {OCR_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </label>

            {text === null && (
              <button
                type="button"
                onClick={handleRecognize}
                disabled={isRunning}
                className="rounded-lg bg-brand-600 px-5 py-3 font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isRunning ? 'Reconnaissance en cours…' : 'Extraire le texte'}
              </button>
            )}

            {isRunning && (
              <div className="flex flex-col gap-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-brand-600 transition-all"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {statusLabel} — {Math.round(progress * 100)}%
                </p>
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            {text !== null && (
              <div className="flex flex-col gap-2">
                <textarea
                  readOnly
                  value={text}
                  className="h-64 w-full rounded-md border border-gray-300 p-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      downloadBlob(new Blob([text], { type: 'text/plain' }), `${fileName.replace(/\.[^.]+$/, '')}.txt`)
                    }
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    Télécharger .txt
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {copied ? 'Copié !' : 'Copier'}
                  </button>
                </div>
              </div>
            )}

            <button type="button" onClick={reset} className="text-left text-sm text-gray-500 hover:text-gray-700">
              Recommencer
            </button>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
