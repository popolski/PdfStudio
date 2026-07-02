import type { PDFDocumentProxy } from 'pdfjs-dist'

export async function renderPageThumbnail(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  scale = 0.3,
): Promise<string> {
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Impossible de créer le contexte canvas')

  await page.render({ canvas, canvasContext: context, viewport }).promise
  return canvas.toDataURL('image/png')
}
