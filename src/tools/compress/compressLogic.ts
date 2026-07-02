import { PDFDocument } from 'pdf-lib'
import { loadPdfDocument } from '../../lib/pdf/pdfjs'

export async function compressPdfLight(sourceBytes: ArrayBuffer): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(sourceBytes)
  return pdfDoc.save({ useObjectStreams: true })
}

export interface CompressionEstimate {
  originalSize: number
  estimatedSize: number
  savingsPercent: number
}

const RENDER_SCALE = 1.5

async function renderPageAsJpeg(
  pdf: Awaited<ReturnType<typeof loadPdfDocument>>,
  pageNumber: number,
  quality: number,
) {
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale: RENDER_SCALE })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Impossible de créer le contexte canvas')
  await page.render({ canvas, canvasContext: context, viewport }).promise

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Échec de conversion en image'))), 'image/jpeg', quality)
  })
  const bytes = new Uint8Array(await blob.arrayBuffer())

  const unscaledViewport = page.getViewport({ scale: 1 })
  return { bytes, width: unscaledViewport.width, height: unscaledViewport.height }
}

/** Estime le gain en ne traitant qu'un échantillon de pages, pour un retour rapide avant de lancer le traitement complet. */
export async function estimateAggressiveCompression(
  sourceBytes: ArrayBuffer,
  quality: number,
): Promise<CompressionEstimate> {
  const pdf = await loadPdfDocument(sourceBytes)
  const sampleCount = Math.min(3, pdf.numPages)
  let sampleBytes = 0

  for (let pageNumber = 1; pageNumber <= sampleCount; pageNumber++) {
    const { bytes } = await renderPageAsJpeg(pdf, pageNumber, quality)
    sampleBytes += bytes.length
  }

  const avgPerPage = sampleBytes / sampleCount
  const originalSize = sourceBytes.byteLength
  const estimatedSize = Math.round(avgPerPage * pdf.numPages * 1.02)
  const savingsPercent = Math.round((1 - estimatedSize / originalSize) * 100)

  return { originalSize, estimatedSize, savingsPercent }
}

/** Transforme chaque page en image JPEG (à la qualité choisie) puis reconstruit un PDF. Réduit fortement la taille mais rend le texte non sélectionnable. */
export async function compressPdfAggressive(sourceBytes: ArrayBuffer, quality: number): Promise<Uint8Array> {
  const pdf = await loadPdfDocument(sourceBytes)
  const outputDoc = await PDFDocument.create()

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const { bytes, width, height } = await renderPageAsJpeg(pdf, pageNumber, quality)
    const image = await outputDoc.embedJpg(bytes)
    const page = outputDoc.addPage([width, height])
    page.drawImage(image, { x: 0, y: 0, width, height })
  }

  return outputDoc.save({ useObjectStreams: true })
}
