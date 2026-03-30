# Settings / Préférences utilisateur

_Spec: `apps/docs/specs/user-preferences.md`_

---

## Desktop

Layout 2 colonnes : nav secondaire (gauche) | contenu de la catégorie (droite).

```
┌─────────────────────────────────────────────────────────────────────┐
│ ◈ Decksmith            🔍 Rechercher...                      [J ▼]  │
├──────┬──────────────────────────────────────────────────────────────┤
│  ⊞   │                                                              │
│      │  Paramètres                                                  │
│  🃏  │                                                              │
│  📦  │  ┌──────────────────┐  ┌───────────────────────────────┐    │
│      │  │ Langue & Région  │  │  Langue & Région               │    │
│  🔍  │  │ Cartes           │  │  ─────◈───────────────────     │    │
│      │  │ Affichage        │  │                               │    │
│  ─   │  │ Notifications    │  │  Langue de l'interface         │    │
│  ⚙   │  │ Compte           │  │  [● Français]  [○ English]    │    │
│      │  └──────────────────┘  │                               │    │
│      │  (catégorie active     │  Devise                        │    │
│      │   = amber + fond       │  [● EUR €]  [○ USD $]          │    │
│      │   subtil)              │                               │    │
│      │                        │  Unités de mesure              │    │
│      │                        │  [● Métrique (mm)]             │    │
│      │                        │  [○ Impérial (pouces)]         │    │
│      │                        └───────────────────────────────┘    │
└──────┴──────────────────────────────────────────────────────────────┘
```

**Contenu de chaque catégorie :**

**Cartes**

```
│  Édition par défaut                                                 │
│  [● La plus récente]  [○ La moins chère]  [○ Originale]            │
│                                                                     │
│  Langue des cartes                                                  │
│  [● Français]  [○ Anglais]                                         │
```

**Affichage**

```
│  Thème                                                              │
│  [○ Clair]  [● Sombre]  [○ Système]                                │
```

**Notifications**

```
│  PDF généré              [● activé]                                │
│  Nouveautés Decksmith    [○ désactivé]                             │
```

**Compte**

```
│  jeremy@example.com                                                 │
│  [Changer le mot de passe →]                                        │
│  [Supprimer mon compte]  ← bouton destructive (rouge)              │
```

**Notes :**

- Catégorie active = texte amber + fond `accent-subtle`
- Sauvegarde automatique à chaque changement (pas de bouton "Enregistrer")
- Le toggle thème applique le changement instantanément (CSS vars sur `<html>`)
- "Supprimer mon compte" = dialog de confirmation avec saisie du texte "SUPPRIMER"

---

## Mobile

Liste de catégories → tap → sous-page dédiée (navigation en avant/arrière).

```
┌─────────────────────────────────┐
│ ← Decksmith                     │
│  Paramètres                     │
│  ──────────────────────────     │
│                                 │
│  ┌──────────────────────────┐  │
│  │  Langue & Région      →  │  │
│  │  Cartes               →  │  │
│  │  Affichage            →  │  │
│  │  Notifications        →  │  │
│  │  Compte               →  │  │
│  └──────────────────────────┘  │
│                                 │
├─────────────────────────────────┤
│  ⊞     🃏     📦     🔍     ⚙  │
└─────────────────────────────────┘
```

**Sous-page mobile (ex: Langue & Région) :**

```
┌─────────────────────────────────┐
│ ← Paramètres                    │
│  Langue & Région                │
│  ──────────────────────────     │
│                                 │
│  Langue de l'interface          │
│  ┌──────────────────────────┐  │
│  │  Français          ✓     │  │
│  │  English                 │  │
│  └──────────────────────────┘  │
│                                 │
│  Devise                         │
│  ┌──────────────────────────┐  │
│  │  EUR €             ✓     │  │
│  │  USD $                   │  │
│  └──────────────────────────┘  │
│                                 │
├─────────────────────────────────┤
│  ⊞     🃏     📦     🔍     ⚙  │
└─────────────────────────────────┘
```

**Notes mobile :**

- Pattern "drill-down" classique (iOS Settings style)
- Sauvegarde immédiate au tap, pas de bouton "Confirmer"
- `✓` = option actuellement sélectionnée

---

## Interactions clés

- Desktop : clic sur une catégorie → affichage du contenu sans navigation
- Mobile : tap sur une catégorie → nouvelle sous-page (breadcrumb `← Paramètres`)
- Toutes les options → sauvegarde immédiate, toast discret
- Toggle thème → appliqué instantanément
- Supprimer mon compte → dialog de confirmation avec saisie "SUPPRIMER"
