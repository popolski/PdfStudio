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

export interface OcrWord {
  text: string
  x0: number
  y0: number
  x1: number
  y1: number
}

export interface OcrResult {
  text: string
  words: OcrWord[]
  imageWidth: number
  imageHeight: number
}

function getImageDimensions(file: File | Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Impossible de lire les dimensions de l'image"))
    }
    img.src = url
  })
}

export async function recognizeImage(
  file: File | Blob,
  language: string,
  onProgress: (progress: number, status: string) => void,
): Promise<OcrResult> {
  const worker = await createWorker(language, undefined, {
    logger: (message: LoggerMessage) => onProgress(message.progress, message.status),
  })

  try {
    const [{ data }, dimensions] = await Promise.all([
      worker.recognize(file, {}, { text: true, blocks: true }),
      getImageDimensions(file),
    ])

    const words: OcrWord[] = (data.blocks ?? []).flatMap((block) =>
      block.paragraphs.flatMap((paragraph) =>
        paragraph.lines.flatMap((line) =>
          line.words.map((word) => ({
            text: word.text,
            x0: word.bbox.x0,
            y0: word.bbox.y0,
            x1: word.bbox.x1,
            y1: word.bbox.y1,
          })),
        ),
      ),
    )

    return { text: data.text, words, imageWidth: dimensions.width, imageHeight: dimensions.height }
  } finally {
    await worker.terminate()
  }
}
