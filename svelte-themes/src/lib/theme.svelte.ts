import { tick } from 'svelte';
import { MediaQuery } from 'svelte/reactivity';
import { isServer } from './utils.svelte.js';
import type { ResolvedConfig } from './config.js';

const colorSchemes = ['light', 'dark'];

export class Theme {
	/** The user-selected theme. */
	#selectedTheme: string | undefined = $state();

	/** Config from the provider component */
	readonly #config: Omit<ResolvedConfig, 'scriptProps'>;

	constructor(config: ResolvedConfig) {
		this.#config = config;
		this.#selectedTheme = this.#getStoredTheme();

		// This sets up the side effects necessary to sync the theme with the DOM
		$effect(() => {
			const domValues = this.#config.domValues;
			const attributeDOMValue = domValues
				? (domValues[this.resolvedTheme] ?? this.resolvedTheme)
				: this.resolvedTheme;
			const reenableAnimation = this.#config.disableTransitionOnChange
				? this.#disableAnimation()
				: undefined;
			const attrs = domValues ? Object.values(domValues) : this.#config.themes;

			const d = document.documentElement;
			if (Array.isArray(this.#config.attribute)) {
				this.#config.attribute.forEach((attr) =>
					Theme.#handleAttribute(d, { name: attributeDOMValue, attr, attrs })
				);
			} else {
				Theme.#handleAttribute(d, { name: attributeDOMValue, attr: this.#config.attribute, attrs });
			}

			if (this.#config.enableColorScheme) {
				const fallback = colorSchemes.includes(this.#config.defaultTheme)
					? this.#config.defaultTheme
					: null;
				const colorScheme = colorSchemes.includes(this.resolvedTheme)
					? this.resolvedTheme
					: fallback;
				// @ts-expect-error - Just do it
				d.style.colorScheme = colorScheme;
			}

			reenableAnimation?.();
		});

		// This one sets up localStorage events
		$effect(() => {
			const listener = (e: StorageEvent) => {
				if (e.key !== this.#config.storageKey) {
					return;
				}

				if (!e.newValue) {
					this.selectedTheme = this.#config.defaultTheme;
				} else {
					this.selectedTheme = e.newValue;
				}
			};

			window.addEventListener('storage', listener);
			return () => {
				window.removeEventListener('storage', listener);
			};
		});
	}

	/** Forced theme name, controllable only through `ThemeProvider`'s props */
	get forcedTheme() {
		return this.#config.forcedTheme;
	}

	/** The user-selected theme. Does not respect {@link forcedTheme} or {@link defaultTheme}. */
	get selectedTheme(): string | undefined {
		return this.#selectedTheme;
	}

	/** The user-selected theme. Does not respect {@link forcedTheme} or {@link defaultTheme}. */
	set selectedTheme(v: string) {
		if (!this.#config.enableSystem && v === 'system') {
			throw new Error(
				'Attempted to set theme to "system", but system theme is not enabled. Set `enableSystem` to true in the theme config.'
			);
		}
		if (!this.#config.themes.includes(v)) {
			throw new Error(
				`Attempted to set theme to "${v}", but that theme is not in the list of available themes.`
			);
		}

		this.#selectedTheme = v;

		try {
			localStorage.setItem(this.#config.storageKey, v);
		} catch {
			// Unsupported
		}
	}

	/** List of all available theme names */
	get themes() {
		return this.#config.themes;
	}

	/**
	 * This is the theme that is actually applied to the DOM at any given time.
	 * If `enableSystem` is true and the active theme is "system", this returns whether the system preference resolved to "dark" or "light".
	 * It does respect forced themes.
	 * `resolvedTheme` will never be "system", as "system" will always resolve to "dark" or "light".
	 */
	readonly resolvedTheme = $derived.by(() => {
		let theme = this.forcedTheme ?? this.selectedTheme ?? this.defaultTheme;
		if (theme === 'system') {
			theme = this.systemTheme ?? this.defaultTheme;
		}
		return theme ?? this.defaultTheme;
	});

	/** The default theme name */
	readonly defaultTheme = $derived.by(() => {
		if (this.#config.defaultTheme === 'system') {
			// This complicated fallback basically says "if we can't find the system theme, get the first non-system theme in the list, and if there's not one of those, go with light"
			return this.systemTheme ?? this.#config.themes.filter((t) => t !== 'system')[0] ?? 'light';
		}
		return this.#config.defaultTheme;
	});

	/** The system color theme */
	readonly systemTheme = $derived.by(() => {
		if (!this.#config.enableSystem || isServer()) {
			return undefined;
		}
		return new MediaQuery('(prefers-color-scheme: dark)').current ? 'dark' : 'light';
	});

	#disableAnimation() {
		const css = document.createElement('style');
		if (this.#config.nonce) {
			css.setAttribute('nonce', this.#config.nonce);
		}
		css.appendChild(
			document.createTextNode(
				`*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
			)
		);
		document.head.appendChild(css);

		return () => {
			// Force restyle
			(() => window.getComputedStyle(document.body))();

			// Wait for next tick before removing
			tick().then(() => {
				document.head.removeChild(css);
			});
		};
	}

	#getStoredTheme() {
		if (isServer()) {
			return undefined;
		}

		try {
			return localStorage.getItem(this.#config.storageKey) ?? undefined;
		} catch {
			return undefined;
		}
	}

	static #handleAttribute(
		el: HTMLElement,
		{ name, attr, attrs }: { name: string | undefined; attr: string; attrs: string[] }
	) {
		if (attr === 'class') {
			el.classList.remove(...attrs);
			if (name) el.classList.add(name);
		} else if (attr.startsWith('data-')) {
			if (name) {
				el.setAttribute(attr, name);
			} else {
				el.removeAttribute(attr);
			}
		}
	}
}
