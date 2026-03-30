// @ts-check
import { test, expect } from "@playwright/test";

const E2E_EMAIL = process.env.E2E_USER_EMAIL;
const E2E_PASSWORD = process.env.E2E_USER_PASSWORD;
const hasCredentials = Boolean(E2E_EMAIL && E2E_PASSWORD);

/**
 * Helper: perform login before each test.
 * If no credentials are available, skip the entire suite.
 */
async function loginIfNeeded(page, testInfo) {
  if (!hasCredentials) {
    testInfo.skip();
    return;
  }

  await page.goto("/login");
  await page.locator('input[type="email"]').fill(E2E_EMAIL);
  await page.locator('input[type="password"]').fill(E2E_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
}

test.describe("pages render", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await loginIfNeeded(page, testInfo);
  });

  test("HomePage renders with KPI section", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Verify heading or KPI grid is visible
    await expect(
      page.locator("h1, h2, [data-testid='kpi-grid']").first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("ClientesPage renders with page title", async ({ page }) => {
    await page.goto("/clientes");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText("Clientes", { exact: false }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("RelatoriosPage renders with page title", async ({ page }) => {
    await page.goto("/relatorios");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText("Relatorios", { exact: false }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("ConfiguracoesPage renders with page title", async ({ page }) => {
    await page.goto("/configuracoes");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText("Configuracoes", { exact: false }).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
