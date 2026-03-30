# Auth — Login / Register / Reset Password

_Spec: `apps/docs/specs/user-auth.md`_

---

## Login

### Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                                                                      │
│                       ◈  DECKSMITH                                   │
│                  Gérez vos decks MTG                                 │
│                                                                      │
│             ┌─────────────────────────────────────┐                 │
│             │                                     │                 │
│             │  Se connecter                       │                 │
│             │  ─────────────────────────────────  │                 │
│             │                                     │                 │
│             │  [G]  Continuer avec Google          │                 │
│             │  [⬡]  Continuer avec GitHub          │                 │
│             │                                     │                 │
│             │  ──────────── ou ────────────       │                 │
│             │                                     │                 │
│             │  Email                              │                 │
│             │  [________________________________] │                 │
│             │                                     │                 │
│             │  Mot de passe                       │                 │
│             │  [________________________________] │                 │
│             │                            [Oublié?]│                 │
│             │                                     │                 │
│             │  [       Se connecter       ]       │                 │
│             │                                     │                 │
│             │  Pas encore de compte ?             │                 │
│             │  Créer un compte →                  │                 │
│             │                                     │                 │
│             └─────────────────────────────────────┘                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Notes :**

- Fond = `bg` (`#0f0e17`) avec grain CSS subtil
- Card centrée, ombre subtile, surface `#1c1b2e`
- `[Se connecter]` = bouton amber plein (CTA primaire)
- OAuth buttons = style outline, pas filled
- Pas de sidebar, pas de top bar — page entièrement dédiée

---

### Mobile

```
┌─────────────────────────────────┐
│                                 │
│         ◈  DECKSMITH            │
│      Gérez vos decks MTG        │
│                                 │
│  [G]  Continuer avec Google     │
│  [⬡]  Continuer avec GitHub     │
│                                 │
│  ─────────── ou ─────────────   │
│                                 │
│  Email                          │
│  [___________________________]  │
│                                 │
│  Mot de passe                   │
│  [___________________________]  │
│                        [Oublié?]│
│                                 │
│  [      Se connecter      ]     │
│                                 │
│  Pas encore de compte ?         │
│  Créer un compte →              │
│                                 │
└─────────────────────────────────┘
```

**Notes mobile :**

- Pas de card conteneur — formulaire plein écran avec padding
- Police 16px minimum sur les inputs pour éviter le zoom iOS
- Bouton plein largeur
- Pas de bottom nav sur les pages auth (non connecté)

---

## Register

### Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                       ◈  DECKSMITH                                   │
│                                                                      │
│             ┌─────────────────────────────────────┐                 │
│             │                                     │                 │
│             │  Créer un compte                    │                 │
│             │  ─────────────────────────────────  │                 │
│             │                                     │                 │
│             │  [G]  Continuer avec Google          │                 │
│             │  [⬡]  Continuer avec GitHub          │                 │
│             │                                     │                 │
│             │  ──────────── ou ────────────       │                 │
│             │                                     │                 │
│             │  Email                              │                 │
│             │  [________________________________] │                 │
│             │                                     │                 │
│             │  Mot de passe                       │                 │
│             │  [________________________________] │                 │
│             │  ✓ 8 caractères minimum             │                 │
│             │                                     │                 │
│             │  [       Créer mon compte    ]      │                 │
│             │                                     │                 │
│             │  Déjà un compte ? Se connecter →    │                 │
│             │                                     │                 │
│             └─────────────────────────────────────┘                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Notes :**

- Username optionnel à l'inscription — complété lors de l'onboarding post-inscription
- Validation inline (pas de submit pour voir les erreurs)
- Hints de validation visibles au focus

---

### Mobile

```
┌─────────────────────────────────┐
│                                 │
│         ◈  DECKSMITH            │
│                                 │
│  [G]  Continuer avec Google     │
│  [⬡]  Continuer avec GitHub     │
│  ─────────── ou ─────────────   │
│                                 │
│  Email                          │
│  [___________________________]  │
│                                 │
│  Mot de passe                   │
│  [___________________________]  │
│  ✓ 8 caractères minimum         │
│                                 │
│  [    Créer mon compte     ]    │
│                                 │
│  Déjà un compte ?               │
│  Se connecter →                 │
│                                 │
└─────────────────────────────────┘
```

---

## Reset Password

### Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                       ◈  DECKSMITH                                   │
│                                                                      │
│             ┌─────────────────────────────────────┐                 │
│             │                                     │                 │
│             │  Mot de passe oublié                │                 │
│             │  ─────────────────────────────────  │                 │
│             │                                     │                 │
│             │  Entrez votre email pour recevoir   │                 │
│             │  un lien de réinitialisation.       │                 │
│             │                                     │                 │
│             │  Email                              │                 │
│             │  [________________________________] │                 │
│             │                                     │                 │
│             │  [   Envoyer le lien de reset   ]   │                 │
│             │                                     │                 │
│             │  ← Retour à la connexion            │                 │
│             │                                     │                 │
│             └─────────────────────────────────────┘                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**État post-envoi :**

```
│             │  ✓ Email envoyé !                   │
│             │                                     │
│             │  Vérifiez votre boîte mail.         │
│             │  Le lien expire dans 1 heure.       │
```

---

### Mobile

```
┌─────────────────────────────────┐
│                                 │
│         ◈  DECKSMITH            │
│                                 │
│  Mot de passe oublié            │
│  ─────────────────────────────  │
│                                 │
│  Email                          │
│  [___________________________]  │
│                                 │
│  [ Envoyer le lien de reset ]   │
│                                 │
│  ← Retour à la connexion        │
│                                 │
└─────────────────────────────────┘
```

---

## Interactions clés

- Soumission avec `Enter`, spinner dans le bouton pendant la requête
- Erreurs de formulaire : message inline sous le champ concerné (pas de toast)
- OAuth : redirect vers le provider, retour sur `/dashboard` en cas de succès
- Forgot password : succès → message de confirmation inline, pas de redirect
- Rate limiting : après 5 tentatives → "Trop de tentatives, réessayez dans X min"
