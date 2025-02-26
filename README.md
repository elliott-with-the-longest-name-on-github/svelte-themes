# @sejohnson/svelte-themes

An abstraction for themes in your Svelte app.

- ✅ Perfect dark mode in 3 lines of code
- ✅ System setting with prefers-color-scheme
- ✅ Themed browser UI with color-scheme
- ✅ Svelte 5
- ✅ No flash on load (both SSR and SSG)
- ✅ Sync theme across tabs and windows
- ✅ Disable flashing when changing themes
- ✅ Force pages to specific themes
- ✅ Class or data attribute selector

> This package is a Svelte port of the excellent [next-themes](https://github.com/pacocoursey/next-themes) library. It is not identical, but is functionally very similar. A huge thank you to [pacocoursey](https://github.com/pacocoursey) for the React implementation.

## Install

```bash
$ npm install @sejohnson/svelte-themes
# or
$ pnpm i @sejohnson/svelte-themes
```

## Use

### With SvelteKit

You'll need a root [`+layout.svelte`](https://svelte.dev/docs/kit/routing#layout). The simplest `+layout.svelte` looks like this:

```svelte
<script>
	let { children } = $props();
</script>

{@render children()}
```

Adding dark mode support takes 3 lines of code:

```diff
<script>
  + import { ThemeProvider } from '@sejohnson/svelte-themes';
	let { children } = $props();
</script>

+ <ThemeProvider>
  {@render children()}
+ </ThemeProvider>
```

### HTML & CSS

That's it, your SvelteKit app fully supports dark mode, including System preference with `prefers-color-scheme`. The theme is also immediately synced between tabs. By default, svelte-themes modifies the `data-theme` attribute on the `html` element, which you can easily use to style your app:

```css
:root {
  /* Your default theme */
  --background: white;
  --foreground: black;
}

[data-theme='dark'] {
  --background: black;
  --foreground: white;
}
```

### `getTheme`

Your UI will need to know the current theme and be able to change it. The `getTheme` function provides access to everything you need:

```svelte
<script lang="ts">
  import { getTheme } from '@sejohnson/svelte-themes';
  const theme = getTheme();
</script>

<div>
  The current theme is: {theme.selectedTheme}
  <button onclick={() => theme.selectedTheme = 'light'}>Light Mode</button>
  <button onclick={() => theme.selectedTheme = 'dark'}>Dark Mode</button>
  <button onclick={() => theme.selectedTheme = 'system'}>System</button>
</div>
```

### Without SvelteKit

Just be sure to wrap your root component in `ThemeProvider`!


> [!WARNING]
> The above code is hydration _unsafe_ and will throw a hydration mismatch warning when rendering with SSR. This is because we cannot know the `theme` on the server, so it will always be `undefined` until mounted on the client.
>
> You should delay rendering any theme toggling UI until mounted on the client. See the [example](#avoid-hydration-mismatch) for details.

## API

Let's dig into the details.

### ThemeProvider

All your theme configuration is passed to ThemeProvider.

- `storageKey = 'theme'`: Key used to store theme setting in localStorage.
- `defaultTheme = 'system'`: Default theme name. If `enableSystem` is false, the default theme is `light`.
- `forcedTheme`: Forced theme name (does not modify saved theme settings).
- `enableSystem = true`: Whether to enable switching between `dark` and `light` based on `prefers-color-scheme` when `theme` is set to `system`.
- `enableColorScheme = true`: Whether to indicate to browsers which color scheme is used (dark or light) for built-in UI like inputs and buttons.
- `disableTransitionOnChange = false`: Optionally disable all CSS transitions when switching themes ([example](#disable-transitions-on-theme-change)).
- `themes = ['light', 'dark', 'system']`: List of theme names. If `enableSystem` is `false`, the default is `['light', 'dark']`.
- `attribute = 'data-theme'`: HTML attribute modified based on the active theme.
  - accepts `class` and `data-*` (meaning any data attribute, `data-mode`, `data-color`, etc.) ([example](#class-instead-of-data-attribute)).
- `value`: Optional mapping of theme name to attribute value.
  - value is an `object` where key is the theme name (eg. `'dark'` or `'light'`) and value is the attribute value (eg. `'my-dark-theme'`) ([example](#differing-dom-attribute-and-theme-name)).
- `nonce`: Optional nonce passed to the injected `script` tag, used to allow-list the next-themes script in your CSP.
- `scriptProps`: Optional props to pass to the injected `script` tag ([example](#using-with-cloudflare-rocket-loader)).

> [!NOTE]
> If `enableSystem` is `true`, `system` _must_ be a member of the `themes` array (and will be, automatically, if you aren't overriding the default). If `enableSystem` is `false`,
> `system` _must not_ be a member of the `themes` array (and, again, will automatically not be if you aren't overriding the default).

### `getTheme`

`getTheme` takes no parameters, but returns:

- `selectedTheme`: Active theme name -- can be the special value `'system'` (respects system preference) or any of the other arbitrary values in the `themes` array.
  - Assign to this value (eg. `theme.selectedTheme = 'dark'`) to change the theme. Assignments are saved to `localStorage` automatically.
- `forcedTheme`: Forced theme name. If `forcedTheme` is set, you should disable any theme switching UI.
- `resolvedTheme`: The actual theme used in your UI. The heuristic used to set this is `forcedTheme ?? selectedTheme ?? defaultTheme`, where the special value of `'system'` is resolved to its actual theme value (`'light'` or `'dark'`).
- `systemTheme`: If `enableSystem` is true, represents the System theme preference (`'dark'` or `'light'`), regardless what the active theme is.
- `themes`: The list of themes passed to `ThemeProvider`.

> [!NOTE]
> For `forcedTheme`, `defaultTheme`, and `selectedTheme`, be sure all values you plan on assigning are members of the `themes` array. 

> [!WARNING]
> `getTheme` relies on the [Context API](https://svelte.dev/docs/svelte/context), so you must call it during component initialization.

## Examples

The [Live Example](https://svelte-themes-multi-theme-example.vercel.app/) shows next-themes in action, with dark, light, system themes and pages with forced themes.

### Use System preference by default

The `defaultTheme` is automatically set to "system", so to use System preference you can simply use:

```svelte
<ThemeProvider>
```

### Ignore System preference

If you don't want a System theme, disable it via `enableSystem`:

```svelte
<ThemeProvider enableSystem={false}>
```

This will automatically remove `system` from the default `themes` array. 

### Class instead of data attribute

If your Svelte app uses a class to style the page based on the theme, change the attribute prop to `class`:

```jsx
<ThemeProvider attribute="class">
```

Now, setting the theme to "dark" will set `class="dark"` instead of `data-theme="dark"` on the `html` element.

### Force page to a theme

Let's say your cool new marketing page is dark mode only. The page should always use the dark theme, and changing the theme should have no effect. To force a theme on your SvelteKit pages, just use the `page` state in your `+layout.svelte`:

```jsx
<script lang="ts">
  import { page } from '$app/state';
  let { children } = $props();
</script>

<ThemeProvider forcedTheme={page.url.pathname === '/my-cool-marking-page' ? 'dark' : undefined}>
  {@render children?.()}
</ThemeProvider>
```

Done! Your page is always dark theme (regardless of user preference), and setting the theme has no effect. However, you should make sure to disable any of your UI that would normally change the theme:

```js
const theme = getTheme();

// Theme is forced, we shouldn't allow user to change the theme
const disabled = Boolean(theme.forcedTheme);
```


### Disable transitions on theme change

Paco wrote about [this technique here](https://paco.sh/blog/disable-theme-transitions). We can forcefully disable all CSS transitions before the theme is changed, and re-enable them immediately afterwards. This ensures your UI with different transition durations won't feel inconsistent when changing the theme.

To enable this behavior, pass the `disableTransitionOnChange` prop:

```svelte
<ThemeProvider disableTransitionOnChange>
```

### Differing DOM attribute and theme name

The name of the active theme is used as both the localStorage value and the value of the DOM attribute. If the theme name is "pink", localStorage will contain `theme=pink` and the DOM will be `data-theme="pink"`. You **cannot** modify the localStorage value, but you **can** modify the DOM value.

If we want the DOM to instead render `data-theme="my-pink-theme"` when the theme is "pink", pass the `value` prop:

```svelte
<ThemeProvider value={{ pink: 'my-pink-theme' }}>
```

Done! To be extra clear, this affects only the DOM. Here's how all the values will look:

```js
const theme = getTheme()
// theme.selectedTheme === "pink"

localStorage.getItem('theme')
// => "pink"

document.documentElement.getAttribute('data-theme')
// => "my-pink-theme"
```

### Using with Cloudflare Rocket Loader

[Rocket Loader](https://developers.cloudflare.com/fundamentals/speed/rocket-loader/) is a Cloudflare optimization that defers the loading of inline and external scripts to prioritize the website content. Since next-themes relies on a script injection to avoid screen flashing on page load, Rocket Loader breaks this functionality. Individual scripts [can be ignored](https://developers.cloudflare.com/fundamentals/speed/rocket-loader/ignore-javascripts/) by adding the `data-cfasync="false"` attribute to the script tag:

```svelte
<ThemeProvider scriptProps={{ 'data-cfasync': 'false' }}>
```

### More than light and dark mode

svelte-themes is designed to support any number of themes! Simply pass a list of themes:

```svelte
<ThemeProvider themes={['pink', 'red', 'blue']}>
```

> [!NOTE]
> When you pass `themes`, the default set of themes (`'light'`, `'dark'`, and `'system'`) are overridden. Make sure you include those if you still want your light and dark themes:

```svelte
<ThemeProvider themes={['pink', 'red', 'blue', 'light', 'dark']}>
```

For an example on how to use this, check out the [multi-theme example](./examples/multi-theme/README.md)

### Without CSS variables

This library does not rely on your theme styling using CSS variables. You can hard-code the values in your CSS, and everything will work as expected (without any flashing):

```css
html,
body {
  color: #000;
  background: #fff;
}

[data-theme='dark'],
[data-theme='dark'] body {
  color: #fff;
  background: #000;
}
```

### Avoid Hydration Mismatch

Because we cannot know the `theme` on the server, many of the values returned from `getTheme` will be `undefined` until mounted on the client. This means if you try to use JavaScript to render UI based on the current theme before mounting on the client, you will see a hydration mismatch error.

The following code sample is **unsafe**:

```svelte
<script lang="ts">
  import { getTheme } from '@sejohnson/svelte-themes'
  const theme = getTheme();
</script>

<!-- Do NOT do this! It will cause a hydration mismatch! -->
<select bind:value={theme.selectedTheme}>
  <option value="system">System</option>
  <option value="dark">Dark</option>
  <option value="light">Light</option>
</select>
```

To fix this, make sure you only use JavaScript to render UI that uses the current theme when the page is mounted on the client:

```svelte
<script lang="ts">
	import { getTheme, HydrationWatcher } from '@sejohnson/svelte-themes';
	const theme = getTheme();
	const watcher = new HydrationWatcher();
</script>

{#if watcher.hydrated}
  <select bind:value={theme.selectedTheme}>
	  <option value="system">System</option>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>
{/if}
```

`HydrationWatcher` is a simple utility class exported from this library -- it must be instantiated during component initialization, and its only property, `hydrated`, will be `true` only after the component has hydrated.

Alternatively, you could lazy load the component on the client side by using `await import('...');`.

> [!NOTE]
> To avoid [Layout Shift](https://web.dev/cls/), consider rendering a skeleton/placeholder until mounted on the client side.

#### CSS

You can also use CSS to hide or show content based on the current theme. To avoid the hydration mismatch, you'll need to render _both_ versions of the UI, with CSS hiding the unused version. For example:

```svelte
<!-- When the theme is dark, hide this div -->
<div data-hide-on-theme="dark">
  <img src="light.png" width={400} height={400} />
</div>

<!-- When the theme is light, hide this div -->
<div data-hide-on-theme="light">
  <img src="dark.png" width={400} height={400} />
</div>
```

```css
[data-theme='dark'] [data-hide-on-theme='dark'],
[data-theme='light'] [data-hide-on-theme='light'] {
  display: none;
}
```

### With TailwindCSS (v4)

[Visit the live example](https://svelte-themes-tailwind-example.vercel.app/) • [View the example source code](https://github.com/elliott-with-the-longest-name-on-github/svelte-themes/tree/master/examples/tailwind)

Modern Tailwind uses `prefers-color-scheme` to switch between `light` and `dark` modes. To support manual control over color scheme, override the default `dark` variant in your CSS config:

```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

Done! `system`, `dark`, and `light` will all work as expected.

If you need to support custom color schemes, you can define your own `@custom-variant` rules to match `data-theme=<whatever>`. 

## Discussion

### The Flash

`ThemeProvider` automatically injects a script into `<head>` to update the `html` element with the correct attributes before the rest of your page loads. After hydration, JavaScript takes over and keeps the DOM (and therefore your CSS) in sync with your code. This means the page will not flash under any circumstances, including forced themes, system theme, multiple themes, and incognito. No `noflash.js` required.

## FAQ

**Why do I get server/client mismatch error?**

When using `getTheme`, you will use see a hydration mismatch error when rendering UI that relies on JavaScript knowing the current theme. This is because many of the values returned by `getTheme` are `undefined` on the server, since we can't read `localStorage` until mounting on the client. See the [example](#avoid-hydration-mismatch) for how to fix this error.

**Do I need to use CSS variables with this library?**

Nope. See the [example](#without-css-variables).

**Can I set the class or data attribute on the body or another element?**

Nope. If you have a good reason for supporting this feature, please open an issue.

**Why is `resolvedTheme` necessary?**

When supporting the System theme preference, you want to make sure that's reflected in your UI. This means your buttons, selects, dropdowns, or whatever you use to indicate the current theme should say "System" when the System theme preference is active.

If we didn't distinguish between `selectedTheme` and `resolvedTheme`, the UI would show "Dark" or "Light", when it should really be "System".

`resolvedTheme` is then useful for modifying behavior or styles at runtime:

```jsx
const theme = getTheme()

<div style={{ color: theme.resolvedTheme === 'dark' ? 'white' : 'black' }}>
```

If we didn't have `resolvedTheme` and only used `selectedTheme`, you'd lose information about the state of your UI (you would only know the theme is "system", and not what it resolved to).
