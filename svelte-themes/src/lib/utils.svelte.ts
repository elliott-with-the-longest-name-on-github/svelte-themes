import { setContext, getContext, hasContext, onMount } from 'svelte';

export function isServer(): boolean {
	return typeof window === 'undefined';
}

export function createContext<T>(symbolName: string): {
	setContext: (value: T) => void;
	getContext: () => T;
	hasContext: () => boolean;
} {
	const symbol = Symbol(symbolName);
	return {
		setContext: (value) => {
			setContext(symbol, value);
		},
		getContext: () => {
			if (!hasContext(symbol)) {
				throw new Error(
					'Tried to get a nonexistent context. Did you forget to render the provider?'
				);
			}
			return getContext(symbol);
		},
		hasContext: () => {
			return hasContext(symbol);
		}
	};
}

export class HydrationWatcher {
	#hydrated = $state(false);

	get hydrated() {
		return this.#hydrated;
	}

	constructor() {
		onMount(() => {
			this.#hydrated = true;
		});
	}
}
