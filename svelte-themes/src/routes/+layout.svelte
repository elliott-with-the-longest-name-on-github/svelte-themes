<script lang="ts">
	import { ThemeProvider } from '$lib/index.js';
	import { page } from '$app/state';

	let { children } = $props();

	let forcedTheme = $derived.by(() => {
		if (page.url.pathname === '/dark') return 'dark';
		if (page.url.pathname === '/light') return 'light';
		return undefined;
	});
</script>

<ThemeProvider {forcedTheme}>
	{@render children()}
</ThemeProvider>
