import type { ResolvedConfig } from './config.js';

export function script({
	attribute,
	storageKey,
	defaultTheme,
	themes,
	domValues,
	enableSystem,
	enableColorScheme,
	forcedTheme
}: Pick<
	ResolvedConfig,
	| 'attribute'
	| 'storageKey'
	| 'defaultTheme'
	| 'themes'
	| 'domValues'
	| 'enableSystem'
	| 'enableColorScheme'
	| 'forcedTheme'
>) {
	const el = document.documentElement;
	const systemThemes = ['light', 'dark'];

	function updateDOM(theme: string) {
		const attributes = Array.isArray(attribute) ? attribute : [attribute];

		attributes.forEach((attr) => {
			const isClass = attr === 'class';
			const classes = isClass && domValues ? themes.map((t) => domValues[t] || t) : themes;
			const domValue = domValues ? (domValues[theme] ?? theme) : theme;
			if (isClass) {
				el.classList.remove(...classes);
				if (domValue) el.classList.add(domValue);
			} else {
				if (domValue) {
					el.setAttribute(attr, theme);
				} else {
					el.removeAttribute(attr);
				}
			}
		});

		setColorScheme(theme);
	}

	function setColorScheme(theme: string) {
		if (enableColorScheme && systemThemes.includes(theme)) {
			el.style.colorScheme = theme;
		}
	}

	function getSystemTheme() {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	if (forcedTheme) {
		updateDOM(forcedTheme);
	} else {
		try {
			const themeName = localStorage.getItem(storageKey) || defaultTheme;
			const isSystem = enableSystem && themeName === 'system';
			const theme = isSystem ? getSystemTheme() : themeName;
			updateDOM(theme);
		} catch {
			// Ignore
		}
	}
}
