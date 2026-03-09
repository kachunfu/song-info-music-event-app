import { describe, it, expect } from 'vitest'

/**
 * Tests the getPageNumbers pagination utility from SearchPage.
 * This function is currently inline in Search.tsx — if extracted,
 * update the import path.
 */
function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')

  pages.push(total)
  return pages
}

describe('getPageNumbers', () => {
  it('returns all pages when total <= 7', () => {
    expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(getPageNumbers(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('shows ellipsis at end when on first page with many pages', () => {
    const result = getPageNumbers(1, 20)
    expect(result[0]).toBe(1)
    expect(result).toContain('...')
    expect(result[result.length - 1]).toBe(20)
  })

  it('shows ellipsis at start when on last page', () => {
    const result = getPageNumbers(20, 20)
    expect(result[0]).toBe(1)
    expect(result).toContain('...')
    expect(result[result.length - 1]).toBe(20)
  })

  it('shows ellipsis on both sides when in the middle', () => {
    const result = getPageNumbers(10, 20)
    expect(result[0]).toBe(1)
    expect(result[result.length - 1]).toBe(20)
    // Should have ellipsis before and after the middle pages
    const ellipsisCount = result.filter((p) => p === '...').length
    expect(ellipsisCount).toBe(2)
  })

  it('includes current page and neighbors', () => {
    const result = getPageNumbers(10, 20)
    expect(result).toContain(9)
    expect(result).toContain(10)
    expect(result).toContain(11)
  })

  it('returns [1] for single page', () => {
    expect(getPageNumbers(1, 1)).toEqual([1])
  })

  it('returns empty for zero pages', () => {
    expect(getPageNumbers(1, 0)).toEqual([])
  })
})
