<script lang="ts">
	import ThemeToggles from '$lib/theme-toggles.svelte';
</script>

<div class="w-full container p-4 mx-auto">
	<div class="py-20 flex flex-col items-center justify-center text-[var(--primary-foreground)]">
		<h1 class="text-5xl text-center font-bold">
			Svelte Themes +{' '}
			<span class="text-primary-foreground bg-primary py-2 px-4 rounded">Multi</span> Themes
		</h1>
		<ThemeToggles />
	</div>
</div>
