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

export interface OcrTextResult {
  /** Texte brut, tabulation avant un mot isolé loin à droite (compatible copie dans un champ texte simple). */
  text: string
  /**
   * Représentation HTML (tableau à 2 colonnes, seconde colonne alignée à droite) à écrire dans
   * le presse-papiers en plus du texte brut : les traitements de texte comme OpenOffice Writer
   * collent automatiquement cette version riche plutôt que le texte brut, ce qui aligne les
   * nombres sans manipulation de la part de l'utilisateur.
   */
  html: string
}

interface ReconstructedLine {
  main: string
  trailing: string | null
}

const COLUMN_GAP_FACTOR = 2

/**
 * Reconstruit chaque ligne à partir des blocs de Tesseract, en gardant tel quel le
 * regroupement de mots par ligne décidé par Tesseract (fiable), mais en re-triant les lignes
 * (par position verticale) et les mots au sein d'une ligne (par position horizontale) : sur
 * les mises en page à deux colonnes (texte + nombre aligné à droite), l'assemblage automatique
 * du texte brut de Tesseract peut mélanger l'ordre entre colonnes/blocs.
 *
 * Quand l'écart horizontal entre deux mots d'une ligne dépasse nettement la normale (ex : un
 * numéro isolé loin à droite), le mot le plus à droite est isolé comme colonne secondaire
 * plutôt que simplement séparé par un espace.
 */
function reconstructLines(
  lines: {
    bbox: { x0: number; y0: number; y1: number }
    words: { text: string; bbox: { x0: number; x1: number } }[]
  }[],
): ReconstructedLine[] {
  return [...lines]
    .sort((a, b) => a.bbox.y0 - b.bbox.y0)
    .map((line) => {
      const sortedWords = [...line.words].sort((a, b) => a.bbox.x0 - b.bbox.x0)
      const lineHeight = Math.max(1, line.bbox.y1 - line.bbox.y0)

      let maxGap = -Infinity
      let splitIndex = -1
      for (let i = 1; i < sortedWords.length; i++) {
        const gap = sortedWords[i].bbox.x0 - sortedWords[i - 1].bbox.x1
        if (gap > maxGap) {
          maxGap = gap
          splitIndex = i
        }
      }

      const joinText = (words: typeof sortedWords) => words.map((w) => w.text).join(' ')

      if (splitIndex === -1 || maxGap <= lineHeight * COLUMN_GAP_FACTOR) {
        return { main: joinText(sortedWords), trailing: null }
      }

      return {
        main: joinText(sortedWords.slice(0, splitIndex)),
        trailing: joinText(sortedWords.slice(splitIndex)),
      }
    })
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildPlainText(lines: ReconstructedLine[]): string {
  return lines.map((line) => (line.trailing ? `${line.main}\t${line.trailing}` : line.main)).join('\n')
}

function buildHtmlTable(lines: ReconstructedLine[]): string {
  const rows = lines
    .map((line) => {
      if (line.trailing === null) {
        return `<tr><td colspan="2">${escapeHtml(line.main)}</td></tr>`
      }
      return `<tr><td>${escapeHtml(line.main)}</td><td style="text-align:right;white-space:nowrap;padding-left:16px">${escapeHtml(line.trailing)}</td></tr>`
    })
    .join('')

  return `<table style="border-collapse:collapse">${rows}</table>`
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
): Promise<OcrTextResult> {
  const worker = await createWorker(language, undefined, {
    logger: (message: LoggerMessage) => onProgress(message.progress, message.status),
  })

  try {
    const preparedImage = await upscaleIfSmall(file)
    const { data } = await worker.recognize(preparedImage, {}, { blocks: true })
    const rawLines = (data.blocks ?? []).flatMap((block) => block.paragraphs.flatMap((paragraph) => paragraph.lines))
    const lines = reconstructLines(rawLines)
    return { text: buildPlainText(lines), html: buildHtmlTable(lines) }
  } finally {
    await worker.terminate()
  }
}

export async function copyOcrResult(result: OcrTextResult): Promise<void> {
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
    const item = new ClipboardItem({
      'text/plain': new Blob([result.text], { type: 'text/plain' }),
      'text/html': new Blob([result.html], { type: 'text/html' }),
    })
    await navigator.clipboard.write([item])
  } else {
    await navigator.clipboard.writeText(result.text)
  }
}
