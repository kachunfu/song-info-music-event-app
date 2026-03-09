import { test, expect } from '@playwright/test'

test.describe('Search Flow', () => {
  test('should display search page with input', async ({ page }) => {
    await page.goto('/search')
    await expect(page.getByPlaceholder(/search/i)).toBeVisible()
  })

  test('should show results after searching', async ({ page }) => {
    await page.goto('/search')

    await page.getByPlaceholder(/search/i).fill('Queen')
    await page.getByPlaceholder(/search/i).press('Enter')

    // Wait for results to appear
    await expect(page.locator('[data-testid="song-card"], .song-card, a[href*="/songs/"]').first())
      .toBeVisible({ timeout: 10000 })
  })

  test('should show no results message for gibberish query', async ({ page }) => {
    await page.goto('/search')

    await page.getByPlaceholder(/search/i).fill('xyzxyzxyznosongshere12345')
    await page.getByPlaceholder(/search/i).press('Enter')

    await expect(page.getByText(/no results/i)).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to song detail page', async ({ page }) => {
    await page.goto('/search')

    await page.getByPlaceholder(/search/i).fill('Bohemian Rhapsody')
    await page.getByPlaceholder(/search/i).press('Enter')

    // Click first result
    const firstResult = page.locator('[data-testid="song-card"], .song-card, a[href*="/songs/"]').first()
    await firstResult.waitFor({ timeout: 10000 })
    await firstResult.click()

    await expect(page).toHaveURL(/\/songs\//, { timeout: 5000 })
  })
})
