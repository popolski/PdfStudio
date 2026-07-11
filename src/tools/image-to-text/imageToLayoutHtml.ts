import type { OcrResult } from './imageToTextLogic'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Reconstruit la mise en page en positionnant chaque mot à ses coordonnées exactes plutôt qu'en devinant une structure (paragraphe, tableau...). Fonctionne aussi bien sur de la prose que sur des mises en page en colonnes. */
export function buildOcrLayoutHtml(result: OcrResult, title: string): string {
  const spans = result.words
    .map((word) => {
      const fontSize = Math.max(1, word.y1 - word.y0)
      const style = [`left:${word.x0}px`, `top:${word.y0}px`, `font-size:${fontSize}px`].join(';')
      return `<span style="${style}">${escapeHtml(word.text)}</span>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title)}</title>
<style>
  body { background: #e5e7eb; margin: 0; padding: 24px; font-family: Arial, Helvetica, sans-serif; }
  .page {
    position: relative;
    background: #fff;
    margin: 0 auto;
    width: ${result.imageWidth}px;
    height: ${result.imageHeight}px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    overflow: hidden;
  }
  .page span {
    position: absolute;
    white-space: pre;
    line-height: 1;
    color: #111;
  }
</style>
</head>
<body>
<div class="page">${spans}</div>
</body>
</html>`
}
