import { test, expect } from "@playwright/test";
import { login, waitForHydration } from "./helpers";

test.describe("Projects", () => {
  test("lists projects publicly", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: "Projects", level: 1 })).toBeVisible();
    // Seed data includes DevBoard — use first() to avoid strict mode when duplicates exist
    await expect(page.getByText("DevBoard").first()).toBeVisible();
  });

  test("shows project detail page", async ({ page }) => {
    await page.goto("/projects/devboard");
    await expect(page.getByRole("heading", { name: "DevBoard" })).toBeVisible();
    // Owner name appears in the sidebar link — use first() in case of duplicates
    await expect(page.getByText("Alex Chen").first()).toBeVisible();
  });

  test("creates a project", async ({ page }) => {
    await login(page);
    await page.goto("/projects/new");
    await waitForHydration(page);

    const title = `Test Project ${Date.now()}`;
    await page.getByPlaceholder("My Awesome Project").fill(title);
    await page.getByPlaceholder("What are you building? Who is it for?").fill(
      "A test project created by Playwright tests.",
    );

    await page.getByRole("button", { name: "Create project" }).click();

    // Wait for redirect to the new project page (not /projects/new)
    await page.waitForURL((url) => url.pathname.startsWith("/projects/") && url.pathname !== "/projects/new");
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  });

  test("creates a project with named roles", async ({ page }) => {
    await login(page);
    await page.goto("/projects/new");
    await waitForHydration(page);

    const title = `Roles Project ${Date.now()}`;
    await page.getByPlaceholder("My Awesome Project").fill(title);
    await page.getByPlaceholder("What are you building? Who is it for?").fill(
      "A project with named roles.",
    );

    // Select named roles mode using check() which is more reliable for radio inputs
    await page.getByRole("radio", { name: "Named roles" }).check();

    // Wait for the role input to become visible after React re-renders
    const roleInput = page.getByPlaceholder("Role name (e.g. Frontend Engineer)").first();
    await roleInput.waitFor({ state: "visible" });
    await roleInput.fill("Frontend Engineer");

    await page.getByRole("button", { name: "Create project" }).click();

    // Wait for redirect away from /projects/new
    await page.waitForURL((url) => url.pathname.startsWith("/projects/") && url.pathname !== "/projects/new");
    await expect(page.getByText("Frontend Engineer")).toBeVisible();
  });

  test("edits a project", async ({ page }) => {
    await login(page);
    await page.goto("/projects/devboard/edit");
    await waitForHydration(page);

    // Change the description
    const descBox = page.getByPlaceholder("What are you building? Who is it for?");
    await descBox.clear();
    const newDesc = `Updated by Playwright at ${Date.now()}`;
    await descBox.fill(newDesc);

    // Wait for auto-save
    await expect(page.getByText("✓ Saved")).toBeVisible({ timeout: 5000 });
  });

  test("deletes a project", async ({ page }) => {
    await login(page);
    // Create a project to delete
    await page.goto("/projects/new");
    await waitForHydration(page);

    const title = `Delete Me ${Date.now()}`;
    await page.getByPlaceholder("My Awesome Project").fill(title);
    await page.getByPlaceholder("What are you building? Who is it for?").fill("This project will be deleted.");
    await page.getByRole("button", { name: "Create project" }).click();

    // Wait for redirect to the created project page
    await page.waitForURL((url) => url.pathname.startsWith("/projects/") && url.pathname !== "/projects/new");
    const projectUrl = page.url();
    // Extract the slug: /projects/<slug>
    const slug = new URL(projectUrl).pathname.split("/projects/")[1];

    // Navigate to edit page
    await page.goto(`/projects/${slug}/edit`);
    await waitForHydration(page);

    // Confirm we're on the edit page
    await expect(page.getByRole("heading", { name: "Edit project" })).toBeVisible();

    // Delete the project
    await page.getByRole("button", { name: "Delete project" }).click();
    // Confirm deletion in the modal
    await page.getByRole("button", { name: "Yes, delete" }).click();

    // Should redirect to profile
    await expect(page).toHaveURL(/\/profile\//);
  });
});
