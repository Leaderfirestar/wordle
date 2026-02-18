import { test, expect, Page } from "@playwright/test";

// Helper to enter a word using the on-screen keyboard
async function enterWord(page: Page, word: string) {
	await page.waitForSelector(
		"[data-testid='keyboard-ready'][data-ready='true']",
	);
	for (const letter of word) {
		await page.click(`button:has-text("${letter.toUpperCase()}")`);
	}
	await page.click(`button:has-text("Enter")`);
}

test.describe("Wordle Game", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("should win with correct guess on first try", async ({ page }) => {
		await enterWord(page, "savvy");
		await expect(page.locator("text=Genius")).toBeVisible();
		await expect(page).toHaveURL(/leaderboard/);
	});

	test("should show correct phrase for 3rd try win", async ({ page }) => {
		await enterWord(page, "apple");
		await enterWord(page, "vivid");
		await enterWord(page, "savvy");
		await expect(page.locator("text=Impressive")).toBeVisible();
		await expect(page).toHaveURL(/leaderboard/);
	});

	test("should show correct word on loss", async ({ page }) => {
		for (let i = 0; i < 6; i++) {
			await enterWord(page, "apple");
		}
		await expect(page.locator("text=The word was SAVVY")).toBeVisible();
		// Should not redirect to leaderboard
		await expect(page).not.toHaveURL(/leaderboard/);
	});
});
