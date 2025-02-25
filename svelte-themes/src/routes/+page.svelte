<script lang="ts">
	import { getTheme } from '$lib/index.js';
	import { onMount } from 'svelte';
	const theme = getTheme();

	let options = $state([{ value: 'system', label: 'System' }]);

	onMount(() => {
		options.push({ value: 'dark', label: 'Dark' });
		options.push({ value: 'light', label: 'Light' });
	});
</script>

<div>
	<h1>svelte-themes Example</h1>
	<select bind:value={theme.selectedTheme} data-test-id="theme-selector">
		{#each options as { value, label } (value)}
			<option {value}>{label}</option>
		{/each}
	</select>

	<br />
	<br />

	<div>
		<a href="/dark">Forced Dark Page</a> • <a href="/light">Forced Light Page</a>
	</div>
</div>
