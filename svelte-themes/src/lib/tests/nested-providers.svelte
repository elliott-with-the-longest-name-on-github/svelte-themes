<script lang="ts">
	import { ThemeProvider } from '../index.js';
	import DumpTheme from './dump-theme.svelte';
</script>

<ThemeProvider defaultTheme="dark">
	<ThemeProvider defaultTheme="light">
		<DumpTheme />
	</ThemeProvider>
</ThemeProvider>
