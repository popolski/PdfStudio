import { createWorker, type LoggerMessage } from 'tesseract.js'

export interface OcrLanguage {
  code: string
  label: string
}

export const OCR_LANGUAGES: OcrLanguage[] = [
  { code: 'fra', label: 'Français' },
  { code: 'eng', label: 'Anglais' },
  { code: 'spa', label: 'Espagnol' },
  { code: 'deu', label: 'Allemand' },
  { code: 'ita', label: 'Italien' },
]

export async function recognizeImageText(
  file: File | Blob,
  language: string,
  onProgress: (progress: number, status: string) => void,
): Promise<string> {
  const worker = await createWorker(language, undefined, {
    logger: (message: LoggerMessage) => onProgress(message.progress, message.status),
  })

  try {
    const { data } = await worker.recognize(file)
    return data.text
  } finally {
    await worker.terminate()
  }
}
