<script lang="ts">
	import type { ResolvedConfig } from './config.js';
	import { isServer } from './utils.js';
	import { script as scriptFn } from './dom.js';

	// This script is used to set the initial theme state based on the user's saved preferences.
	// It allows us to avoid FOUC.

	let {
		attribute,
		storageKey,
		defaultTheme,
		themes,
		domValues,
		enableSystem,
		enableColorScheme,
		scriptProps,
		nonce,
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
		| 'scriptProps'
		| 'nonce'
		| 'forcedTheme'
	> = $props();

	const scriptArgs = $derived(
		JSON.stringify({
			attribute,
			storageKey,
			defaultTheme,
			themes,
			domValues,
			enableSystem,
			enableColorScheme,
			forcedTheme
		})
	);

	let scriptAttributes = $derived.by(() => {
		if (!scriptProps) return '';
		let str = '';
		if (isServer() && nonce) {
			str += `nonce="${nonce}" `;
		}
		for (const [key, value] of Object.entries(scriptProps)) {
			str += `${key}="${value}" `;
		}
		return str;
	});

	const scriptBody = $derived(`(${scriptFn.toString()})(${scriptArgs})`);
</script>

<svelte:head>
	{@html `
		<script ${scriptAttributes}>
			${scriptBody}
		</script>
	`}
</svelte:head>
