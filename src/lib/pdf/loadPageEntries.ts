import { loadPdfDocument } from './pdfjs'
import { renderPageThumbnail } from './thumbnail'
import type { LoadedFile, PageEntry } from '../../types/pdf'

export async function loadPageEntries(file: LoadedFile): Promise<PageEntry[]> {
  const pdf = await loadPdfDocument(file.bytes)
  const entries: PageEntry[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const thumbnailUrl = await renderPageThumbnail(pdf, pageNumber)
    entries.push({
      id: `${file.id}-${pageNumber}`,
      sourceFileId: file.id,
      sourceFileName: file.name,
      sourcePageIndex: pageNumber - 1,
      baseRotation: page.rotate,
      rotation: 0,
      selected: false,
      thumbnailUrl,
    })
  }

  return entries
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer()
}
