import type { Page } from "@playwright/test";

/**
 * Wait for React to hydrate the page. Without this, filling controlled inputs
 * or clicking buttons won't trigger React event handlers — either the form
 * submits natively (GET), or state never updates and the button stays disabled.
 *
 * Checks for a React fiber key on any form element, falling back to the body.
 */
export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    // Check the form first (most interactive pages have one); fall back to body.
    const targets = [
      document.querySelector("form"),
      document.querySelector("button"),
      document.querySelector("input"),
      document.body,
    ];
    for (const el of targets) {
      if (!el) continue;
      if (
        Object.keys(el).some(
          (k) => k.startsWith("__reactFiber") || k.startsWith("__reactProps"),
        )
      ) {
        return true;
      }
    }
    return false;
  });
}

export async function login(
  page: Page,
  email = "alex@example.com",
  password = "password",
) {
  await page.goto("/login");
  // Wait for React to hydrate the form before interacting.
  // Without this, the form submits as a native GET (no method attr) before
  // React attaches the onSubmit handler, sending credentials in the URL.
  await waitForHydration(page);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Use local seed account" }).click();
  await page.waitForURL("/");
}
