# Deck Builder

_Spec: `apps/docs/specs/deck-management.md`_

> **Convention mana :** `{W}{U}{B}{R}{G}{C}{X}` = icônes SVG Keyrune (officielles MTG).

---

## Desktop

Layout 3 colonnes : sections (gauche) | liste de cartes (centre) | statistiques (droite).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ◈ Decksmith  /  Mes decks  /  Ur-Dragon         [✓ Sauvegardé]  [Partager] │
├──────┬──────────────────┬────────────────────────────┬──────────────────────┤
│      │  SECTIONS        │  🔍 Ajouter des cartes...  │  STATISTIQUES        │
│  🃏  │  ─────◈──────    │                            │  ─────◈──────        │
│      │                  │  ─────◈── Créatures ──◈──  │  Courbe de mana      │
│      │  ◈ Command Zone  │                            │  ░                   │
│      │    1 carte       │  ┌──────────────────────┐  │  ░░                  │
│      │                  │  │[art] The Ur-Dragon   │  │  ░░░░                │
│      │  ◈ Créatures     │  │      {W}{U}{B}{R}{G} │  │  ░░░░░              │
│      │    38 cartes     │  │      Légendaire  ×1  │  │  ░░░░░░░            │
│      │                  │  │      ✓ Possédé       │  │  1  2  3  4  5  6+  │
│      │  ◈ Rituels       │  └──────────────────────┘  │                     │
│      │    12 cartes     │  ┌──────────────────────┐  │  Distribution        │
│      │                  │  │[art] Cultivate       │  │  {G} Vert    42%     │
│      │  ◈ Terrains      │  │      {2}{G}          │  │  {R} Rouge   18%     │
│      │    36 cartes     │  │      Rituel     ×1   │  │  {U} Bleu    16%     │
│      │                  │  │      ✓ Possédé       │  │  {W} Blanc   14%     │
│      │  ◈ Maybeboard    │  └──────────────────────┘  │  {B} Noir    10%     │
│      │    5 cartes      │  ┌──────────────────────┐  │                     │
│      │                  │  │[art] ...             │  │  ─────◈──────       │
│      │  [+ Section]     │  └──────────────────────┘  │  Coût total         │
│      │                  │                            │  ◈ 142,50 €         │
│      │                  │  ← scroll infini →         │                     │
└──────┴──────────────────┴────────────────────────────┴──────────────────────┘
```

**Notes :**

- `{2}{G}` = icônes SVG Keyrune colorées — pas du texte brut
- `✓ Possédé` vert / `⚠ Partiel` ambre / `✗ Proxy` rouge
- La courbe de mana utilise les couleurs de la distribution MTG (pas une couleur générique)
- Le panneau stats et le panneau sections sont fixés, seule la liste de cartes scrolle
- `─────◈─────` = séparateur de section

---

## Mobile

3 onglets (swipe ou tabs) — sections, cartes, stats ne peuvent pas tenir ensemble sur mobile.

```
┌─────────────────────────────────┐
│ ← Ur-Dragon          [Partager] │
│  [Sections]  [Cartes]  [Stats]  │
│  ──────────────────────────     │
│                                 │
│  (onglet Cartes actif)          │
│                                 │
│  ─────◈── Créatures (38) ──◈── │
│  ┌────┐  The Ur-Dragon          │
│  │art │  {W}{U}{B}{R}{G}        │
│  │    │  Légendaire  ×1         │
│  └────┘  ✓ Possédé              │
│  ──────────────────────────     │
│  ┌────┐  Cultivate              │
│  │art │  {2}{G}                 │
│  │    │  Rituel  ×1             │
│  └────┘  ✓ Possédé              │
│                                 │
│  [+ Ajouter une carte]          │
│                                 │
├─────────────────────────────────┤
│  ⊞     🃏     📦     🔍     ⚙  │
└─────────────────────────────────┘
```

**Onglet Sections :**

```
│  ◈ Command Zone     1 carte    │
│  ◈ Créatures       38 cartes   │
│  ◈ Rituels         12 cartes   │
│  ◈ Terrains        36 cartes   │
│  ◈ Maybeboard       5 cartes   │
│  [+ Ajouter une section]        │
```

**Onglet Stats :**

```
│  Courbe de mana                 │
│  [graphique barres]             │
│                                 │
│  Distribution des couleurs      │
│  {G} 42%  {R} 18%  {U} 16%     │
│                                 │
│  Coût total : ◈ 142,50 €       │
```

**Notes mobile :**

- Navigation par onglets (swipe ou tabs en haut)
- `[+ Ajouter une carte]` → barre de recherche plein écran
- Tap sur une carte → bottom sheet (modifier quantité, voir détails, supprimer)

---

## Interactions clés

- `🔍 Ajouter des cartes...` → barre inline (desktop) / plein écran (mobile)
- Clic sur une carte → modal de détail (quantité, print, coverage)
- Drag & drop entre sections (desktop uniquement)
- `[✓ Sauvegardé]` → sauvegarde auto, indicateur de statut
- `[Partager]` → génère un lien public `/decks/:id`
- `[+ Section]` → modal de création de section
