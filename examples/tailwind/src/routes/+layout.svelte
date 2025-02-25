<script lang="ts">
	import '../app.css';
	import { ThemeProvider } from '@sejohnson/svelte-themes';

	let { children } = $props();
</script>

<div class="min-h-dvh bg-white dark:bg-black dark-slate:bg-slate-700">
	<ThemeProvider themes={['light', 'dark', 'system', 'dark-slate']}>
		{@render children?.()}
	</ThemeProvider>
</div>
