import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = pdfjsWorker

export function loadPdfDocument(bytes: ArrayBuffer): Promise<PDFDocumentProxy> {
  return getDocument({ data: bytes.slice(0) }).promise
}
