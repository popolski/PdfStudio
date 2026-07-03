import { Document, Packer, Paragraph, TextRun } from 'docx'
import { loadPdfDocument } from '../../lib/pdf/pdfjs'

const LINE_TOLERANCE = 2

interface TextItem {
  str: string
  x: number
  y: number
}

function groupIntoLines(items: TextItem[]): string[] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x)
  const lines: TextItem[][] = []

  for (const item of sorted) {
    const lastLine = lines[lines.length - 1]
    if (lastLine && Math.abs(lastLine[0].y - item.y) <= LINE_TOLERANCE) {
      lastLine.push(item)
    } else {
      lines.push([item])
    }
  }

  return lines.map((line) =>
    line
      .sort((a, b) => a.x - b.x)
      .map((item) => item.str)
      .join(' ')
      .trim(),
  )
}

export async function convertPdfToWord(sourceBytes: ArrayBuffer): Promise<Blob> {
  const pdf = await loadPdfDocument(sourceBytes)
  const paragraphs: Paragraph[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const items: TextItem[] = textContent.items
      .filter(
        (item): item is typeof item & { str: string; transform: number[] } =>
          'str' in item && 'transform' in item && item.str.trim().length > 0,
      )
      .map((item) => ({ str: item.str, x: item.transform[4], y: item.transform[5] }))

    const lines = groupIntoLines(items)
    for (const line of lines) {
      paragraphs.push(new Paragraph({ children: [new TextRun(line)] }))
    }

    if (pageNumber < pdf.numPages) {
      paragraphs.push(new Paragraph({ children: [new TextRun('')], pageBreakBefore: false }))
    }
  }

  const doc = new Document({
    sections: [{ children: paragraphs.length > 0 ? paragraphs : [new Paragraph('')] }],
  })

  return Packer.toBlob(doc)
}
