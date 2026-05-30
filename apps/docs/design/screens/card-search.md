# Card Search

_Spec: `apps/docs/specs/card-search.md`_

> **Convention mana :** `{W}{U}{B}{R}{G}` = icônes SVG Keyrune (officielles MTG).

**Trois patterns de recherche selon le contexte :**

- **Header (popover)** — recherche globale rapide (cartes + decks + collection)
- **Page `/search`** — exploration avancée avec filtres complets
- **Deck builder (slide-over)** — ajout de cartes sans quitter le deck

---

## Popover — Recherche globale (depuis le header)

Se déclenche au clic sur la barre de recherche du header, depuis n'importe quelle page. Style :
overlay centré, fond semi-transparent, résultats groupés par type.

### Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│ ◈ Decksmith        ┌────────────────────────────────────┐   [J ▼]  │
│                    │ 🔍  Cultivate                   ✕  │          │
│  (page en arrière) └────────────────────────────────────┘          │
│          ┌─────────────────────────────────────────────┐           │
│          │  CARTES                                     │           │
│          │  Cultivate          {2}{G}  Rituel  0,40 €  │           │
│          │  Cultivate to Ashes {3}{W}  Éphémère        │           │
│          │  ───────────────────────────────────────    │           │
│          │  DECKS                                      │           │
│          │  Ramp Tribal    Commander  {G}              │           │
│          │  ───────────────────────────────────────    │           │
│          │  COLLECTION                                 │           │
│          │  Cultivate ×4   NM   IKO                   │           │
│          │  ───────────────────────────────────────    │           │
│          │  Voir tous les résultats de cartes →        │           │
│          └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile

```
┌─────────────────────────────────┐
│ [overlay plein écran]           │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🔍  Cultivate       ✕  │   │
│  └─────────────────────────┘   │
│                                 │
│  CARTES                         │
│  Cultivate  {2}{G}  0,40 €      │
│  Cultivate to Ashes  {3}{W}     │
│  ──────────────────────────     │
│  DECKS                          │
│  Ramp Tribal  Commander  {G}    │
│  ──────────────────────────     │
│  COLLECTION                     │
│  Cultivate ×4   NM   IKO        │
│  ──────────────────────────     │
│  Voir tous les résultats →      │
└─────────────────────────────────┘
```

---

## Page dédiée `/search` — Exploration avancée

### Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│ ◈ Decksmith            🔍 Rechercher...                      [J ▼]  │
├──────┬──────────────────────────────────────────────────────────────┤
│  ⊞   │  ┌────────────────────────────────────────────────────────┐  │
│      │  │ 🔍  Cultivate                                     ✕    │  │
│  🃏  │  └────────────────────────────────────────────────────────┘  │
│      │                                                              │
│  📦  │  ┌──────────────────┐  ┌─────────────────────────────────┐  │
│      │  │ FILTRES          │  │ 42 résultats pour "Cultivate"   │  │
│  🔍  │  │ ─────◈────────── │  │                                 │  │
│      │  │ Couleurs         │  │  ┌──────────┐  ┌──────────┐     │  │
│  ─   │  │ {W} {U} {B}      │  │  │ [carte]  │  │ [carte]  │     │  │
│  ⚙   │  │ {R} {G}          │  │  │ Cultivate│  │ Cultivate│     │  │
│      │  │ (actif = coloré, │  │  │ {2}{G}   │  │ {2}{G}   │     │  │
│      │  │  inactif = grisé)│  │  │ IKO 2020 │  │ M21 2020 │     │  │
│      │  │                  │  │  │  0,40 €  │  │  0,55 €  │     │  │
│      │  │ CMC              │  │  └──────────┘  └──────────┘     │  │
│      │  │ ──○──────── 7    │  │  ┌──────────┐  ┌──────────┐     │  │
│      │  │                  │  │  │ ...      │  │ ...      │     │  │
│      │  │ Rareté           │  │  └──────────┘  └──────────┘     │  │
│      │  │ C  U  R  M       │  │                                 │  │
│      │  │ ○  ○  ●  ○       │  │  [+ Charger plus]               │  │
│      │  │                  │  └─────────────────────────────────┘  │
│      │  │ Format légal     │                                       │
│      │  │ [Commander ▼]    │                                       │
│      │  │ [Réinitialiser]  │                                       │
│      │  └──────────────────┘                                       │
└──────┴──────────────────────────────────────────────────────────────┘
```

**Notes :**

- Icônes mana `{W}{U}{B}{R}{G}` dans les filtres : actif = coloré, inactif = grisé
- CMC = slider range
- Format légal = dropdown

### Mobile — Page `/search`

```
┌─────────────────────────────────┐
│ ◈ Decksmith              [🔍]  │
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │ 🔍  Cultivate       ✕  │   │
│  └─────────────────────────┘   │
│                                 │
│  [{W}] [{U}] [{B}] [{R}] [{G}] │
│  [CMC ▼]  [Rareté ▼]  [Filtres]│
│  ──────────────────────────     │
│  42 résultats                   │
│                                 │
│  ┌─────────┐  ┌─────────┐      │
│  │ [carte] │  │ [carte] │      │
│  │Cultivate│  │Cultivate│      │
│  │ {2}{G}  │  │ {2}{G}  │      │
│  │ IKO     │  │ M21     │      │
│  │ 0,40 €  │  │ 0,55 €  │      │
│  └─────────┘  └─────────┘      │
│                                 │
├─────────────────────────────────┤
│  ⊞     🃏     📦     🔍     ⚙  │
└─────────────────────────────────┘
```

**Notes mobile :**

- 2 colonnes
- Filtres couleurs en barre horizontale scrollable (icônes Keyrune cliquables)
- Filtres avancés → bottom sheet via `[Filtres]`

---

## Interactions clés

- **Popover header** : frappe → résultats instantanés groupés, `Échap` ou clic extérieur ferme
- **Page `/search`** : frappe → mise à jour des résultats, filtres en sidebar (desktop) / bottom
  sheet (mobile)
- Clic sur une carte → page détail `/cards/:oracle_id`
- `[+ Charger plus]` → pagination (scroll infini optionnel)
- Depuis le deck builder : le slide-over permet d'ajouter directement sans naviguer
