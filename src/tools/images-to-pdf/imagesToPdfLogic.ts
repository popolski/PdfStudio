import { PDFDocument } from 'pdf-lib'

export interface OrderedImage {
  bytes: ArrayBuffer
  mimeType: string
}

export async function buildPdfFromImages(images: OrderedImage[]): Promise<Uint8Array> {
  const outputDoc = await PDFDocument.create()

  for (const { bytes, mimeType } of images) {
    const image = mimeType === 'image/png' ? await outputDoc.embedPng(bytes) : await outputDoc.embedJpg(bytes)
    const page = outputDoc.addPage([image.width, image.height])
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
  }

  return outputDoc.save({ useObjectStreams: true })
}
