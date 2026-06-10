The signature Decksmith deck tile — commander artwork blurred under a dark gradient (MTG Arena
style), with format stamp, WUBRG color identity, card count, collection coverage, and price.

```jsx
<DeckCard
  name="The Ur-Dragon"
  commander="The Ur-Dragon"
  format="Commander"
  colors="wubrg"
  count={100}
  coverage={87}
  price="142 €"
  updated="2d ago"
/>
```

Pass `art` (a Scryfall image URL) for real commander artwork; otherwise a color-identity gradient
stands in. Use inside a responsive grid for the deck list / dashboard.
