<script lang="ts">
	import { getTheme } from '$lib/index.js';

	const theme = getTheme();
</script>

<p data-testid="theme">{theme.selectedTheme}</p>
<p data-testid="forcedTheme">{theme.forcedTheme}</p>
<p data-testid="resolvedTheme">{theme.resolvedTheme}</p>
<p data-testid="systemTheme">{theme.systemTheme}</p>
