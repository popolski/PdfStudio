import { Document, HeadingLevel, ImageRun, Packer, Paragraph, TextRun } from 'docx'
import type { PDFPageProxy } from 'pdfjs-dist'
import { loadPdfDocument, OPS, Util } from '../../lib/pdf/pdfjs'

const LINE_TOLERANCE = 2
const PARAGRAPH_GAP_FACTOR = 1.6
const HEADING_1_FACTOR = 1.4
const HEADING_2_FACTOR = 1.15

interface LineInfo {
  text: string
  y: number
  fontSize: number
}

interface ImageBlock {
  y: number
  data: Uint8Array
  width: number
  height: number
}

async function extractLines(page: PDFPageProxy): Promise<LineInfo[]> {
  const textContent = await page.getTextContent()
  const items = textContent.items
    .filter(
      (item): item is typeof item & { str: string; transform: number[] } =>
        'str' in item && 'transform' in item && item.str.trim().length > 0,
    )
    .map((item) => ({
      str: item.str,
      x: item.transform[4],
      y: item.transform[5],
      fontSize: Math.hypot(item.transform[2], item.transform[3]),
    }))

  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x)
  const grouped: (typeof items)[] = []
  for (const item of sorted) {
    const lastLine = grouped[grouped.length - 1]
    if (lastLine && Math.abs(lastLine[0].y - item.y) <= LINE_TOLERANCE) {
      lastLine.push(item)
    } else {
      grouped.push([item])
    }
  }

  return grouped.map((line) => {
    const sortedLine = [...line].sort((a, b) => a.x - b.x)
    return {
      text: sortedLine.map((i) => i.str).join(' ').trim(),
      y: line[0].y,
      fontSize: Math.max(...line.map((i) => i.fontSize)),
    }
  })
}

/** Extrait les images peintes sur la page (hors masques/images en ligne) avec leur position, en suivant la pile de transformations (q/Q/cm) de la liste d'opérations. */
async function extractImages(page: PDFPageProxy): Promise<ImageBlock[]> {
  const opList = await page.getOperatorList()
  const stack: number[][] = []
  let ctm = [1, 0, 0, 1, 0, 0]
  const images: ImageBlock[] = []

  for (let i = 0; i < opList.fnArray.length; i++) {
    const fn = opList.fnArray[i]
    const args = opList.argsArray[i]

    if (fn === OPS.save) {
      stack.push(ctm)
    } else if (fn === OPS.restore) {
      ctm = stack.pop() ?? ctm
    } else if (fn === OPS.transform) {
      ctm = Util.transform(ctm, args as number[])
    } else if (fn === OPS.paintImageXObject) {
      const objId = args[0] as string
      // eslint-disable-next-line no-await-in-loop
      const imgObj = await new Promise<{ bitmap?: ImageBitmap; width: number; height: number } | null>((resolve) =>
        page.objs.get(objId, resolve),
      )
      if (!imgObj || !imgObj.bitmap) continue

      const corners = [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ].map(([x, y]) => [ctm[0] * x + ctm[2] * y + ctm[4], ctm[1] * x + ctm[3] * y + ctm[5]])
      const xs = corners.map((c) => c[0])
      const ys = corners.map((c) => c[1])
      const width = Math.max(...xs) - Math.min(...xs)
      const height = Math.max(...ys) - Math.min(...ys)

      const canvas = document.createElement('canvas')
      canvas.width = imgObj.width
      canvas.height = imgObj.height
      const context = canvas.getContext('2d')
      if (!context) continue
      context.drawImage(imgObj.bitmap, 0, 0)
      // eslint-disable-next-line no-await-in-loop
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Échec de conversion image'))), 'image/png'),
      )
      const data = new Uint8Array(await blob.arrayBuffer())

      images.push({
        y: Math.max(...ys),
        data,
        width: Math.max(1, Math.round(width)),
        height: Math.max(1, Math.round(height)),
      })
    }
  }

  return images
}

function mostCommon(numbers: number[]): number | null {
  if (numbers.length === 0) return null
  const counts = new Map<number, number>()
  for (const n of numbers) counts.set(n, (counts.get(n) ?? 0) + 1)
  let best = numbers[0]
  let bestCount = 0
  for (const [n, count] of counts) {
    if (count > bestCount) {
      best = n
      bestCount = count
    }
  }
  return best
}

type Block = ({ kind: 'line' } & LineInfo) | ({ kind: 'image' } & ImageBlock)

export async function convertPdfToWord(sourceBytes: ArrayBuffer): Promise<Blob> {
  const pdf = await loadPdfDocument(sourceBytes)

  const pagesLines: LineInfo[][] = []
  const pagesImages: ImageBlock[][] = []
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    pagesLines.push(await extractLines(page))
    pagesImages.push(await extractImages(page))
  }

  const bodyFontSize = mostCommon(pagesLines.flat().map((line) => Math.round(line.fontSize))) ?? 12

  const children: Paragraph[] = []

  for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex++) {
    const blocks: Block[] = [
      ...pagesLines[pageIndex].map((line): Block => ({ kind: 'line', ...line })),
      ...pagesImages[pageIndex].map((image): Block => ({ kind: 'image', ...image })),
    ].sort((a, b) => b.y - a.y)

    let currentParagraphLines: string[] = []
    let previousY: number | null = null

    const flushParagraph = () => {
      if (currentParagraphLines.length > 0) {
        children.push(new Paragraph({ children: [new TextRun(currentParagraphLines.join(' '))] }))
        currentParagraphLines = []
      }
    }

    for (const block of blocks) {
      if (block.kind === 'image') {
        flushParagraph()
        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                type: 'png',
                data: block.data,
                transformation: { width: block.width, height: block.height },
              }),
            ],
          }),
        )
        previousY = block.y
        continue
      }

      const isHeading1 = block.fontSize >= bodyFontSize * HEADING_1_FACTOR
      const isHeading2 = !isHeading1 && block.fontSize >= bodyFontSize * HEADING_2_FACTOR

      if (isHeading1 || isHeading2) {
        flushParagraph()
        children.push(
          new Paragraph({ text: block.text, heading: isHeading1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2 }),
        )
        previousY = block.y
        continue
      }

      const gap = previousY !== null ? previousY - block.y : 0
      if (previousY !== null && gap > bodyFontSize * PARAGRAPH_GAP_FACTOR) {
        flushParagraph()
      }
      currentParagraphLines.push(block.text)
      previousY = block.y
    }

    flushParagraph()
  }

  const doc = new Document({
    sections: [{ children: children.length > 0 ? children : [new Paragraph('')] }],
  })

  return Packer.toBlob(doc)
}
