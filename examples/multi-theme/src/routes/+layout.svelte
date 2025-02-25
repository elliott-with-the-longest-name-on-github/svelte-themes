<script lang="ts">
	import '../app.css';
	import { ThemeProvider } from '@sejohnson/svelte-themes';

	let { children } = $props();
</script>

<div class="min-h-dvh">
	<ThemeProvider
		defaultTheme="light"
		enableSystem={false}
		themes={['light', 'dark-classic', 'tangerine', 'dark-tangerine', 'mint', 'dark-mint']}
	>
		{@render children?.()}
	</ThemeProvider>
</div>
