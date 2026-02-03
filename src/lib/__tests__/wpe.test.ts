import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('fetchCsvFromEndpoint', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('falls back to fetch when package is not used', async () => {
    const mockText = 'a,b\n1,2'
    // @ts-ignore
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve(mockText) } as any))

    const { fetchCsvFromEndpoint } = await import('@/lib/wpe')
    const res = await fetchCsvFromEndpoint('http://example.com/export', { token: undefined })
    expect(res).toBe(mockText)
    expect(global.fetch).toHaveBeenCalled()
  })

  it('uses package exportToCSV when usePackage true and params provided', async () => {
    // ensure fetch is not used as a fallback
    // @ts-ignore
    global.fetch = vi.fn(() => Promise.reject(new Error('fetch should not be called when package is used')))

    // mock the package before importing the wrapper
    vi.mock('wp-content-exporter', () => ({
      exportToCSV: vi.fn(() => Promise.resolve('x,y\n1,2')),
    }))

    const { fetchCsvFromEndpoint } = await import('@/lib/wpe')
    const res = await fetchCsvFromEndpoint('http://example.com', { usePackage: true, postType: 'posts', fields: ['title'] })
    expect(res).toBe('x,y\n1,2')
  })
})
