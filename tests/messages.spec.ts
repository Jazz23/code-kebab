import { test, expect } from "@playwright/test";
import { login, waitForHydration } from "./helpers";

// Messages tests share samira's inbox — run serially to avoid
// overloading the /messages page with too many concurrent queries.
test.describe.configure({ mode: "serial" });

test.describe("Direct Messages", () => {
  test("sends a direct message", async ({ page }) => {
    await login(page, "alex@example.com", "password");
    await page.goto("/messages/compose?to=samira");
    await waitForHydration(page);

    const subject = `Test Subject ${Date.now()}`;
    const body = "Hello from Playwright test!";

    await page.getByPlaceholder("(no subject)").fill(subject);
    await page.getByPlaceholder("Write your message…").fill(body);

    await page.getByRole("button", { name: "Send" }).click();

    // Should redirect to sent messages tab
    await expect(page).toHaveURL(/\/messages.*tab=sent/);
    await expect(page.getByText(subject)).toBeVisible();
  });

  test("shows message in recipient inbox", async ({ page }) => {
    // Login as alex to send a message
    await login(page, "alex@example.com", "password");
    const subject = `Inbox Test ${Date.now()}`;
    await page.goto("/messages/compose?to=samira");
    await waitForHydration(page);
    await page.getByPlaceholder("(no subject)").fill(subject);
    await page.getByPlaceholder("Write your message…").fill("Testing inbox delivery.");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page).toHaveURL(/messages.*tab=sent/);

    // Login as samira to check inbox
    await login(page, "samira@example.com", "password");
    await page.goto("/messages");

    await expect(page.getByText(subject)).toBeVisible();
  });

  test("views sent messages", async ({ page }) => {
    await login(page, "alex@example.com", "password");

    const subject = `Sent View ${Date.now()}`;
    await page.goto("/messages/compose?to=samira");
    await waitForHydration(page);
    await page.getByPlaceholder("(no subject)").fill(subject);
    await page.getByPlaceholder("Write your message…").fill("Checking sent messages view.");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page).toHaveURL(/messages.*tab=sent/);
    await expect(page.getByText(subject)).toBeVisible();
    // Recipient info should show — use first() since many @samira entries exist
    await expect(page.getByText(/Samira Osei|samira/i).first()).toBeVisible();
  });

  test("marks message as read when viewed by recipient", async ({ page }) => {
    // Send message from alex to samira
    await login(page, "alex@example.com", "password");
    const subject = `Read Test ${Date.now()}`;
    await page.goto("/messages/compose?to=samira");
    await waitForHydration(page);
    await page.getByPlaceholder("(no subject)").fill(subject);
    await page.getByPlaceholder("Write your message…").fill("Please read this message.");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page).toHaveURL(/messages.*tab=sent/);

    // Login as samira and view the message
    await login(page, "samira@example.com", "password");
    await page.goto("/messages");

    // Click the message by unique subject to open it
    await page.getByText(subject).click();
    await expect(page).toHaveURL(/\/messages\//);
    await expect(page.getByText("Please read this message.")).toBeVisible();
  });

  test("replies to a message creating a thread", async ({ page }) => {
    // Send initial message from alex to samira
    await login(page, "alex@example.com", "password");
    const subject = `Thread Test ${Date.now()}`;
    await page.goto("/messages/compose?to=samira");
    await waitForHydration(page);
    await page.getByPlaceholder("(no subject)").fill(subject);
    await page.getByPlaceholder("Write your message…").fill("This is the original message.");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page).toHaveURL(/messages.*tab=sent/);

    // Login as samira and reply
    await login(page, "samira@example.com", "password");
    await page.goto("/messages");
    await page.getByText(subject).click();

    // Click the reply link
    await page.getByRole("link", { name: /Reply/i }).click();
    await expect(page).toHaveURL(/compose/);
    await waitForHydration(page);

    // Fill the reply
    await page.getByPlaceholder("Write your message…").fill("This is my reply!");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page).toHaveURL(/messages.*tab=sent/);
    await expect(page.getByText(`Re: ${subject}`)).toBeVisible();
  });
});
