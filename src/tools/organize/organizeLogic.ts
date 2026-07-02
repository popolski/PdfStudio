import { PDFDocument, degrees } from 'pdf-lib'
import type { PageEntry } from '../../types/pdf'

export async function applyOrganize(sourceBytes: ArrayBuffer, pages: PageEntry[]): Promise<Uint8Array> {
  const sourceDoc = await PDFDocument.load(sourceBytes)
  const outputDoc = await PDFDocument.create()

  for (const entry of pages) {
    const [copiedPage] = await outputDoc.copyPages(sourceDoc, [entry.sourcePageIndex])
    copiedPage.setRotation(degrees((entry.baseRotation + entry.rotation) % 360))
    outputDoc.addPage(copiedPage)
  }

  return outputDoc.save({ useObjectStreams: true })
}
