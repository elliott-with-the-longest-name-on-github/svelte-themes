# tailwind example

> An example on how to handle multiple-themes with `svelte-themes` using SvelteKit.

Illustrates how to use themes (including custom themes) with Tailwind. Note that current versions of Tailwind default to using `prefers-color-scheme`,
so supporting your own manual toggles (for example, allowing the user to select `light`, `dark`, or `system`) requires manual configuration:

```css
@custom-variant dark-slate (&:where([data-theme=dark-slate], [data-theme=dark-slate] *));
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

Setting the above will allow you to use `dark:` and `dark-slate:` variants throughout your app. Setting `system` through `ThemeProvider` will
work automatically.
