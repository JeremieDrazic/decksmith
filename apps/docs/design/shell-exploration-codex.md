# Shell validé — transmission à Claude

**Date : 13 novembre 2026. Statut : direction validée explicitement par Jérémie.**

La référence retenue est **Atelier sans feuille**, option par défaut sur
http://localhost:3101/shell-preview (`variant = 'atelier-open'`, `data-variant="atelier"`,
`data-sheet="none"`). Ce document décrit le résultat final et remplace les décisions intermédiaires
de l’exploration.

## Ce qui est validé

### Structure et apparence

- Fond continu, sans panneau de travail distinct : pas de feuille, de bordure extérieure, d’ombre ou
  d’arrondis encadrant le contenu.
- Fond `bg` : violet le plus foncé en sombre (`#0f0e17`). Conserver les tokens existants et leur
  adaptation au thème clair ; ne pas imposer le thème sombre à toute l’application.
- Rail à gauche, barre du haut indépendante, contenu directement sur le fond de l’application.
- Aucun padding sur le cadre extérieur de l’aperçu.
- Contenu desktop : **8 px en haut et sur les côtés**, 32 px en bas. Même retrait horizontal en
  focus. Le rail possède déjà ses espacements internes : éviter de cumuler de grandes marges.
- Pas de titre de page dans la top bar : le titre figure uniquement dans le contenu.

### Desktop, à partir de 768 px

| Élément                   | Choix retenu                                              |
| ------------------------- | --------------------------------------------------------- |
| Rail déployé              | 204 px de large, icônes et libellés                       |
| Rail réduit               | 68 px de large, icônes seules avec noms accessibles       |
| Top bar                   | **68 px de haut dans tous les états**                     |
| Zone du logo dans le rail | 68 px de haut ; logo centré verticalement avec la top bar |
| Défilement                | **Scroll du document**, pas de scroll interne au contenu  |
| Barre et rail             | Sticky, ancrés en haut à 0                                |

La hauteur de 204 px de la top bar a été essayée puis **abandonnée**. Déployer le rail ne doit
jamais déplacer verticalement le contenu.

### Mode focus

- Bouton œil immédiatement avant l’avatar, dans la top bar desktop.
- Il masque complètement le rail ; un second clic le réaffiche **dans son état précédent**, réduit
  ou déployé.
- Réduire/déployer reste une commande distincte dans le rail.
- La barre, la recherche et le compte restent accessibles en focus ; la hauteur reste de 68 px.
- Même fond continu `bg`, sans nouvel aplat violet clair. Marges symétriques.
- Bouton `aria-pressed`, nom accessible « Mode focus », infobulle Activer/Quitter ; œil barré
  lorsque le mode est actif.
- Cadre visible de 32 × 32 px, icône de 18 px à trait fin, cible réelle de 44 × 44 px. Fond
  transparent ; sélection par l’icône et la bordure, pas par un gros aplat.
- Le reducer conserve séparément `folded` et `hidden`. La mémorisation de la largeur pendant le
  masquage est validée. **Aucune nouvelle persistance du focus entre sessions n’est spécifiée.**

### Mobile

- Une seule ligne de top bar, hauteur minimale de 56 px hors éventuel effet des safe areas : logo à
  gauche, recherche et avatar à droite. Pas de titre de page ni de commande focus desktop.
- Recherche refermée par défaut : la loupe ouvre le champ dans la même ligne. Le champ reçoit le
  focus ; fermer ou Échap rétablit la barre compacte et le focus sur la loupe.
- Une recherche saisie est conservée à la fermeture ; indicateur discret sur la loupe si un filtre
  reste actif. Champ à 16 px pour limiter le zoom à la saisie sur iOS.
- Top bar sticky ; navigation principale fixe en bas, au-dessus de la safe area.
- **Navigation mobile sur le même fond `bg` que le rail desktop**, sans ombre lourde. Entrée active
  sur `surface`, texte `text`, comme le rail desktop.
- Défilement natif du document. Minimum de page `100svh`, aucune hauteur mobile verrouillée.
- Conserver les safe areas haut/gauche/droite et la réserve de contenu sous la navigation basse. Les
  dimensions bornées qui doivent suivre le viewport utilisent `dvh`, pas `vh`.
- Vérifier sur Safari iOS et Chrome Android réels : clavier virtuel, portrait/paysage et barres
  navigateur visibles/masquées. `dvh` seul ne garantit pas la gestion de tous les claviers virtuels.

### Deux ajustements de contenu acceptés, sans en faire une spécification de dashboard

- Réduire l’empilement avant les decks : reprise du dernier deck, compteur et commandes de vue sur
  une ligne desktop, deux lignes compactes en mobile.
- Galerie/liste avec le même traitement fin et bordé que l’œil : contour 32 px, cible 44 px, icônes
  18 px, sans aplat lourd.

**La validation porte avant tout sur les bases de navigation.** Les 24 decks, noms, statistiques,
illustrations et actions de démonstration ne définissent pas le produit ni les données réelles.

## État de l’implémentation

La direction est implémentée dans **l’aperçu**, pas encore intégrée au shell authentifié réel.

Fichiers de référence :

- `apps/web/src/components/shell-preview/ShellPreview.tsx` : composition, variantes, recherche
  mobile, focus et contenu de démonstration.
- `apps/web/src/components/shell-preview/atelier.css` : ajustements finaux. Attention à la cascade :
  les règles ajoutées en bas remplacent certains essais antérieurs.
- `apps/web/src/components/shell-preview/shell-preview.css` : base et anciennes pistes.
- `apps/web/src/components/shell-preview/preview-navigation.ts` et `.test.ts` : état du rail/focus.
- `apps/web/src/components/shell-preview/ShellPreview.test.tsx` : tests du focus de recherche
  mobile.
- `apps/web/src/components/shell-preview/AtelierDecks.tsx` : support de démonstration.
- `apps/web/src/routes/shell-preview.tsx` : route de revue, inaccessible en production via
  `notFound()` ; les assets sont néanmoins encore inclus dans le build.
- `apps/web/public/shell-preview/` : images locales de démonstration et `credits.json` Scryfall.

Seule adaptation du vrai `AppShell.tsx` réalisée pour cette exploration : prop facultative
`children` pour injecter le contenu de comparaison ; par défaut il utilise toujours `Outlet`.
`routeTree.gen.ts` est régénéré automatiquement par TanStack Router.

Aucun paquet ajouté. Aucun changement de backend, d’authentification ou de données utilisateur.

## Intégration à faire par Claude

1. Partir des vrais composants `AppShell`, `Rail`, `RailEntry`, `RailFold`, `TopBar`, `BottomNav` et
   `AccountMenu`, et y transposer uniquement la direction retenue.
2. Conserver les mécanismes existants : cookies SSR de thème/langue/rail, absence de flash à
   l’hydratation, menu compte réel, tooltips, lien d’évitement et navigation clavier.
3. Porter les trois états du rail sans remettre sa largeur et sa visibilité dans un seul booléen. Le
   mode focus ne doit pas oublier la préférence réduit/déployé.
4. Conserver seulement les destinations réellement disponibles. Les boutons Mes decks/Collection du
   prototype sont des vues locales de démonstration, pas de vraies routes à copier.
5. Extraire des styles propres et des primitives réutilisables ; ne pas recopier toute la cascade
   expérimentale ni garder les sélecteurs `preview-*` dans le shell produit. Respecter tokens,
   primitives typographiques, i18n et règles du design system existant.
6. Enlever le décalage de **62 px** dans la hauteur du rail lors du portage : il correspond à la
   bande de comparaison du prototype, qui ne fait pas partie du produit. Calculer le layout réel
   avec ses vrais conteneurs ; garder le scroll du document et le comportement sticky.
7. Valider les changements au clavier, au zoom, au scroll et aux breakpoints. Vérifier notamment les
   menus/dialogues avec le sticky et les safe areas sur appareil mobile.
8. Après intégration, retirer le comparateur et les anciennes pistes selon le besoin. Les données
   fictives et assets de démonstration ne doivent pas remplacer les écrans métier.

## Vérifications et limites

- Dernière passe complète avant les derniers ajustements CSS de dimensions/espacement : TypeScript,
  Oxlint, **29 tests web** et build production réussis.
- Les derniers réglages CSS ont été formatés, sans ajout de tests de présentation artificiels.
- La direction visuelle est validée **par Jérémie, à partir de son navigateur et de ses captures**.
  L’agent n’a pas pu effectuer sa propre revue visuelle locale : Chrome répondait, mais l’accès au
  site localhost restait refusé par une permission enregistrée. Les tests jsdom ne remplacent pas
  une vérification de layout, de sticky ou de clavier mobile réel.
- Avertissements déjà observés au build : deux faux candidats Tailwind issus de commentaires dans
  `packages/web-ui/src/lib/floating/animations.ts` et `ui/Drawer/animations.ts`, et directives
  `use client` dans les dépendances.

## Préserver le travail existant et pouvoir revenir en arrière

Le workspace contenait déjà de nombreuses modifications de Claude, dont des composants de shell non
suivis par Git. **Ne pas utiliser de reset/clean/restore global.** Le statut Git ne permet pas
d’attribuer toutes les modifications de la session à cette exploration.

Copie exacte des fichiers préexistants concernés et manifeste limité à cette exploration :
`/private/tmp/decksmith-shell-before-20261113/`.

```sh
# Vérification seule, sans modification
python3 /private/tmp/decksmith-shell-before-20261113/revert.py

# Retour à l’état précédant toute l’exploration, seulement si demandé
python3 /private/tmp/decksmith-shell-before-20261113/revert.py --apply
```

Le script refuse de remplacer un fichier modifié après les empreintes enregistrées. Arrêter Vite
avant une restauration pour éviter une régénération concurrente des routes. Ces sauvegardes sont
locales et temporaires. Elles ne constituent pas une version Git partagée.
