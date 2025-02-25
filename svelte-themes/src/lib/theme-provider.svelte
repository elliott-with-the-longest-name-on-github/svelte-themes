<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import HeadScript from './head-script.svelte';
	import { Theme } from './theme.svelte.js';
	import type { Config } from './config.js';
	import { hasTheme } from './index.js';
	import { setTheme } from './context.js';
	import { run } from 'svelte/legacy';

	let {
		disableTransitionOnChange = false,
		enableSystem = true,
		enableColorScheme = true,
		storageKey = 'theme',
		themes = enableSystem ? ['dark', 'light', 'system'] : ['dark', 'light'],
		defaultTheme = enableSystem ? 'system' : 'light',
		attribute = 'data-theme',
		children,
		domValues,
		nonce,
		forcedTheme,
		scriptProps
	}: Config & { children?: Snippet } = $props();

	if (!hasTheme()) {
		const theme = new Theme({
			get disableTransitionOnChange() {
				return disableTransitionOnChange;
			},
			get enableSystem() {
				return enableSystem;
			},
			get enableColorScheme() {
				return enableColorScheme;
			},
			get storageKey() {
				return storageKey;
			},
			get themes() {
				return themes;
			},
			get defaultTheme() {
				return defaultTheme;
			},
			get attribute() {
				return attribute;
			},
			get domValues() {
				return domValues;
			},
			get nonce() {
				return nonce;
			},
			get forcedTheme() {
				return forcedTheme;
			}
		});
		setTheme(theme);
	}

	let hydrated = $state(false);
	onMount(() => {
		hydrated = true;
	});

	run(() => {
		if (enableSystem && !themes.includes('system')) {
			throw new Error('You must include `system` in the themes array when enableSystem is `true`');
		}
		if (!enableSystem && themes.includes('system')) {
			throw new Error(
				'You must set enableSystem to `true` when including `system` in the themes array'
			);
		}
		if (!enableSystem && defaultTheme === 'system') {
			throw new Error('You cannot set the default theme to `system` when enableSystem is `false`');
		}
		if (!enableSystem && forcedTheme === 'system') {
			throw new Error('You cannot force the theme to `system` when enableSystem is `false`');
		}
		if (defaultTheme && !themes.includes(defaultTheme)) {
			throw new Error('The default theme must be included in the themes array');
		}
		if (forcedTheme && !themes.includes(forcedTheme)) {
			throw new Error('The forced theme must be included in the themes array');
		}
	});
</script>

{#if !hydrated}
	<HeadScript
		{attribute}
		{storageKey}
		{defaultTheme}
		{themes}
		{enableSystem}
		{enableColorScheme}
		{domValues}
		{nonce}
		{forcedTheme}
		{scriptProps}
	/>
{/if}
{@render children?.()}
