// @ts-check
import { test, expect } from "@playwright/test";

const E2E_EMAIL = process.env.E2E_USER_EMAIL;
const E2E_PASSWORD = process.env.E2E_USER_PASSWORD;
const hasCredentials = Boolean(E2E_EMAIL && E2E_PASSWORD);

test.describe("authentication", () => {
  test("redirects unauthenticated user to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("login form shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[type="email"]').fill("invalid@test.com");
    await page.locator('input[type="password"]').fill("wrongpassword");
    await page.locator('button[type="submit"]').click();

    // Wait for error message to appear
    await expect(
      page.getByText("Email ou senha incorretos")
    ).toBeVisible({ timeout: 10000 });
  });

  test("login with valid credentials", async ({ page }) => {
    test.skip(!hasCredentials, "E2E_USER_EMAIL and E2E_USER_PASSWORD not set");

    await page.goto("/login");
    await page.locator('input[type="email"]').fill(E2E_EMAIL);
    await page.locator('input[type="password"]').fill(E2E_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Wait for redirect to dashboard
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Verify dashboard content is visible (page title or KPI section)
    await expect(
      page.locator("h1, h2, [data-testid='kpi-grid']").first()
    ).toBeVisible({ timeout: 10000 });
  });
});
