import { test, expect } from "@playwright/test";
import { login, waitForHydration } from "./helpers";

test.describe("Login", () => {
  test("logs in with valid credentials", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL("/");
  });

  test("shows error with invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await waitForHydration(page);

    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Use local seed account" }).click();

    await expect(page.getByText("Invalid email or password.")).toBeVisible({ timeout: 10000 });
  });
});
