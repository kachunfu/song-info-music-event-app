import { describe, it, expect, vi, beforeEach } from 'vitest'

// We test the chunkLines logic and the translateText orchestration
// by mocking the global fetch

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Import after stubbing fetch
const { translateText } = await import('../index.js')

function mockTranslationResponse(translatedText: string) {
  return {
    ok: true,
    json: () => Promise.resolve({
      responseStatus: 200,
      responseData: { translatedText },
    }),
  }
}

describe('Translation Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('translates short text in a single request', async () => {
    mockFetch.mockResolvedValue(mockTranslationResponse('你好世界'))

    const result = await translateText('Hello world', 'zh-TW')

    expect(result.translatedText).toBe('你好世界')
    expect(mockFetch).toHaveBeenCalledTimes(1)
    const url = new URL(mockFetch.mock.calls[0][0])
    expect(url.searchParams.get('langpair')).toBe('en|zh-TW')
    expect(url.searchParams.get('q')).toBe('Hello world')
  })

  it('uses custom source language when provided', async () => {
    mockFetch.mockResolvedValue(mockTranslationResponse('Hello world'))

    await translateText('Hola mundo', 'en', 'es')

    const url = new URL(mockFetch.mock.calls[0][0])
    expect(url.searchParams.get('langpair')).toBe('es|en')
  })

  it('batches long text into multiple requests', async () => {
    // Create text that exceeds 400 chars to trigger batching
    const longLine = 'A'.repeat(250)
    const text = `${longLine}\n${longLine}`

    mockFetch
      .mockResolvedValueOnce(mockTranslationResponse('Batch1'))
      .mockResolvedValueOnce(mockTranslationResponse('Batch2'))

    const result = await translateText(text, 'zh-TW')

    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(result.translatedText).toBe('Batch1\nBatch2')
  })

  it('handles single-line text', async () => {
    mockFetch.mockResolvedValue(mockTranslationResponse('翻譯'))

    const result = await translateText('Translate', 'zh-TW')

    expect(result.translatedText).toBe('翻譯')
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('throws on non-OK HTTP response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })

    await expect(translateText('test', 'zh-TW')).rejects.toThrow('Translation failed: 500')
  })

  it('throws on non-200 responseStatus', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        responseStatus: 403,
        responseData: { translatedText: '' },
      }),
    })

    await expect(translateText('test', 'zh-TW')).rejects.toThrow('Translation error: status 403')
  })

  it('handles empty text', async () => {
    mockFetch.mockResolvedValue(mockTranslationResponse(''))

    const result = await translateText('', 'zh-TW')

    expect(result.translatedText).toBe('')
  })
})
