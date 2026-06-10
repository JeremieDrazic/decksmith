A sequence of mana symbols rendered as canonical mana-font glyphs on WUBRG-tinted pills — never
colored circles or plain text.

```jsx
<ManaCost cost="{2}{U}{B}" />
<ManaCost cost={["3","w","u"]} size="lg" />
```

Accepts MTG notation (`"{2}{U}{B}"`) or an array. For a deck's color identity row use
`ColorIdentity` instead; for a single symbol use `Mana`.
