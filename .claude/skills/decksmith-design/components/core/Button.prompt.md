Primary action control — accent-filled by default, with secondary, ghost, and destructive variants
and three sizes.

```jsx
<Button onClick={save}>New deck</Button>
<Button variant="secondary" iconLeft={<PlusIcon/>}>Add</Button>
<Button variant="destructive">Delete deck</Button>
```

Variants: `primary` (accent), `secondary`, `ghost`, `destructive`. Sizes: `sm` / `md` / `lg`. Props:
`iconLeft`, `iconRight`, `fullWidth`, `disabled`. Hover lifts the accent + glow; press nudges down
1px.
