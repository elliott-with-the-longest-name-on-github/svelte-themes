import { test } from '@playwright/test';
import { checkAppliedTheme, checkStoredTheme, makeBrowserContext } from './utils.js';

test.describe('system theme test-suite', () => {
	function testSystemTheme(
		pagePath: string,
		preferredColorScheme: 'light' | 'dark',
		expectedTheme: string
	) {
		test(`should render ${expectedTheme} theme if preferred-colorscheme is ${preferredColorScheme}`, async ({
			browser,
			baseURL
		}) => {
			const context = await makeBrowserContext(browser, {
				colorScheme: preferredColorScheme,
				baseURL,
				localStorage: [{ name: 'theme', value: 'system' }]
			});

			const page = await context.newPage();
			await page.goto(pagePath);

			await checkStoredTheme(page, 'system');
			await checkAppliedTheme(page, expectedTheme);
		});
	}

	// Test if preferred-colorscheme works
	testSystemTheme('/', 'light', 'light');
	testSystemTheme('/', 'dark', 'dark');
});
