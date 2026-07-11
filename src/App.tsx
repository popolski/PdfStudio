import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './routes/Home'

const OrganizeTool = lazy(() => import('./tools/organize/OrganizeTool').then((m) => ({ default: m.OrganizeTool })))
const MergeTool = lazy(() => import('./tools/merge/MergeTool').then((m) => ({ default: m.MergeTool })))
const SplitTool = lazy(() => import('./tools/split/SplitTool').then((m) => ({ default: m.SplitTool })))
const ImagesToPdfTool = lazy(() =>
  import('./tools/images-to-pdf/ImagesToPdfTool').then((m) => ({ default: m.ImagesToPdfTool })),
)
const PdfToImagesTool = lazy(() =>
  import('./tools/pdf-to-images/PdfToImagesTool').then((m) => ({ default: m.PdfToImagesTool })),
)
const WatermarkTool = lazy(() => import('./tools/watermark/WatermarkTool').then((m) => ({ default: m.WatermarkTool })))
const PageNumbersTool = lazy(() =>
  import('./tools/page-numbers/PageNumbersTool').then((m) => ({ default: m.PageNumbersTool })),
)
const CompressTool = lazy(() => import('./tools/compress/CompressTool').then((m) => ({ default: m.CompressTool })))
const PdfToHtmlTool = lazy(() => import('./tools/pdf-to-html/PdfToHtmlTool').then((m) => ({ default: m.PdfToHtmlTool })))
const PdfToWordTool = lazy(() => import('./tools/pdf-to-word/PdfToWordTool').then((m) => ({ default: m.PdfToWordTool })))
const PdfToExcelTool = lazy(() =>
  import('./tools/pdf-to-excel/PdfToExcelTool').then((m) => ({ default: m.PdfToExcelTool })),
)
const ImageToTextTool = lazy(() =>
  import('./tools/image-to-text/ImageToTextTool').then((m) => ({ default: m.ImageToTextTool })),
)

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<div className="p-10 text-center text-gray-400">Chargement…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/organiser" element={<OrganizeTool />} />
            <Route path="/fusion" element={<MergeTool />} />
            <Route path="/split" element={<SplitTool />} />
            <Route path="/images-vers-pdf" element={<ImagesToPdfTool />} />
            <Route path="/pdf-vers-images" element={<PdfToImagesTool />} />
            <Route path="/filigrane" element={<WatermarkTool />} />
            <Route path="/numeros-de-page" element={<PageNumbersTool />} />
            <Route path="/compresser" element={<CompressTool />} />
            <Route path="/pdf-vers-html" element={<PdfToHtmlTool />} />
            <Route path="/pdf-vers-word" element={<PdfToWordTool />} />
            <Route path="/pdf-vers-excel" element={<PdfToExcelTool />} />
            <Route path="/image-vers-texte" element={<ImageToTextTool />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  )
}

export default App
