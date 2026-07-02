import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'

export async function extractPages(sourceBytes: ArrayBuffer, pageIndices: number[]): Promise<Uint8Array> {
  const sourceDoc = await PDFDocument.load(sourceBytes)
  const outputDoc = await PDFDocument.create()
  const copiedPages = await outputDoc.copyPages(sourceDoc, pageIndices)
  copiedPages.forEach((page) => outputDoc.addPage(page))
  return outputDoc.save({ useObjectStreams: true })
}

export async function splitToIndividualPages(
  sourceBytes: ArrayBuffer,
  pageIndices: number[],
  baseName: string,
): Promise<Blob> {
  const sourceDoc = await PDFDocument.load(sourceBytes)
  const zip = new JSZip()

  for (const pageIndex of pageIndices) {
    const outputDoc = await PDFDocument.create()
    const [copiedPage] = await outputDoc.copyPages(sourceDoc, [pageIndex])
    outputDoc.addPage(copiedPage)
    const bytes = await outputDoc.save({ useObjectStreams: true })
    zip.file(`${baseName}-page-${pageIndex + 1}.pdf`, bytes)
  }

  return zip.generateAsync({ type: 'blob' })
}
