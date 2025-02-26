<script lang="ts">
	import { getTheme } from '$lib/index.js';
	const theme = getTheme();
</script>

<div>
	<h1>svelte-themes Example</h1>
	<select bind:value={theme.selectedTheme} data-test-id="theme-selector">
		<option value="system">System</option>
		<option value="light">Light</option>
		<option value="dark">Dark</option>
	</select>

	<br />
	<br />

	<div>
		<a href="/dark">Forced Dark Page</a> • <a href="/light">Forced Light Page</a>
	</div>
</div>
