<script lang="ts">
	import type { Config } from '$lib/config.js';
	import { ThemeProvider } from '../index.js';
	import DumpTheme from './dump-theme.svelte';

	let props: Config = $props();
</script>

<ThemeProvider {...props}>
	<DumpTheme />
</ThemeProvider>
