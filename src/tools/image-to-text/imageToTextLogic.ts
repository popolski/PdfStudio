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

/**
 * Reconstruit le texte ligne par ligne à partir des blocs de Tesseract, en gardant tel quel
 * le regroupement de mots par ligne décidé par Tesseract (fiable), mais en re-triant les
 * lignes (par position verticale) et les mots au sein d'une ligne (par position horizontale) :
 * sur les mises en page à deux colonnes (texte + nombre aligné à droite), l'assemblage
 * automatique du texte brut de Tesseract peut mélanger l'ordre entre colonnes/blocs.
 */
function reconstructReadingOrder(
  lines: { bbox: { x0: number; y0: number }; words: { text: string; bbox: { x0: number } }[] }[],
): string {
  return [...lines]
    .sort((a, b) => a.bbox.y0 - b.bbox.y0)
    .map((line) =>
      [...line.words]
        .sort((a, b) => a.bbox.x0 - b.bbox.x0)
        .map((word) => word.text)
        .join(' '),
    )
    .join('\n')
}

const UPSCALE_WIDTH_THRESHOLD = 1200
const UPSCALE_FACTOR = 2

/**
 * Agrandit l'image avant l'OCR si elle est de taille modeste : Tesseract lit mieux les petits
 * caractères (ex : une légende ou un numéro en petite taille) sur une image plus grande.
 * N'agrandit pas les images déjà grandes (inutile, plus lent).
 */
async function upscaleIfSmall(file: File | Blob): Promise<File | Blob> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error("Impossible de lire l'image"))
      img.src = url
    })

    if (img.naturalWidth >= UPSCALE_WIDTH_THRESHOLD) return file

    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth * UPSCALE_FACTOR
    canvas.height = img.naturalHeight * UPSCALE_FACTOR
    const context = canvas.getContext('2d')
    if (!context) return file
    context.drawImage(img, 0, 0, canvas.width, canvas.height)

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Échec de la préparation de l'image"))), 'image/png'),
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function recognizeImageText(
  file: File | Blob,
  language: string,
  onProgress: (progress: number, status: string) => void,
): Promise<string> {
  const worker = await createWorker(language, undefined, {
    logger: (message: LoggerMessage) => onProgress(message.progress, message.status),
  })

  try {
    const preparedImage = await upscaleIfSmall(file)
    const { data } = await worker.recognize(preparedImage, {}, { blocks: true })
    const lines = (data.blocks ?? []).flatMap((block) => block.paragraphs.flatMap((paragraph) => paragraph.lines))
    return reconstructReadingOrder(lines)
  } finally {
    await worker.terminate()
  }
}
