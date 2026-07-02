export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadBytes(bytes: Uint8Array, filename: string, mimeType = 'application/pdf') {
  downloadBlob(new Blob([bytes as unknown as BlobPart], { type: mimeType }), filename)
}
