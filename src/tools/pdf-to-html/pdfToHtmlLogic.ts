import { Util } from 'pdfjs-dist'
import { loadPdfDocument } from '../../lib/pdf/pdfjs'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function convertPdfToHtml(sourceBytes: ArrayBuffer, fileName: string): Promise<string> {
  const pdf = await loadPdfDocument(sourceBytes)
  const pagesHtml: string[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1 })
    const textContent = await page.getTextContent()

    const spans: string[] = []
    for (const item of textContent.items) {
      if (!('str' in item) || !item.str.trim()) continue
      const tx = Util.transform(viewport.transform, item.transform)
      const fontHeight = Math.hypot(tx[2], tx[3])
      const angle = Math.atan2(tx[1], tx[0])
      const left = tx[4]
      const top = tx[5] - fontHeight
      const style = [
        `left:${left.toFixed(2)}px`,
        `top:${top.toFixed(2)}px`,
        `font-size:${fontHeight.toFixed(2)}px`,
        angle !== 0 ? `transform:rotate(${(angle * (180 / Math.PI)).toFixed(2)}deg)` : '',
      ]
        .filter(Boolean)
        .join(';')
      spans.push(`<span style="${style}">${escapeHtml(item.str)}</span>`)
    }

    pagesHtml.push(
      `<div class="page" style="width:${viewport.width}px;height:${viewport.height}px">${spans.join('')}</div>`,
    )
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(fileName)}</title>
<style>
  body { background: #e5e7eb; margin: 0; padding: 24px; font-family: Arial, Helvetica, sans-serif; }
  .page {
    position: relative;
    background: #fff;
    margin: 0 auto 24px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    overflow: hidden;
  }
  .page span {
    position: absolute;
    white-space: pre;
    line-height: 1;
    transform-origin: 0 0;
    color: #111;
  }
</style>
</head>
<body>
${pagesHtml.join('\n')}
</body>
</html>`
}
