import { render } from 'svelte/server';
import { describe, expect, test } from 'vitest';
import TestProvider from './test-provider.svelte';

// SSR tests

const escapeOrMatchAll = (str: string | undefined) =>
	str ? str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '.*?';

function createScriptRegex({
	bodySearch,
	attributeSearch
}: {
	bodySearch?: string;
	attributeSearch?: string;
}): RegExp {
	const escapedSearch = escapeOrMatchAll(bodySearch);
	const escapedAttributeSearch = escapeOrMatchAll(attributeSearch);

	return new RegExp(
		`<script[^>]*${escapedAttributeSearch}[^>]*>[\\s\\S]*?${escapedSearch}[\\s\\S]*?</script>`,
		'g'
	);
}

function themeDump({
	theme,
	systemTheme,
	resolvedTheme,
	forcedTheme
}: {
	theme: string;
	systemTheme: string;
	resolvedTheme: string;
	forcedTheme: string;
}): string {
	return `<p data-testid="theme">${theme}</p> <p data-testid="forcedTheme">${forcedTheme}</p> <p data-testid="resolvedTheme">${resolvedTheme}</p> <p data-testid="systemTheme">${systemTheme}</p>`;
}

describe('inline script', () => {
	test('should pass props to script', () => {
		const { head } = render(TestProvider, {
			props: {
				scriptProps: { 'data-testid': '1234' }
			}
		});
		expect(head).toMatch(createScriptRegex({ attributeSearch: 'data-testid="1234"' }));
	});

	test('should correctly resolve a forced theme', async () => {
		const { head, body } = render(TestProvider, {
			props: {
				forcedTheme: 'dark',
				scriptProps: { 'data-testid': 'script-block' }
			}
		});
		expect(body).toContain(
			themeDump({
				theme: '',
				systemTheme: '',
				resolvedTheme: 'dark',
				forcedTheme: 'dark'
			})
		);
		expect(head).toMatch(
			createScriptRegex({
				attributeSearch: 'data-testid="script-block"',
				bodySearch: '"forcedTheme":"dark"'
			})
		);
	});
});
