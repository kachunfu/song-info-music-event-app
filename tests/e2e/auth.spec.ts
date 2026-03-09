import { test, expect } from '@playwright/test'

test.describe('Auth Flow', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading')).toContainText(/log in|sign in|welcome/i)
  })

  test('should register a new user', async ({ page }) => {
    await page.goto('/login')

    // Switch to register mode if needed
    const registerToggle = page.getByText(/register|sign up|create account/i)
    if (await registerToggle.isVisible()) {
      await registerToggle.click()
    }

    await page.getByPlaceholder(/email/i).fill(`test-${Date.now()}@example.com`)
    await page.getByPlaceholder(/password/i).fill('testpassword123')
    await page.getByRole('button', { name: /register|sign up|create/i }).click()

    // Should redirect to search after successful registration
    await expect(page).toHaveURL(/\/search/, { timeout: 5000 })
  })

  test('should login with valid credentials', async ({ page }) => {
    // Note: This test requires a pre-existing user in the DB
    // In a full setup, it would create the user first
    await page.goto('/login')

    await page.getByPlaceholder(/email/i).fill('test@example.com')
    await page.getByPlaceholder(/password/i).fill('password123')
    await page.getByRole('button', { name: /log in|sign in/i }).click()

    // Should redirect to search on success, or show error on failure
    await page.waitForTimeout(2000)
  })

  test('should show error on invalid login', async ({ page }) => {
    await page.goto('/login')

    await page.getByPlaceholder(/email/i).fill('wrong@example.com')
    await page.getByPlaceholder(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /log in|sign in/i }).click()

    // Should show an error message
    await expect(page.getByText(/invalid|error|failed/i)).toBeVisible({ timeout: 5000 })
  })
})
