/**
 * Partiful automation via Playwright.
 * Logs in and adds a contact (by phone) to the configured event.
 * Selectors may need updating if Partiful changes their UI.
 */

import { chromium } from "playwright";

const PARTIFUL_LOGIN_URL = "https://partiful.com/login";

export async function addContactToPartiful(phone: string): Promise<void> {
  const email = process.env.PARTIFUL_EMAIL;
  const password = process.env.PARTIFUL_PASSWORD;
  const eventId = process.env.PARTIFUL_EVENT_ID;

  if (!email || !password || !eventId) {
    throw new Error("Missing Partiful credentials: PARTIFUL_EMAIL, PARTIFUL_PASSWORD, PARTIFUL_EVENT_ID");
  }

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);

    await page.goto(PARTIFUL_LOGIN_URL, { waitUntil: "domcontentloaded" });

    const emailInput = page.locator('input[type="email"], input[name="email"], input[autocomplete="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await emailInput.fill(email);
    await passwordInput.fill(password);

    await page.locator('button[type="submit"], input[type="submit"], [data-testid="login-submit"]').first().click();

    await page.waitForURL((url) => url.origin === "https://partiful.com" && !url.pathname.startsWith("/login"), { timeout: 20000 }).catch(() => {
      throw new Error("Partiful login did not complete (check credentials or SMS step)");
    });

    const eventUrl = `https://partiful.com/e/${eventId}`;
    await page.goto(eventUrl, { waitUntil: "domcontentloaded" });

    const inviteButton = page.getByRole("link", { name: /invite/i }).or(page.getByRole("button", { name: /invite/i })).first();
    await inviteButton.click();

    await new Promise((r) => setTimeout(r, 1500));

    const addContactsButton = page.getByRole("button", { name: /add contacts/i }).or(page.getByText(/add contacts/i)).first();
    await addContactsButton.click();

    await new Promise((r) => setTimeout(r, 1000));

    const phoneInput = page.locator('input[type="tel"], input[name="phone"], input[placeholder*="phone"], input[placeholder*="Phone"]').first();
    await phoneInput.fill(phone);

    await page.getByRole("button", { name: /add|invite/i }).first().click();

    await new Promise((r) => setTimeout(r, 2000));
  } finally {
    await browser.close();
  }
}
