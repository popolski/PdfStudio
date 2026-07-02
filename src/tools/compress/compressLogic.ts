import { PDFDocument } from 'pdf-lib'

export async function compressPdf(sourceBytes: ArrayBuffer): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(sourceBytes)
  return pdfDoc.save({ useObjectStreams: true })
}
