import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib'

export interface WatermarkOptions {
  text: string
  opacity: number
  rotationDeg: number
  fontSize: number
}

export async function applyTextWatermark(sourceBytes: ArrayBuffer, options: WatermarkOptions): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(sourceBytes)
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize()
    const textWidth = font.widthOfTextAtSize(options.text, options.fontSize)
    page.drawText(options.text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: options.fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: options.opacity,
      rotate: degrees(options.rotationDeg),
    })
  }

  return pdfDoc.save({ useObjectStreams: true })
}

export type PageNumberPosition = 'bottom-left' | 'bottom-center' | 'bottom-right'

export interface PageNumberOptions {
  position: PageNumberPosition
  startAt: number
  fontSize: number
}

export async function applyPageNumbers(sourceBytes: ArrayBuffer, options: PageNumberOptions): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(sourceBytes)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const pages = pdfDoc.getPages()

  pages.forEach((page, index) => {
    const label = `${index + options.startAt} / ${pages.length + options.startAt - 1}`
    const { width } = page.getSize()
    const textWidth = font.widthOfTextAtSize(label, options.fontSize)
    const margin = 24
    let x = width / 2 - textWidth / 2
    if (options.position === 'bottom-left') x = margin
    if (options.position === 'bottom-right') x = width - textWidth - margin

    page.drawText(label, {
      x,
      y: margin,
      size: options.fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    })
  })

  return pdfDoc.save({ useObjectStreams: true })
}
