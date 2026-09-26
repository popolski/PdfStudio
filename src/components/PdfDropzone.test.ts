import { describe, expect, it } from 'vitest'
import { acceptsFile } from './acceptsFile'

describe('acceptsFile', () => {
  it('refuse un fichier hors format et accepte un MIME connu ou une extension sans MIME', () => {
    expect(acceptsFile({ name: 'notes.txt', type: 'text/plain' }, 'application/pdf')).toBe(false)
    expect(acceptsFile({ name: 'notes.pdf', type: 'text/plain' }, 'application/pdf')).toBe(false)
    expect(acceptsFile({ name: 'document.pdf', type: 'application/pdf' }, 'application/pdf')).toBe(true)
    expect(acceptsFile({ name: 'scan.PDF', type: '' }, 'application/pdf')).toBe(true)
    expect(acceptsFile({ name: 'photo.jpeg', type: '' }, 'image/jpeg,image/png')).toBe(true)
    expect(acceptsFile({ name: 'photo.webp', type: 'image/webp' }, 'image/jpeg,image/png')).toBe(false)
  })
})
