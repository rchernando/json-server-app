import { test, expect, request as playwrightRequest } from '@playwright/test';

const API = 'http://localhost:3000';

test('login + create post critical flow', async ({ page }) => {
  let createdPostId: number | null = null;

  try {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);

    await page.locator('input#login-name').fill('alice');
    await page.locator('input#login-password').fill('alice123');
    await page.getByRole('button', { name: /acceder|login/i }).click();

    await expect(page).toHaveURL('http://localhost:4200/');
    await expect(page.locator('h2')).toBeVisible();

    await page.getByRole('link', { name: /crear post|create post/i }).click();
    await expect(page).toHaveURL(/\/posts\/new$/);

    const title = `E2E post ${Date.now()}`;
    await page.locator('input#post-title').fill(title);
    await page.locator('textarea#post-content').fill('Body created by Playwright');
    await page.getByRole('button', { name: /publicar|publish/i }).click();

    await expect(page).toHaveURL(/\/posts\/\d+$/);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();

    const url = page.url();
    const match = url.match(/\/posts\/(\d+)$/);
    if (match) createdPostId = Number(match[1]);
  } finally {

    if (createdPostId !== null) {
      const ctx = await playwrightRequest.newContext();
      await ctx.delete(`${API}/posts/${createdPostId}`).catch(() => {});
      const joins = await ctx
        .get(`${API}/postTags?postId=${createdPostId}`)
        .then((r) => r.json())
        .catch(() => [] as { id: number }[]);
      for (const j of joins) {
        await ctx.delete(`${API}/postTags/${j.id}`).catch(() => {});
      }
      await ctx.dispose();
    }
  }
});
