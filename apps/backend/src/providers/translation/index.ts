/**
 * Translation provider using MyMemory API.
 * Free, no API key required. Supports standard language codes.
 * Limit: 5000 chars/day anonymous, 50000 with email param.
 */

export interface TranslationResult {
  translatedText: string
  detectedSourceLang?: string
}

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang = 'auto',
): Promise<TranslationResult> {
  // MyMemory has a ~500 char limit per request, so we split by lines and batch
  const lines = text.split('\n')
  const batches = chunkLines(lines, 400)

  const translatedBatches = await Promise.all(
    batches.map((batch) => translateBatch(batch, targetLang, sourceLang)),
  )

  return {
    translatedText: translatedBatches.map((b) => b.translatedText).join('\n'),
    detectedSourceLang: translatedBatches[0]?.detectedSourceLang,
  }
}

async function translateBatch(
  text: string,
  targetLang: string,
  sourceLang: string,
): Promise<TranslationResult> {
  const langPair = sourceLang === 'auto' ? `en|${targetLang}` : `${sourceLang}|${targetLang}`
  const url = new URL('https://api.mymemory.translated.net/get')
  url.searchParams.set('q', text)
  url.searchParams.set('langpair', langPair)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Translation failed: ${res.status}`)

  const data = await res.json() as {
    responseStatus: number
    responseData: { translatedText: string }
    matches?: Array<{ segment: string; translation: string }>
  }

  if (data.responseStatus !== 200) {
    throw new Error(`Translation error: status ${data.responseStatus}`)
  }

  return {
    translatedText: data.responseData.translatedText,
  }
}

function chunkLines(lines: string[], maxChars: number): string[] {
  const batches: string[] = []
  let current = ''

  for (const line of lines) {
    if (current.length + line.length + 1 > maxChars && current.length > 0) {
      batches.push(current)
      current = line
    } else {
      current = current ? `${current}\n${line}` : line
    }
  }

  if (current) batches.push(current)
  return batches
}
