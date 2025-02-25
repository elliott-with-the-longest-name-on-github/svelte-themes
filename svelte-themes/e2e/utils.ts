import { Page, expect, Browser, BrowserContext } from '@playwright/test';

export async function checkAppliedTheme(page: Page, theme: string): Promise<void> {
	expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe(
		theme
	);
	expect(await page.evaluate(() => document.documentElement.getAttribute('style'))).toBe(
		`color-scheme: ${theme};`
	);
}

export async function checkStoredTheme(page: Page, expectedTheme: string): Promise<void> {
	const localStorage = await page.evaluate(() => window.localStorage);
	expect(localStorage?.theme).toBe(expectedTheme);
}

type MakeBrowserContextOptions = {
	baseURL?: string;
	colorScheme?: 'light' | 'dark' | 'no-preference';
	localStorage?: { name: string; value: string }[];
};

export async function makeBrowserContext(
	browser: Browser,
	options: MakeBrowserContextOptions
): Promise<BrowserContext> {
	return await browser.newContext({
		colorScheme: options.colorScheme ?? 'no-preference',
		storageState: {
			cookies: [],
			origins: [
				{
					origin: options.baseURL ?? 'http://localhost:4173',
					localStorage: options.localStorage ?? []
				}
			]
		}
	});
}
