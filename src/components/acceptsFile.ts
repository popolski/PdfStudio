const extensions: Record<string, RegExp> = {
  'application/pdf': /\.pdf$/i,
  'image/jpeg': /\.jpe?g$/i,
  'image/png': /\.png$/i,
  'image/webp': /\.webp$/i,
  'image/bmp': /\.bmp$/i,
}

export function acceptsFile(file: Pick<File, 'name' | 'type'>, accept: string): boolean {
  return accept.split(',').some((type) =>
    file.type && file.type !== 'application/octet-stream' ? file.type === type : extensions[type]?.test(file.name),
  )
}
