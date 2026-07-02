export interface PageEntry {
  id: string
  sourceFileId: string
  sourceFileName: string
  sourcePageIndex: number
  /** Rotation (degrees) already baked into the source page — used to compute the final absolute rotation. */
  baseRotation: number
  /** Additional rotation (degrees) applied by the user via the UI, on top of baseRotation. */
  rotation: number
  selected: boolean
  thumbnailUrl: string
}

export interface LoadedFile {
  id: string
  name: string
  bytes: ArrayBuffer
}
