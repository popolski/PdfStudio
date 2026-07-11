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

interface PositionedWord {
  text: string
  x: number
  y: number
  height: number
}

function median(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const sorted = [...numbers].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

/**
 * Reconstruit l'ordre de lecture (ligne par ligne, gauche à droite) à partir de la position
 * de chaque mot, plutôt que de faire confiance au texte brut de Tesseract : sur les mises en
 * page à deux colonnes (texte + nombre aligné à droite), Tesseract segmente parfois le texte
 * et les nombres en blocs internes distincts, et son assemblage automatique les recolle dans
 * le mauvais ordre.
 */
function reconstructReadingOrder(words: PositionedWord[]): string {
  if (words.length === 0) return ''

  const lineTolerance = Math.max(2, median(words.map((w) => w.height)) * 0.5)
  const sorted = [...words].sort((a, b) => a.y - b.y || a.x - b.x)

  const lines: PositionedWord[][] = []
  for (const word of sorted) {
    const lastLine = lines[lines.length - 1]
    if (lastLine && Math.abs(lastLine[0].y - word.y) <= lineTolerance) {
      lastLine.push(word)
    } else {
      lines.push([word])
    }
  }

  return lines
    .map((line) =>
      [...line]
        .sort((a, b) => a.x - b.x)
        .map((w) => w.text)
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
    const words: PositionedWord[] = (data.blocks ?? []).flatMap((block) =>
      block.paragraphs.flatMap((paragraph) =>
        paragraph.lines.flatMap((line) =>
          line.words.map((word) => ({
            text: word.text,
            x: word.bbox.x0,
            y: word.bbox.y0,
            height: word.bbox.y1 - word.bbox.y0,
          })),
        ),
      ),
    )
    return reconstructReadingOrder(words)
  } finally {
    await worker.terminate()
  }
}
