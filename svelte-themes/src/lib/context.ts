import type { Theme } from './theme.svelte.js';
import { createContext } from './utils.svelte.js';

const {
	getContext: getTheme,
	setContext: setTheme,
	hasContext: hasTheme
} = createContext<Theme>('theme');

export { getTheme, setTheme, hasTheme };
