import type { HTMLAttributes } from 'svelte/elements';

export interface ValueObject {
	[themeName: string]: string;
}

type DataAttribute = `data-${string}`;

type ScriptProps = HTMLAttributes<HTMLScriptElement> & {
	[dataAttribute: DataAttribute]: unknown;
};

export type Attribute = DataAttribute | 'class';

export type Config = Readonly<{
	/**
	 * List of all available theme names. If {@link Config.enableSystem} is false, 'system' is removed from the default.
	 * @default ['light', 'dark', 'system']
	 */
	themes?: string[] | undefined;
	/**
	 * Whether to switch between dark and light themes based on prefers-color-scheme.
	 * If this is `true` (the default), `'system'` must be a member of the {@link Config.themes} array.
	 * @default true
	 */
	enableSystem?: boolean | undefined;
	/**
	 * Disable all CSS transitions when switching themes.
	 * @default false
	 */
	disableTransitionOnChange?: boolean | undefined;
	/**
	 * Whether to indicate to browsers which color scheme is used (dark or light) for built-in UI like inputs and buttons.
	 * @default true
	 */
	enableColorScheme?: boolean | undefined;
	/**
	 * Key used to store theme setting in localStorage
	 * @default 'theme'
	 */
	storageKey?: string | undefined;
	/**
	 * Default theme name. If `enableSystem` is `false`, the default theme is `'light'`. The value assigned to this key must be a member of the {@link Config.themes} array.
	 * @default 'system'
	 */
	defaultTheme?: string | undefined;
	/**
	 * HTML attribute modified based on the active theme. Accepts `class`, `data-*` (meaning any data attribute, `data-mode`, `data-color`, etc.), or an array which could include both
	 * @default 'data-theme'
	 */
	attribute?: Attribute | Attribute[] | undefined;
	/**
	 * Mapping of theme name (eg. 'dark', 'light') to HTML attribute value (eg. 'my-dark-theme', 'my-light-theme'). Object where key is the theme name and value is the attribute value.
	 * Note that, if provided,
	 *
	 * @default {}
	 *
	 * @example
	 * ```ts
	 * const domValues = { dark: 'my-dark-theme', light: 'my-light-theme' };
	 * theme.selectedTheme = 'dark';
	 * // <html data-theme="my-dark-theme">
	 * ```
	 */
	domValues?: ValueObject | undefined;
	/**
	 * Nonce string to pass to the inline script and style elements for CSP headers.
	 */
	nonce?: string;
	/**
	 * Props to pass the inline script
	 */
	scriptProps?: ScriptProps;
	/**
	 * Forced theme name. Overrides all other theme settings.
	 */
	forcedTheme?: string | undefined;
}>;

export type ResolvedConfig = Readonly<
	RequiredExcept<Config, 'domValues' | 'nonce' | 'scriptProps' | 'forcedTheme'>
>;

type RequiredExcept<T, K extends keyof T> = Required<Omit<T, K>> & Pick<T, K>;
