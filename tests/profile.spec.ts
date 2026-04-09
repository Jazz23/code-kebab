import { test, expect } from "@playwright/test";
import { login, waitForHydration } from "./helpers";

test.describe("Profile", () => {
  test("views a public profile", async ({ page }) => {
    await page.goto("/profile/samira");
    await expect(page.getByRole("heading", { name: "Samira Osei" })).toBeVisible();
    await expect(page.getByText("@samira")).toBeVisible();
    // Bio
    await expect(page.getByText("UI/UX designer", { exact: false })).toBeVisible();
    // Skills
    await expect(page.getByText("Figma")).toBeVisible();
  });

  test("shows edit form on own profile", async ({ page }) => {
    await login(page);
    await page.goto("/profile/alexchen");
    await waitForHydration(page);
    await expect(page.getByRole("button", { name: "Edit profile" })).toBeVisible();
  });

  test("edits profile name and bio", async ({ page }) => {
    await login(page);
    await page.goto("/profile/alexchen");
    await waitForHydration(page);

    await page.getByRole("button", { name: "Edit profile" }).click();
    await expect(page.getByText("Edit profile")).toBeVisible();

    // Update name
    const nameInput = page.getByPlaceholder("Your name");
    await nameInput.clear();
    await nameInput.fill("Alex Chen");

    // Update bio
    const bioInput = page.getByPlaceholder("Tell people a bit about yourself…");
    await bioInput.clear();
    await bioInput.fill("Full-stack developer passionate about open source and developer tools.");

    // Wait for auto-save (1200ms debounce)
    await expect(page.getByText("✓ Saved")).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: "Done" }).click();

    // Should show the updated values in read mode
    await expect(page.getByRole("heading", { name: "Alex Chen" })).toBeVisible();
  });

  test("toggles email notifications", async ({ page }) => {
    await login(page);
    await page.goto("/profile/alexchen");
    await waitForHydration(page);

    await page.getByRole("button", { name: "Edit profile" }).click();

    // Toggle email notifications switch (role="switch" button)
    const emailSwitch = page.getByRole("switch");
    await emailSwitch.waitFor({ state: "visible" });
    const initialChecked = (await emailSwitch.getAttribute("aria-checked")) === "true";
    await emailSwitch.click();
    await expect(page.getByText("✓ Saved")).toBeVisible({ timeout: 5000 });
    // Wait for the save indicator to go idle before the second toggle
    await expect(page.getByText("✓ Saved")).toBeHidden({ timeout: 5000 });

    // Restore original state
    await emailSwitch.click();
    await expect(page.getByText("✓ Saved")).toBeVisible({ timeout: 5000 });

    const finalChecked = (await emailSwitch.getAttribute("aria-checked")) === "true";
    expect(finalChecked).toBe(initialChecked);
  });

  test("shows message button on other user's profile when logged in", async ({ page }) => {
    await login(page);
    await page.goto("/profile/samira");
    await expect(page.getByRole("link", { name: "Message" })).toBeVisible();
  });
});
