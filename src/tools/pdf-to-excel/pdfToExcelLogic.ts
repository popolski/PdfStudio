import { loadPdfDocument } from '../../lib/pdf/pdfjs'
import { buildXlsx, type XlsxSheet } from '../../lib/xlsx/buildXlsx'

const ROW_TOLERANCE = 3
const COLUMN_BUCKET_SIZE = 10

interface TextItem {
  str: string
  x: number
  y: number
}

function buildPageRows(items: TextItem[]): (string | null)[][] {
  if (items.length === 0) return []

  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x)
  const rows: TextItem[][] = []
  for (const item of sorted) {
    const lastRow = rows[rows.length - 1]
    if (lastRow && Math.abs(lastRow[0].y - item.y) <= ROW_TOLERANCE) {
      lastRow.push(item)
    } else {
      rows.push([item])
    }
  }

  const columnBuckets = Array.from(
    new Set(items.map((item) => Math.round(item.x / COLUMN_BUCKET_SIZE))),
  ).sort((a, b) => a - b)

  return rows.map((row) => {
    const cells: (string | null)[] = new Array(columnBuckets.length).fill(null)
    for (const item of row.sort((a, b) => a.x - b.x)) {
      const bucket = Math.round(item.x / COLUMN_BUCKET_SIZE)
      const colIndex = columnBuckets.indexOf(bucket)
      cells[colIndex] = cells[colIndex] ? `${cells[colIndex]} ${item.str}` : item.str
    }
    return cells
  })
}

export async function convertPdfToExcel(sourceBytes: ArrayBuffer): Promise<Blob> {
  const pdf = await loadPdfDocument(sourceBytes)
  const sheets: XlsxSheet[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const items: TextItem[] = textContent.items
      .filter(
        (item): item is typeof item & { str: string; transform: number[] } =>
          'str' in item && 'transform' in item && item.str.trim().length > 0,
      )
      .map((item) => ({ str: item.str, x: item.transform[4], y: item.transform[5] }))

    sheets.push({ name: `Page ${pageNumber}`, rows: buildPageRows(items) })
  }

  return buildXlsx(sheets)
}
