import { defineConfig } from '@playwright/test';

// @ts-expect-error - I don't want to define Node types
const CI = !!process.env.CI;

export default defineConfig({
	forbidOnly: CI,
	retries: CI ? 2 : 0,
	reporter: CI ? 'github' : 'list',

	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: !CI,
		timeout: 120 * 1000
	},

	use: {
		trace: 'on-first-retry',
		baseURL: 'http://localhost:4173'
	},

	testDir: 'e2e'
});
