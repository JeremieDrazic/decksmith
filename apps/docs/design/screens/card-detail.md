# Card Detail

_Spec: `apps/docs/specs/card-details.md`_

> **Convention mana :** `{W}{U}{B}{R}{G}{C}{X}` = icônes SVG Keyrune (officielles MTG).

---

## Desktop

Layout 3 colonnes : image (gauche) | texte oracle (centre) | infos pratiques (droite).

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ◈ Decksmith  /  Cartes  /  Cultivate                                    │
├──────┬──────────────────────────┬──────────────────────────────────────┤
│      │                          │  CULTIVATE                            │
│  🔍  │  ┌────────────────────┐  │  {2}{G}  ·  Rituel                    │
│      │  │                    │  │  ─────◈──────────────────────         │
│      │  │   [artwork carte]  │  │  Cherchez dans votre bibliothèque     │
│      │  │                    │  │  jusqu'à deux terrains de base,       │
│      │  │                    │  │  mettez-en un sur le champ de         │
│      │  └────────────────────┘  │  bataille et l'autre dans votre       │
│      │                          │  main.                                │
│      │  [← Édition précédente→] │                                       │
│      │  IKO · Ikoria · #154     │  "The seeds of tomorrow..."           │
│      │  ◈ Rare    Illus. XXX    │                                       │
│      │                          │  ─────◈──────────────────────         │
│      │  [+ Ma collection]       │  LÉGALITÉS                            │
│      │  [+ Deck]                │  ✓ Commander  ✓ Modern    ✗ Standard  │
│      │  [♡ Wishlist]            │  ✓ Legacy     ✓ Vintage   ⚠ Pioneer   │
│      │  [↗ Partager]            │                                       │
│      │                          │  ─────◈──────────────────────         │
│      │                          │  PRIX  (IKO · Non-foil)               │
│      │                          │  Cardmarket    0,40 €                 │
│      │                          │  TCGplayer     $0.45                  │
│      │                          │                                       │
│      │                          │  [Historique des prix →]              │
│      │                          │  [Toutes les éditions →]              │
└──────┴──────────────────────────┴──────────────────────────────────────┘
```

**Notes :**

- `{2}{G}` = icônes SVG Keyrune dans le titre
- `✓` vert / `⚠` ambre / `✗` rouge pour les légalités
- `◈ Rare` = couleur de rareté (or pour Rare, orange pour Mythic...)
- `[← Édition précédente →]` = navigation entre les prints de la même carte
- Texte oracle avec **mots-clés en gras** (Vigilance, Hâte, etc.)
- Section "Ma collection" et "Mes decks" en dessous des prix (scroll)

---

## Mobile

```
┌─────────────────────────────────┐
│ ← Cartes                        │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │     [artwork carte]     │   │
│  │                         │   │
│  └─────────────────────────┘   │
│  [← IKO  ·  Édition  ·  M21 →] │
│                                 │
│  CULTIVATE                      │
│  {2}{G}  ·  Rituel              │
│  ─────◈──────────────────────   │
│  Cherchez dans votre            │
│  bibliothèque jusqu'à deux      │
│  terrains de base...            │
│                                 │
│  "The seeds of tomorrow..."     │
│                                 │
│  ─────◈──────────────────────   │
│  LÉGALITÉS                      │
│  ✓ Cdr  ✓ Mod  ✗ Std  ✓ Leg    │
│                                 │
│  ─────◈──────────────────────   │
│  PRIX  (IKO · Non-foil)         │
│  Cardmarket  0,40 €             │
│  TCGplayer   $0.45              │
│  [Historique →]  [Éditions →]   │
│                                 │
├─────────────────────────────────┤
│  [+ Collection] [+ Deck]  [♡]  │
└─────────────────────────────────┘
```

**Notes mobile :**

- Barre d'actions sticky en bas : `[+ Collection]` `[+ Deck]` `[♡]`
- Image en plein largeur (swipe gauche/droite pour changer d'édition)
- Légalités compressées (abréviations) avec tooltip au tap pour le nom complet
- Scroll vertical classique

---

## Interactions clés

- `[← Édition précédente →]` / swipe mobile → change l'édition affichée sans reload
- `[+ Ma collection]` → bottom sheet : choisir édition, quantité, condition, foil
- `[+ Deck]` → bottom sheet : choisir le deck et la section
- `[♡ Wishlist]` → ajout direct, confirmation toast
- `[Historique des prix →]` → section expandable avec graphique ligne (30j par défaut)
- `[Toutes les éditions →]` → grille de toutes les prints de la carte
- Raccourcis clavier desktop : `A` = ajouter deck, `C` = collection, `W` = wishlist, `Échap` =
  retour
