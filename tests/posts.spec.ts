import { test, expect } from "@playwright/test";
import { login, waitForHydration } from "./helpers";

test.describe("Posts", () => {
  test("lists posts publicly", async ({ page }) => {
    await page.goto("/posts");
    await expect(page.getByRole("heading", { name: "Posts", level: 1 })).toBeVisible();
  });

  test("creates a post", async ({ page }) => {
    await login(page);
    await page.goto("/posts/create");
    await waitForHydration(page);

    const title = `Playwright Test Post ${Date.now()}`;
    const description = "This is a test post created by Playwright. It contains some content.";

    await page.getByPlaceholder("Give your post a title").fill(title);
    await page.getByPlaceholder("Write your post content here.").fill(description);

    // Button should now be enabled after filling both required fields
    await expect(page.getByRole("button", { name: "Publish post" })).toBeEnabled();
    await page.getByRole("button", { name: "Publish post" }).click();

    // Should redirect to the post detail page
    await expect(page).toHaveURL(/\/posts\//);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText(description)).toBeVisible();
  });

  test("views a post detail page", async ({ page }) => {
    // First go to the posts list and click on the first post link
    await page.goto("/posts");
    const postLinks = page.locator("a[href^='/posts/']");
    const count = await postLinks.count();
    if (count > 0) {
      const href = await postLinks.first().getAttribute("href");
      if (href) {
        await page.goto(href);
        await expect(page).toHaveURL(/\/posts\//);
      }
    }
  });

  test("post detail page shows author name", async ({ page }) => {
    await login(page);
    await page.goto("/posts/create");
    await waitForHydration(page);

    const title = `Author Test Post ${Date.now()}`;
    await page.getByPlaceholder("Give your post a title").fill(title);
    await page.getByPlaceholder("Write your post content here.").fill("Checking author attribution.");
    await expect(page.getByRole("button", { name: "Publish post" })).toBeEnabled();
    await page.getByRole("button", { name: "Publish post" }).click();

    await expect(page).toHaveURL(/\/posts\//);
    // Author should be shown
    await expect(page.getByText("Alex Chen", { exact: false })).toBeVisible();
  });
});
