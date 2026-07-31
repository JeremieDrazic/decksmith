# Pitfalls — TypeScript

## Zod object keys must match the raw wire format exactly

When validating an external payload (e.g. Scryfall's `default_cards` dump), the keys in
`z.object({ ... })` must match the incoming JSON keys **byte for byte**. Scryfall ships snake_case
(`mana_cost`, `image_uris`, `art_crop`), so the schema keys must be snake_case too — the camelCase
conversion is normalization's job, not the boundary's.

The trap is silent: with `.optional()` fields, declaring a camelCase key (`manaCost`) does **not**
throw. Zod looks for `manaCost`, doesn't find it, sets it to `undefined` (optional → passes), and
**strips** the real `mana_cost` as an unknown key. Every record then passes the validator with all
fields `undefined` — the exact bug Zod is supposed to catch. Rule: the input schema mirrors the
provider's format as-is; translate to our vocabulary downstream. (Caught in Phase 3.1,
`packages/scryfall`.)
