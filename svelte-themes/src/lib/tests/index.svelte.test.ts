import { vi, beforeAll, beforeEach, afterAll, describe, test, it, expect } from 'vitest';
import { type Config } from '../index.js';
import { render } from '@testing-library/svelte';
import { Theme } from '$lib/theme.svelte.js';
import type { ResolvedConfig } from '$lib/config.js';
import NestedProviders from './nested-providers.svelte';
import TestProvider from './test-provider.svelte';

// CSR tests

let originalLocalStorage: Storage;
const localStorageMock: Storage = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: vi.fn((key: string): string => store[key] ?? null),
		setItem: vi.fn((key: string, value: string): void => {
			store[key] = value.toString();
		}),
		removeItem: vi.fn((key: string): void => {
			delete store[key];
		}),
		clear: vi.fn((): void => {
			store = {};
		}),
		key: vi.fn((_index: number): string | null => ''),
		length: Object.keys(store).length
	};
})();

function setDeviceTheme(theme: 'light' | 'dark') {
	// Create a mock of the window.matchMedia function
	// Based on: https://stackoverflow.com/questions/39830580/jest-test-fails-typeerror-window-matchmedia-is-not-a-function
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: vi.fn().mockImplementation((query) => ({
			matches: theme === 'dark' ? true : false,
			media: query,
			onchange: null,
			addListener: vi.fn(), // Deprecated
			removeListener: vi.fn(), // Deprecated
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}))
	});
}

beforeAll(() => {
	// Create mocks of localStorage getItem and setItem functions
	originalLocalStorage = window.localStorage;
	window.localStorage = localStorageMock;
});

beforeEach(() => {
	// Reset window side-effects
	setDeviceTheme('light');
	document.documentElement.style.colorScheme = '';
	document.documentElement.removeAttribute('data-theme');
	document.documentElement.removeAttribute('class');

	// Clear the localStorage-mock
	localStorageMock.clear();
});

afterAll(() => {
	window.localStorage = originalLocalStorage;
});

function config({
	disableTransitionOnChange = false,
	enableSystem = true,
	enableColorScheme = true,
	storageKey = 'theme',
	themes = enableSystem ? ['dark', 'light', 'system'] : ['dark', 'light'],
	defaultTheme = enableSystem ? 'system' : 'light',
	attribute = 'data-theme',
	...rest
}: Config = {}): ResolvedConfig {
	const config = $state({
		disableTransitionOnChange,
		enableSystem,
		enableColorScheme,
		storageKey,
		themes,
		defaultTheme,
		attribute,
		...rest
	});
	return config;
}

describe('defaultTheme', () => {
	test('should return system-theme when no default-theme is set', () => {
		const cleanup = $effect.root(() => {
			setDeviceTheme('light');
			const t = new Theme(config());
			expect(t.selectedTheme).toBe('system');
			expect(t.systemTheme).toBe('light');
			expect(t.resolvedTheme).toBe('light');
		});
		cleanup();
	});

	test('should return light when no default-theme is set and enableSystem=false', () => {
		const cleanup = $effect.root(() => {
			const t = new Theme(config({ enableSystem: false }));
			expect(t.selectedTheme).toBe('light');
			expect(t.resolvedTheme).toBe('light');
		});
		cleanup();
	});

	test('should return light when light is set as default-theme', () => {
		const cleanup = $effect.root(() => {
			const t = new Theme(config({ defaultTheme: 'light' }));
			expect(t.selectedTheme).toBe('light');
			expect(t.resolvedTheme).toBe('light');
		});
		cleanup();
	});

	test('should return dark when dark is set as default-theme', () => {
		const cleanup = $effect.root(() => {
			const t = new Theme(config({ defaultTheme: 'dark' }));
			expect(t.selectedTheme).toBe('dark');
			expect(t.resolvedTheme).toBe('dark');
		});
		cleanup();
	});

	test('should allow changing the default theme', () => {
		const cleanup = $effect.root(() => {
			const c = config({ defaultTheme: 'dark' });
			const t = new Theme(c);
			expect(t.selectedTheme).toBe('dark');
			expect(t.resolvedTheme).toBe('dark');

			// @ts-expect-error -- yeah yeah, I'm just emulating a prop change
			c.defaultTheme = 'light';
			expect(t.selectedTheme).toBe('light');
			expect(t.resolvedTheme).toBe('light');
		});
		cleanup();
	});
});

describe('provider', () => {
	it('ignores nested ThemeProviders', () => {
		const { getByTestId } = render(NestedProviders);

		expect(getByTestId('theme').textContent).toBe('dark');
		expect(getByTestId('resolvedTheme').textContent).toBe('dark');
	});
});

describe('storage', () => {
	test('should not set localStorage with default value', () => {
		const cleanup = $effect.root(() => {
			new Theme(config({ defaultTheme: 'dark' }));
			expect(window.localStorage.setItem).toBeCalledTimes(0);
			expect(window.localStorage.getItem('theme')).toBeNull();
		});
		cleanup();
	});

	test('should set localStorage when switching themes', () => {
		const cleanup = $effect.root(() => {
			const t = new Theme(config());
			t.selectedTheme = 'dark';
			expect(window.localStorage.setItem).toBeCalledTimes(1);
			expect(window.localStorage.getItem('theme')).toBe('dark');
		});
		cleanup();
	});
});

describe('custom storageKey', () => {
	test("should save to localStorage with 'theme' key when using default settings", () => {
		const cleanup = $effect.root(() => {
			const t = new Theme(config());
			t.selectedTheme = 'dark';
			expect(window.localStorage.setItem).toBeCalledTimes(1);
			expect(window.localStorage.getItem('theme')).toBe('dark');
		});
		cleanup();
	});

	test("should save to localStorage with 'custom' when setting prop 'storageKey' to 'customKey'", () => {
		const cleanup = $effect.root(() => {
			const t = new Theme(config({ storageKey: 'custom' }));
			t.selectedTheme = 'dark';
			expect(window.localStorage.setItem).toBeCalledTimes(1);
			expect(window.localStorage.getItem('custom')).toBe('dark');
		});
		cleanup();
	});
});

describe('custom attribute', () => {
	test('should use data-theme attribute when using default', () => {
		render(TestProvider);
		expect(document.documentElement.getAttribute('data-theme')).toBe('light');
	});

	test('should use class attribute (CSS-class) when attribute="class"', () => {
		render(TestProvider, { attribute: 'class' });
		expect(document.documentElement.classList.contains('light')).toBe(true);
	});

	test('should use "data-example"-attribute when attribute="data-example"', () => {
		render(TestProvider, { attribute: 'data-example' });
		expect(document.documentElement.getAttribute('data-example')).toBe('light');
	});

	test('supports multiple attributes', () => {
		render(TestProvider, { attribute: ['data-example', 'data-theme-test', 'class'] });
		expect(document.documentElement.getAttribute('data-example')).toBe('light');
		expect(document.documentElement.getAttribute('data-theme-test')).toBe('light');
		expect(document.documentElement.classList.contains('light')).toBe(true);
	});
});

describe('custom value-mapping', () => {
	test('should use custom value mapping when using value={{pink:"my-pink-theme"}}', () => {
		localStorageMock.setItem('theme', 'pink');
		render(TestProvider, {
			themes: ['pink', 'light', 'dark', 'system'],
			domValues: { pink: 'my-pink-theme' }
		});
		expect(document.documentElement.getAttribute('data-theme')).toBe('my-pink-theme');
		expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'pink');
	});

	test('should allow missing values (attribute)', () => {
		localStorageMock.setItem('theme', 'light');
		render(TestProvider, { domValues: { dark: 'dark-mode' } });
		expect(document.documentElement.hasAttribute('data-theme')).toBe(true);
	});

	test('should not allow missing values (class)', () => {
		render(TestProvider, {
			attribute: 'class',
			domValues: { dark: 'dark-mode' }
		});
		expect(document.documentElement.classList.contains('light')).toBe(true);
	});

	test('supports multiple attributes', () => {
		localStorageMock.setItem('theme', 'pink');
		render(TestProvider, {
			attribute: ['data-example', 'data-theme-test', 'class'],
			domValues: { pink: 'my-pink-theme' },
			themes: ['pink', 'light', 'dark', 'system']
		});
		expect(document.documentElement.getAttribute('data-example')).toBe('my-pink-theme');
		expect(document.documentElement.getAttribute('data-theme-test')).toBe('my-pink-theme');
		expect(document.documentElement.classList.contains('my-pink-theme')).toBe(true);
	});
});

describe('forcedTheme', () => {
	test('should render saved theme when no forcedTheme is set', () => {
		localStorageMock.setItem('theme', 'dark');

		const cleanup = $effect.root(() => {
			const t = new Theme(config());
			t.selectedTheme = 'dark';
			expect(t.selectedTheme).toBe('dark');
			expect(t.forcedTheme).toBeUndefined();
		});
		cleanup();
	});

	test('should render light theme when forcedTheme is set to light', () => {
		setDeviceTheme('dark');

		const { getByTestId } = render(TestProvider, { forcedTheme: 'light' });
		expect(getByTestId('theme').textContent).toBe('system');
		expect(getByTestId('systemTheme').textContent).toBe('dark');
		expect(getByTestId('resolvedTheme').textContent).toBe('light');
		expect(getByTestId('forcedTheme').textContent).toBe('light');
	});

	test('should switch the theme when `forcedTheme` changes', async () => {
		setDeviceTheme('dark');

		const { getByTestId, rerender } = render(TestProvider, { forcedTheme: 'light' });
		expect(getByTestId('theme').textContent).toBe('system');
		expect(getByTestId('systemTheme').textContent).toBe('dark');
		expect(getByTestId('resolvedTheme').textContent).toBe('light');
		expect(getByTestId('forcedTheme').textContent).toBe('light');

		await rerender({ forcedTheme: 'system' });
		expect(getByTestId('theme').textContent).toBe('system');
		expect(getByTestId('systemTheme').textContent).toBe('dark');
		expect(getByTestId('resolvedTheme').textContent).toBe('dark');
		expect(getByTestId('forcedTheme').textContent).toBe('system');
	});
});

describe('system theme', () => {
	test('resolved theme should be set', () => {
		setDeviceTheme('dark');
		const cleanup = $effect.root(() => {
			const t = new Theme(config());
			expect(t.selectedTheme).toBe('system');
			expect(t.systemTheme).toBe('dark');
			expect(t.resolvedTheme).toBe('dark');
		});
		cleanup();
	});

	test('system theme should be set, even if theme is not system', () => {
		setDeviceTheme('dark');

		const cleanup = $effect.root(() => {
			const t = new Theme(config({ defaultTheme: 'light' }));
			expect(t.selectedTheme).toBe('light');
			expect(t.systemTheme).toBe('dark');
			expect(t.resolvedTheme).toBe('light');
		});
		cleanup();
	});

	test('system theme should not be set if enableSystem is false', () => {
		setDeviceTheme('dark');

		const cleanup = $effect.root(() => {
			const t = new Theme(config({ defaultTheme: 'light', enableSystem: false }));
			expect(t.selectedTheme).toBe('light');
			expect(t.systemTheme).toBeUndefined();
			expect(t.resolvedTheme).toBe('light');
		});
		cleanup();
	});
});

describe('color-scheme', () => {
	test('does not set color-scheme when disabled', () => {
		render(TestProvider, { enableColorScheme: false });
		expect(document.documentElement.style.colorScheme).toBe('');
	});

	test('should set color-scheme light when light theme is active', () => {
		render(TestProvider);
		expect(document.documentElement.getAttribute('data-theme')).toBe('light');
		expect(document.documentElement.style.colorScheme).toBe('light');
	});

	test('should set color-scheme dark when dark theme is active', () => {
		setDeviceTheme('dark');
		render(TestProvider);
		expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
		expect(document.documentElement.style.colorScheme).toBe('dark');
	});
});

describe('updating theme', () => {
	test('<literal>', () => {
		$effect.root(() => {
			const t = new Theme(config());
			expect(t.selectedTheme).toBe('system');
			expect(t.resolvedTheme).toBe('light');
			t.selectedTheme = 'dark';
			expect(t.selectedTheme).toBe('dark');
			expect(t.resolvedTheme).toBe('dark');
		});
	});

	test('based on current theme', () => {
		$effect.root(() => {
			const t = new Theme(config({ defaultTheme: 'light' }));
			expect(t.selectedTheme).toBe('light');
			expect(t.resolvedTheme).toBe('light');
			t.selectedTheme = t.resolvedTheme === 'light' ? 'dark' : 'light';
			expect(t.selectedTheme).toBe('dark');
			expect(t.resolvedTheme).toBe('dark');
			t.selectedTheme = t.selectedTheme === 'light' ? 'dark' : 'light';
			expect(t.selectedTheme).toBe('light');
			expect(t.resolvedTheme).toBe('light');
		});
	});
});

describe('inline script', () => {
	test('should not exist after hydration', () => {
		render(TestProvider, {
			scriptProps: { 'data-test': '1234' }
		});
		expect(document.querySelector('script[data-test="1234"]')).not.toBeTruthy();
	});
});
