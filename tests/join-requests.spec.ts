import { test, expect } from "@playwright/test";
import { login, waitForHydration } from "./helpers";

// Join request tests share alex's notification inbox — run serially to avoid
// overwhelming the dev server with concurrent requests.
test.describe.configure({ mode: "serial" });

test.describe("Join Requests and Notifications", () => {
  test("submits a join request to a project", async ({ page }) => {
    // Samira submits a request to join Alex's patchwork project
    await login(page, "samira@example.com", "password");
    await page.goto("/projects/patchwork/join");
    await waitForHydration(page);

    await expect(page.getByRole("heading", { name: /Request to join Patchwork/i })).toBeVisible();

    await page.getByLabel(/Why are you a good fit/i).fill(
      "I am a great fit because I have experience with Rust and CLI tools.",
    );

    await page.getByRole("button", { name: "Send Request" }).click();

    // router.push is async — wait up to 10s for the redirect
    await expect(page).toHaveURL("/projects/patchwork", { timeout: 10000 });
  });

  test("project owner sees join request notification in inbox", async ({ page }) => {
    // Submit a join request as jordan (who can join alex's devboard project)
    await login(page, "jordan@example.com", "password");
    await page.goto("/projects/devboard/join");
    await waitForHydration(page);
    await page.getByLabel(/Why are you a good fit/i).fill(
      "I have WebSocket experience and would love to contribute.",
    );
    await page.getByRole("button", { name: "Send Request" }).click();
    await expect(page).toHaveURL("/projects/devboard", { timeout: 10000 });

    // Login as alex (owner) and check inbox
    await login(page, "alex@example.com", "password");
    await page.goto("/messages");

    // Should see a join request notification for DevBoard
    await expect(page.getByText("Join request", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("DevBoard", { exact: false }).first()).toBeVisible();
  });

  test("project owner can deny a join request", async ({ page }) => {
    // Submit a join request as maria to devboard
    await login(page, "maria@example.com", "password");
    await page.goto("/projects/devboard/join");
    await waitForHydration(page);
    await page.getByLabel(/Why are you a good fit/i).fill(
      "I want to contribute to DevBoard as a mobile developer.",
    );
    await page.getByRole("button", { name: "Send Request" }).click();
    await expect(page).toHaveURL("/projects/devboard", { timeout: 10000 });

    // Login as alex and find the notification from Maria Rivera
    await login(page, "alex@example.com", "password");
    await page.goto("/messages");

    // Click on a join request notification link that mentions Maria Rivera
    const notifLink = page.locator("a").filter({ hasText: /Maria Rivera/ }).first();
    await notifLink.click();

    // Should be on the system message/notification page
    await expect(page).toHaveURL(/\/messages\/system\//);
    await expect(page.getByText(/Maria Rivera/).first()).toBeVisible();

    // Click deny
    await waitForHydration(page);
    await page.getByRole("button", { name: "Deny Request" }).click();

    // Should show "Request denied"
    await expect(page.getByText(/Request denied/i)).toBeVisible({ timeout: 10000 });
  });

  test("applicant sees denied notification after denial", async ({ page }) => {
    // Submit a join request as samira to lingua (owned by jordan)
    await login(page, "samira@example.com", "password");
    await page.goto("/projects/lingua/join");
    await waitForHydration(page);
    await page.getByLabel(/Why are you a good fit/i).fill(
      "I want to help with mobile UI for Lingua.",
    );
    await page.getByRole("button", { name: "Send Request" }).click();
    await expect(page).toHaveURL("/projects/lingua", { timeout: 10000 });

    // Login as jordan and deny the request
    await login(page, "jordan@example.com", "password");
    await page.goto("/messages");

    // Find and click a join request from samira
    const notifLink = page.locator("a").filter({ hasText: /Samira Osei/ }).first();
    await notifLink.click();
    await expect(page).toHaveURL(/\/messages\/system\//);
    await waitForHydration(page);
    await page.getByRole("button", { name: "Deny Request" }).click();
    await expect(page.getByText(/Request denied/i)).toBeVisible({ timeout: 10000 });

    // Login as samira and check for the denial notification
    await login(page, "samira@example.com", "password");
    await page.goto("/messages");

    await expect(page.getByText(/Request denied/i).first()).toBeVisible();
    await expect(page.getByText(/Lingua/i).first()).toBeVisible();
  });

  test("marks notification as read when viewed", async ({ page }) => {
    // Submit a request to trigger a notification
    await login(page, "maria@example.com", "password");
    await page.goto("/projects/patchwork/join");
    await waitForHydration(page);
    await page.getByLabel(/Why are you a good fit/i).fill(
      "I want to help with patchwork.",
    );
    await page.getByRole("button", { name: "Send Request" }).click();
    await expect(page).toHaveURL("/projects/patchwork", { timeout: 10000 });

    // Login as alex and view the notification
    await login(page, "alex@example.com", "password");
    await page.goto("/messages");

    // Click the first join request notification
    const joinRequestLink = page.locator("a").filter({ hasText: /Join request/ }).first();
    await joinRequestLink.click();

    await expect(page).toHaveURL(/\/messages\/system\//);
    // The page should show the join request details
    await expect(page.getByText(/wants to join/i)).toBeVisible();
  });
});
