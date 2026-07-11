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

export async function recognizeImageText(
  file: File | Blob,
  language: string,
  onProgress: (progress: number, status: string) => void,
): Promise<string> {
  const worker = await createWorker(language, undefined, {
    logger: (message: LoggerMessage) => onProgress(message.progress, message.status),
  })

  try {
    const { data } = await worker.recognize(file, {}, { blocks: true })
    const lines = (data.blocks ?? []).flatMap((block) => block.paragraphs.flatMap((paragraph) => paragraph.lines))
    return reconstructReadingOrder(lines)
  } finally {
    await worker.terminate()
  }
}
