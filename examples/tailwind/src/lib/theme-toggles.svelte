<script lang="ts">
	import { getTheme, HydrationWatcher } from '@sejohnson/svelte-themes';
	const theme = getTheme();

	// The active theme is not available on the server.
	// If you have styling that is conditionally applied using JavaScript based on the active-theme,
	// you have to await the mounted state before rendering the active theme.
	// (If possible, it is recommended to use CSS variables for styling that is conditionally applied based on the active theme.)
	// If you're using Tailwind, that just means setting `attribute="class"` in the ThemeProvider and using `dark:` modifiers.
	const watcher = new HydrationWatcher();

	const themeMapping: Record<string, string> = {
		light: 'Light',
		dark: 'Dark',
		system: 'System',
		'dark-slate': 'Dark Slate'
	};
</script>

<div>
	<div class="mt-16 grid grid-cols-3 grid-rows-2 grid-flow-col gap-4">
		{#each Object.entries(themeMapping) as [key, value] (key)}
			<button
				class="px-4 py-2 font-semibold rounded-md transition-colors duration-200 bg-white text-black dark:text-white dark:bg-black dark-slate:text-white dark-slate:bg-slate-700 {watcher.hydrated &&
				theme.selectedTheme == key
					? 'border border-black dark:border-white dark-slate:border-white'
					: ''}"
				onclick={() => {
					theme.selectedTheme = key;
				}}
			>
				{value}
			</button>
		{/each}
	</div>
</div>
