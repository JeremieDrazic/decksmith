# Deck List

_Spec: `apps/docs/specs/deck-management.md`_

> **Convention mana :** `{W}{U}{B}{R}{G}` = icônes SVG Keyrune (officielles MTG). Seules les
> couleurs présentes dans l'identité du deck apparaissent.

---

## Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│ ◈ Decksmith            🔍 Rechercher...                      [J ▼]  │
├──────┬──────────────────────────────────────────────────────────────┤
│  ⊞   │                                                              │
│      │  Mes decks                                   [+ Nouveau deck]│
│  🃏  │                                                              │
│      │  🔍 Filtrer mes decks...  [Format ▼]  [Couleur ▼]  [⊞] [☰] │
│  📦  │  ────────────────────────────────────────────────────────    │
│      │                                                              │
│  🔍  │  ┌──────────────────┐  ┌──────────────────┐  ┌───────────┐  │
│      │  │ ░░░░░░░░░░░░░░░░ │  │ ░░░░░░░░░░░░░░░░ │  │ ░░░░░░░░ │  │
│  ─   │  │  (art commandant)│  │  (art commandant)│  │   (art)  │  │
│  ⚙   │  │                  │  │                  │  │          │  │
│      │  │ Ur-Dragon     ≡  │  │ Yawgmoth      ≡  │  │ Kinnan   │  │
│      │  │ Commander        │  │ Commander        │  │ Cdr      │  │
│      │  │ {W}{U}{B}{R}{G}  │  │ {B}{G}           │  │ {G}{U}   │  │
│      │  │ 100 cartes       │  │ 100 cartes       │  │ 98 cartes│  │
│      │  │ ✓ 87% possédé    │  │ ⚠ 72% possédé    │  │ ✓ 95%   │  │
│      │  │ 142 €            │  │ 89 €             │  │ 210 €   │  │
│      │  └──────────────────┘  └──────────────────┘  └───────────┘  │
│      │                                                              │
│      │  ┌──────────────────┐  ...                                  │
└──────┴──────────────────────────────────────────────────────────────┘
```

**Notes :**

- Artwork de la commandante en fond de chaque deck card (flou + overlay dégradé sombre)
- `{W}{U}{B}{R}{G}` = icônes SVG Keyrune, uniquement les couleurs de l'identité du deck
- `✓` vert = taux de possession ≥ 80%, `⚠` ambre = < 80%
- `≡` = menu contextuel au hover : Renommer, Dupliquer, Supprimer
- `[⊞] [☰]` = bascule grille / liste
- Le filtre local `🔍 Filtrer mes decks...` est distinct de la barre de recherche globale du header
- Icône active dans la sidebar colorée en amber

---

## Mobile

Un deck par ligne — art à gauche, infos à droite. Plus lisible qu'une grille 2 colonnes vu la
densité d'infos (nom, format, mana, coverage, prix).

```
┌─────────────────────────────────┐
│ ◈ Decksmith              [🔍]  │
├─────────────────────────────────┤
│  Mes decks       [+ Nouveau]    │
│  🔍 Filtrer...  [Format ▼] [☰] │
│  ──────────────────────────     │
│                                 │
│  ┌──────┐  Ur-Dragon        ≡  │
│  │(art) │  Commander            │
│  │      │  {W}{U}{B}{R}{G}      │
│  │      │  100 cartes           │
│  └──────┘  ✓ 87%  ·  142 €      │
│  ──────────────────────────     │
│  ┌──────┐  Yawgmoth         ≡  │
│  │(art) │  Commander            │
│  │      │  {B}{G}               │
│  │      │  100 cartes           │
│  └──────┘  ⚠ 72%  ·  89 €       │
│  ──────────────────────────     │
│  ┌──────┐  Kinnan           ≡  │
│  │(art) │  Commander            │
│  │      │  {G}{U}               │
│  │      │  98 cartes            │
│  └──────┘  ✓ 95%  ·  210 €      │
│                                 │
├─────────────────────────────────┤
│  ⊞     🃏     📦     🔍     ⚙  │
└─────────────────────────────────┘
```

**Notes mobile :**

- 1 deck par ligne (pas de grille 2 colonnes)
- Art thumbnail ~56px carré, arrondi
- `[🔍]` header → overlay plein écran (recherche globale)
- Filtres → bottom sheet
- Tap long → menu contextuel (Renommer, Dupliquer, Supprimer)

---

## Vue liste desktop (alternative à la grille)

```
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ [art]  Ur-Dragon    Commander  {W}{U}{B}{R}{G}  ✓ 87%  142€  ≡│ │
│  │ [art]  Yawgmoth     Commander  {B}{G}           ⚠ 72%   89€  ≡│ │
│  │ [art]  Kinnan       Commander  {G}{U}           ✓ 95%  210€  ≡│ │
│  └────────────────────────────────────────────────────────────────┘ │
```

---

## Interactions clés

- Clic / tap sur un deck → `/decks/:id` (deck builder)
- `[+ Nouveau deck]` → modal : nom + format
- `[⊞] [☰]` desktop → bascule grille/liste, persisté en `localStorage`
- Filtres format/couleur → filtre instantané côté client
- `≡` hover (desktop) / tap long (mobile) → menu contextuel
