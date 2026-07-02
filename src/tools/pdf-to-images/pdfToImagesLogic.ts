import JSZip from 'jszip'
import { loadPdfDocument } from '../../lib/pdf/pdfjs'

async function renderPageToBlob(pdf: Awaited<ReturnType<typeof loadPdfDocument>>, pageNumber: number, scale: number) {
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Impossible de créer le contexte canvas')
  await page.render({ canvas, canvasContext: context, viewport }).promise

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Échec de conversion en image'))), 'image/png')
  })
}

export async function exportPagesAsImages(
  sourceBytes: ArrayBuffer,
  pageNumbers: number[],
  baseName: string,
  scale = 2,
): Promise<Blob> {
  const pdf = await loadPdfDocument(sourceBytes)
  const zip = new JSZip()

  for (const pageNumber of pageNumbers) {
    const blob = await renderPageToBlob(pdf, pageNumber, scale)
    zip.file(`${baseName}-page-${pageNumber}.png`, blob)
  }

  return zip.generateAsync({ type: 'blob' })
}
