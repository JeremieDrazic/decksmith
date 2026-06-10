# Self-hosting the fonts

By default the system loads fonts from CDN (`tokens/fonts.css`). For production or offline use, host
them yourself and switch `styles.css` to `@import url('tokens/fonts-local.css')`.

## Fastest path — @fontsource + npm packages

```bash
npm i @fontsource/outfit @fontsource/jetbrains-mono mana-font keyrune
```

Then copy the binaries into `assets/fonts/files/`:

```bash
mkdir -p assets/fonts/files
cp node_modules/@fontsource/outfit/files/outfit-latin-{400,500,600,700,800}-normal.woff2 assets/fonts/files/
cp node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-{400,500,600}-normal.woff2 assets/fonts/files/
cp node_modules/mana-font/fonts/mana.woff2 node_modules/mana-font/fonts/mana.woff assets/fonts/files/
cp node_modules/keyrune/fonts/keyrune.woff2 node_modules/keyrune/fonts/keyrune.woff assets/fonts/files/
# class utilities for the MTG symbols (.ms-w, .ss-…):
cp node_modules/mana-font/css/mana.min.css node_modules/keyrune/css/keyrune.min.css tokens/
```

If you bundle with Vite/webpack you can skip the CSS copy and just
`import '@fontsource/outfit/400.css'` (etc.), `import 'mana-font'`, `import 'keyrune'` in your
entry, then `@import` only the **non-font** token files from `styles.css`.

## Verify

After swapping, `document.fonts.check('16px Outfit')` should be `true` and mana pills must show real
glyphs (a `.ms-w` element ends up `font-family: Mana`).

> The binaries are **not** committed here — they're licensed assets (Outfit & JetBrains Mono are
> OFL; mana-font/keyrune are MIT/OFL). Pull them with the commands above.
