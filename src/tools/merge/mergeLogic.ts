import { PDFDocument, degrees } from 'pdf-lib'
import type { PageEntry } from '../../types/pdf'

export async function applyMerge(
  sources: Map<string, ArrayBuffer>,
  pages: PageEntry[],
): Promise<Uint8Array> {
  const sourceDocs = new Map<string, PDFDocument>()
  for (const [fileId, bytes] of sources) {
    sourceDocs.set(fileId, await PDFDocument.load(bytes))
  }

  const outputDoc = await PDFDocument.create()

  for (const entry of pages) {
    const sourceDoc = sourceDocs.get(entry.sourceFileId)
    if (!sourceDoc) continue
    const [copiedPage] = await outputDoc.copyPages(sourceDoc, [entry.sourcePageIndex])
    copiedPage.setRotation(degrees((entry.baseRotation + entry.rotation) % 360))
    outputDoc.addPage(copiedPage)
  }

  return outputDoc.save({ useObjectStreams: true })
}
