# Tooltips validées — transmission à Claude

**Date : 13 novembre 2026. Statut : Jérémie valide Accent plein affiné, sans flèche.**

Référence : http://localhost:3101/tooltip-preview, piste **Accent plein** (`tone = 'solid'`). Ce
document décrit le choix final ; les trois autres pistes restent des essais abandonnés.

## Direction retenue

Une petite étiquette de couleur pleine, sobre dans sa forme et immédiatement lisible. Elle ne doit
pas ressembler à un gros bouton : texte de poids normal, padding réduit et aucune ombre extérieure
marquée.

| Propriété        | Choix validé / référence dans l’aperçu                     |
| ---------------- | ---------------------------------------------------------- |
| Fond et bordure  | `accent`                                                   |
| Texte            | `on-accent`                                                |
| Thème sombre     | Fond doré, texte foncé                                     |
| Thème clair      | Fond violet, texte blanc                                   |
| Flèche           | **Absente**                                                |
| Police           | `font-body` / Outfit, pas de monospace                     |
| Corps            | 13 px dans l’aperçu                                        |
| Graisse          | 400, poids normal                                          |
| Interligne       | 1.4                                                        |
| Padding          | 6 px verticalement, 10 px horizontalement                  |
| Rayon            | `radius-interactive` existant                              |
| Largeur maximale | 260 px                                                     |
| Ombre            | `shadow-inset` uniquement ; aucune ombre portée extérieure |

L’aide secondaire éventuelle conserve `on-accent`, sans transparence : 12 px, poids 400, interligne
1.5, marge haute 5 px, largeur maximale 32 caractères typographiques (`32ch`).

**Ne pas utiliser `brand` ou `accent-text` comme texte sur ce fond.** `on-accent` fournit le
contraste adapté à chaque thème. Ne pas écrire les couleurs en dur ni modifier les tokens globaux
pour reproduire ce traitement.

## Position et interactions de référence

- Rail réduit : tooltip à droite de l’icône.
- Commandes de la top bar : en dessous.
- Écart de référence : **8 px** entre la commande et la tooltip.
- Pas de tooltip redondante sur les entrées du rail déployé dont le libellé est déjà visible.
- Texte court : nom de la commande ; une courte explication seulement lorsqu’elle aide à comprendre
  le comportement. Aucun faux raccourci, action ou lien dans la tooltip.
- Le provider de démonstration utilise un délai initial de 300 ms et une fermeture de 100 ms. Ce
  sont les valeurs essayées avec le rendu, pas une validation séparée d’un changement global de
  temporisation. Les primitives continuent de gérer le passage entre commandes.
- Conserver ouverture au survol et au focus, fermeture par Échap, positionnement avec détection des
  bords, portail et comportement de survol du popup de Base UI.
- Conserver les animations et le respect de `prefers-reduced-motion` existants.
- Les noms accessibles des boutons restent présents ; une tooltip ne remplace pas un libellé ou une
  information nécessaire sur tactile. Éviter le double affichage avec un attribut natif `title`.

L’absence de flèche est le choix normal pour les commandes du shell. Une aide dont l’ancrage serait
réellement ambigu pourrait justifier une exception, mais aucune exception n’est demandée ici.

## État du code

**Le style validé est encore isolé dans le comparateur. Le composant partagé n’a pas été modifié par
cette exploration.**

- `apps/web/src/components/tooltip-preview/TooltipExploration.tsx` : quatre spécimens, mini-shell
  interactif et comparaison au composant actuel. `solid` est sélectionné par défaut ;
  `showArrow={tone === 'arrow'}` désactive bien la flèche pour le choix retenu.
- `apps/web/src/components/tooltip-preview/tooltip-exploration.css` : styles de référence. Lire la
  base `.tooltip-experiment-popup` puis les surcharges `[data-tone='solid']` en fin de fichier.
- `apps/web/src/routes/tooltip-preview.tsx` : route de revue, `notFound()` en production. Les assets
  restent néanmoins inclus dans le build tant que la page est conservée.
- `apps/web/src/routeTree.gen.ts` : régénération automatique pour ajouter la route.

Aucun paquet ajouté. Aucun changement du shell validé, de l’authentification ou des données. Les
modifications déjà présentes dans `packages/tokens/src/web/colors.css` et
`packages/web-ui/src/ui/Tooltip/Tooltip.tsx` appartiennent aux autres travaux du workspace et ont
été préservées.

## Intégration à faire par Claude

1. Reporter ce traitement dans `packages/web-ui/src/ui/Tooltip/Tooltip.tsx` comme présentation
   commune, en conservant les primitives Base UI et l’API existante.
2. Remplacer le rendu actuel `bg-surface` / texte accentué / monospace / ombre portée par
   `bg-accent` / `text-on-accent` / police body normale / ombre inset.
3. Mettre `showArrow` à `false` par défaut et corriger sa documentation. Si l’option explicite
   `true` reste disponible, vérifier que sa couleur reste cohérente avec le nouveau popup ; ne pas
   recopier les sélecteurs privés de la flèche utilisés par l’essai « Flèche fine ».
4. Harmoniser `sideOffset` et sa documentation : l’aperçu utilise 8 px ; le composant actuel annonce
   8 px dans le JSDoc mais son paramètre par défaut vaut 10 px.
5. Respecter les tokens et les primitives du design system ; les dimensions et la typographie
   ci-dessus décrivent le rendu essayé, à porter proprement dans le composant partagé.
6. Adapter les stories Tooltip : clair/sombre, quatre positions, sans flèche par défaut, texte long,
   barre de commandes et cas explicite avec flèche si l’API est conservée.
7. Vérifier focus, Échap, maintien au survol, collision près des bords, affichage au-dessus du shell
   sticky et absence de régression des tooltips du rail réduit.
8. Retirer le comparateur et les pistes inutilisées une fois l’intégration validée. Ne pas porter
   ses textes français de démonstration dans le produit ; conserver l’i18n des vrais appelants.

## Vérifications et limites

- TypeScript et Oxlint ciblé réussis ; suite web actuelle : **33 tests réussis**, comprenant les
  tests déjà présents dans le workspace, pas 33 nouveaux tests de tooltips.
- Build production réussi après l’ajout d’Accent plein. Dernier affinage de poids, padding et ombre
  : CSS uniquement, formaté sans tests artificiels de présentation.
- Rendu final évalué et approuvé par Jérémie à partir de son navigateur et de sa capture. L’agent
  n’a pas réalisé de revue visuelle locale : l’accès à localhost avait été refusé par une permission
  de site enregistrée. Vérifier les interactions réelles lors du portage, notamment sur tactile ;
  les spécimens statiques ne les démontrent pas.

## Contrat de reprise : éviter les oublis

Cette section est normative pour le portage. Le but est de reproduire le résultat choisi, pas de
réinterpréter le design ni de recommencer une exploration. Vérifier **chaque ligne** de la grille
ci-dessous avant d’annoncer la fin de l’intégration.

### Trois catégories à ne pas mélanger

1. **Choix visuels validés** : Accent plein, doré/sombre et violet/clair, texte normal, petits
   espacements, sans flèche, sans ombre portée. Les chiffres précis sont ceux du tableau initial.
2. **Comportements existants à préserver** : Base UI, portail, collisions, focus/Escape, gestion du
   survol, liens du rail, toggle focus, i18n, thème runtime, API de composition.
3. **Réglages seulement essayés** : provider local 300/100 ms et vues de démonstration. Le choix de
   couleur n’autorise pas à modifier silencieusement tous les délais ou toute la navigation.

Pour cette intégration visuelle, **conserver les défauts actuels du provider produit : `delay=200`
et `closeDelay=0`**, ainsi que les overrides `delay={200}` déjà présents dans Rail et TopBar. Les
300/100 ms ne restent qu’une configuration du comparateur. Un changement de temporisation pourra
être traité séparément, sans bloquer le portage du style validé.

### Comparatif précis : composant actuel → cible

| Point                 | Actuel constaté dans `Tooltip.tsx` | Cible                                           |
| --------------------- | ---------------------------------- | ----------------------------------------------- |
| Fond                  | `bg-surface`                       | `bg-accent`                                     |
| Bordure               | `border-border`                    | 1 px, `border-accent`, même couleur que le fond |
| Texte                 | `text-accent-text`                 | `text-on-accent`                                |
| Police                | `font-mono`                        | `font-body`                                     |
| Corps                 | `text-sm`, fluide                  | 13 px pour reproduire la référence              |
| Graisse               | Peut dépendre de l’héritage        | 400 explicite sur le popup                      |
| Interligne            | Hérité de la classe de texte       | 1.4 explicite                                   |
| Padding horizontal    | `px-3`, soit 12 px                 | 10 px                                           |
| Padding vertical      | `py-1.5`, soit 6 px                | 6 px, à conserver                               |
| Maximum de largeur    | 280 px                             | 260 px                                          |
| Rayon                 | `rounded-interactive`              | Conserver, 8 px dans les tokens actuels         |
| Ombre                 | `shadow-popover`                   | Remplacer par inset uniquement                  |
| Flèche par défaut     | `showArrow=true`                   | `showArrow=false`                               |
| Distance par défaut   | Paramètre 10 px, JSDoc 8 px        | 8 px dans les deux                              |
| Côté par défaut       | `top`                              | Conserver `top`                                 |
| Alignement par défaut | `center`                           | Conserver `center`                              |
| Couche                | `z-tooltip`                        | Conserver, ne pas abaisser sous le sticky       |
| Animation             | `POPUP_ANIMATION`                  | Conserver, sans nouvelle animation décorative   |

Ne pas simplement **ajouter** les classes cibles à côté des classes actuelles : retirer/remplacer
les classes contradictoires. Sinon la cascade ou `tailwind-merge` peut laisser l’ancien fond,
l’ancienne ombre ou une typographie inattendue. Garder néanmoins `className` de l’appelant à la fin
du `cn(...)`, comme aujourd’hui, pour conserver la personnalisation de l’API.

### CSS de référence, recomposé après toutes les surcharges du prototype

Ce bloc décrit le **résultat calculé recherché** ; ce n’est pas une demande de créer une feuille CSS
globale ni d’importer les styles de l’aperçu dans `web-ui`.

```css
/* Popup partagé : rendu final d’Accent plein, pas la base des autres pistes. */
background: var(--accent);
border: 1px solid var(--accent);
color: var(--on-accent);
border-radius: var(--radius-interactive);
font-family: var(--font-body);
font-size: 13px;
font-weight: 400;
line-height: 1.4;
letter-spacing: normal;
padding: 6px 10px;
max-width: 260px;
box-shadow: var(--shadow-inset);
z-index: var(--z-tooltip);
```

Les 13 px sont la valeur essayée et approuvée. Ne pas remettre `text-sm` par automatisme : le
`text-sm` du projet est fluide et peut devenir plus grand. Encapsuler ce réglage au niveau du
composant partagé selon les conventions du design system ; ne pas parsemer les appelants de classes
typographiques correctrices.

L’ombre inset actuelle est très faible. **Ne pas lui additionner** `shadow-popover`, `shadow-card`,
`shadow-accent`, un `drop-shadow` ou un halo. Si le design system exige un rôle public d’ombre
propre aux tooltips, l’ajouter dans `packages/tokens` en conservant ce rendu exact ; ne pas modifier
la valeur globale de `shadow-popover`, qui affecterait d’autres composants.

### Thèmes : valeurs de contrôle, pas des couleurs à recopier

| Thème  | Fond `accent` actuel | Texte `on-accent` actuel |
| ------ | -------------------- | ------------------------ |
| Sombre | `#e8b84b`            | `#0f0e17`                |
| Clair  | `#5b4fcf`            | `#ffffff`                |

Ces valeurs servent à vérifier le résultat avec les tokens actuels. L’implémentation doit utiliser
les tokens, jamais des hex dans le composant. Le changement de thème via `.dark` doit fonctionner
sur la tooltip **portallée**, sans devoir rafraîchir la page. Ne pas inverser les textes : blanc sur
doré et violet foncé sur violet plein ne sont pas les traitements validés.

### Flèche : ne pas la remettre par les stories ou les appelants

- La piste retenue est sans flèche **dans les deux thèmes et dans toutes les positions**.
- Le défaut de `TooltipContent` devient `false` ; les commandes de navigation ne doivent pas
  repasser `showArrow={true}` pour retrouver l’ancien rendu.
- Conserver l’option explicite `showArrow` pour ne pas casser l’API, sauf décision de retrait
  séparée. Si `true` est demandé par un appelant existant, sa flèche doit suivre `accent` plutôt que
  garder l’ancien `surface` ; vérifier alors ses bords et offsets sur quatre côtés.
- Les classes `.tooltip-static-specimen[data-tone='arrow']` et les surcharges de `.absolute` dans
  l’aperçu appartiennent à une piste abandonnée : **ne pas les porter**.
- Les `meta.args` de `Tooltip.stories.tsx` contiennent actuellement `showArrow: true` : les passer à
  `false`, sinon le Playground ne montrera pas le choix validé malgré le changement du défaut.

### API, composition et accessibilité à conserver

Conserver les exports `Tooltip`, `TooltipProvider`, `TooltipTrigger`, `TooltipContent`, leurs types
et le barrel `packages/web-ui/src/ui/Tooltip/index.ts`.

Ne pas remplacer le composant par une tooltip CSS artisanale, un pseudo-élément ou un simple
`title`. Le popup doit rester dans `TooltipPrimitive.Portal` et être positionné par
`TooltipPrimitive.Positioner`. Conserver le forwarding des props, handlers et attributs `data-slot`.

Le contenu reste un `ReactNode` : les appelants peuvent fournir du texte, un span ou un groupe de
raccourcis. Ne pas transformer systématiquement `children` en chaîne, ni imposer une structure
label/description à tous les usages. L’aide secondaire du prototype est une **possibilité de
composition**, pas une nouvelle API obligatoire ni du texte à injecter partout.

Conserver la prop `render` du trigger : elle évite d’ajouter un bouton autour d’un vrai bouton ou
d’un lien. Aucun double élément interactif, aucun `preventDefault` ajouté aux liens du rail et aucun
handler global pour capturer Tab ou Échap. Laisser Base UI gérer les relations ARIA et les
identifiants des tooltips ; garder les `aria-label` utiles déjà présents sur les icônes.

Ne pas forcer la police body sur **tous les descendants** avec un sélecteur global : un composant
`Kbd` imbriqué peut légitimement avoir sa propre typographie. Vérifier son contraste dans le nouveau
fond, sans changer tous les `Kbd` du projet pour résoudre un seul exemple.

### Carte des fichiers à examiner, y compris les usages indirects

| Fichier                                                        | Ce qu’il faut faire / vérifier                                                                                                                  |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/web-ui/src/ui/Tooltip/Tooltip.tsx`                   | Portage du rendu, défauts de flèche et distance, JSDoc                                                                                          |
| `packages/web-ui/src/ui/Tooltip/index.ts`                      | Garder les exports et types existants                                                                                                           |
| `packages/web-ui/src/ui/Tooltip/Tooltip.stories.tsx`           | Args `showArrow=false`, `sideOffset=8`, cas de recette                                                                                          |
| `apps/web/src/components/shell/RailEntry.tsx`                  | `side="right"`, lien intact, nom accessible, tooltip seulement réduit                                                                           |
| `apps/web/src/components/shell/Rail.tsx`                       | Provider et délai 200 ms existants ; aucun changement de layout                                                                                 |
| `apps/web/src/components/shell/TopBar.tsx`                     | Tooltip de l’œil sous le bouton, libellé traduit Activer/Quitter, toggle intact                                                                 |
| `packages/web-ui/src/ui/NavigationButton/NavigationButton.tsx` | Tooltip intégrée aux boutons close/back/forward ; pas de régression dans les overlays                                                           |
| `packages/web-ui/src/ui/Kbd/Kbd.stories.tsx`                   | Story `InTooltip` : contenu composé toujours lisible                                                                                            |
| `packages/web-ui/src/ui/Popover/Popover.tsx`                   | Commentaire ancien affirmant que Tooltip est toujours sombre : corriger s’il est encore présent, pas de changement de rendu Popover             |
| `apps/docs/design/identity.md`                                 | Tableau historique attribuant `radius-surface` aux tooltips : aligner la doc sur le rayon interactif validé, sans changer les autres composants |

Les fichiers de shell ont évolué pendant les travaux de Claude. Relire leur état courant avant
d’éditer. **Leur layout déjà validé n’est pas à refaire pour intégrer les tooltips.** Le présent
topo est complémentaire de `apps/docs/design/shell-exploration-codex.md`, pas son remplacement.

### Recette manuelle obligatoire pour conclure le portage

Chaque ligne ci-dessous doit être vérifiée dans le **vrai shell ou Storybook**, pas seulement dans
les spécimens statiques du comparateur. Cocher ce qui a réellement été testé ; signaler le reste.

- [ ] Sombre : fond doré, texte foncé, 400, sans flèche, pas de halo.
- [ ] Clair : fond violet, texte blanc, 400, sans flèche, pas de halo.
- [ ] Corps 13 px, interligne 1.4, padding 6/10 px, largeur max 260 px et rayon 8 px conformes.
- [ ] Le passage clair/sombre actualise aussi les tooltips portallées.
- [ ] Survol d’une icône du rail réduit : libellé à droite, sans décaler le rail ni le contenu.
- [ ] Rail déployé : pas de tooltip redondante sur les entrées déjà libellées.
- [ ] Œil : tooltip en dessous, texte Activer/Quitter correct après changement de mode.
- [ ] Activer le focus masque toujours le rail ; sortir du focus restaure son format précédent.
- [ ] Top bar toujours à 68 px en desktop ; aucune réintroduction d’une feuille ou d’un scroll
      interne.
- [ ] Tab donne le focus au vrai bouton/lien et ouvre l’aide ; Échap la ferme sans déclencher
      l’action.
- [ ] Le lien de navigation fonctionne encore au clic et au clavier.
- [ ] On peut déplacer le pointeur vers la tooltip sans disparition empêchant sa lecture.
- [ ] Entrée proche du bas de l’écran et commande près du bord droit : pas de popup coupé/hors
      écran.
- [ ] Après défilement de la page : positionnement correct par rapport à la barre/au rail sticky.
- [ ] Aucun double affichage de tooltip native et de tooltip Base UI.
- [ ] Contenu long : retour à la ligne, texte complet, pas de débordement horizontal.
- [ ] `NavigationButton` dans un menu/popover/dialogue : pas de tooltip cachée par une mauvaise
      couche.
- [ ] Exemple `Kbd` dans une tooltip : police et contraste lisibles.
- [ ] `prefers-reduced-motion` : animation existante neutralisée comme avant.
- [ ] Mobile/tactile : boutons nommés et utilisables sans devoir obtenir une tooltip au survol.
- [ ] Zoom 200 % et largeur étroite : libellé et commande restent accessibles.

### Stories à produire ou mettre à jour

1. Défaut sans flèche, dans les deux thèmes ; **ne pas conserver un ancien défaut explicite à
   true**.
2. Quatre côtés, sans flèche, avec 8 px d’écart.
3. Rail réduit : plusieurs icônes proches, comportement entre tooltips et libellés longs.
4. Commande focus de top bar : état actif et inactif, texte d’action correct.
5. Aide courte et contenu multiligne, limite 260 px.
6. Texte avec `Kbd` et `NavigationButton` intégré à un overlay existant.
7. Cas avec flèche **explicitement activée**, seulement pour couvrir l’API conservée ; ne pas en
   faire la présentation par défaut.

### Commandes de vérification après implémentation

Les commandes suivantes correspondent aux scripts actuellement présents dans le monorepo. Les
adapter seulement si les scripts ont changé ; ne pas annoncer un succès sans exécution.

```sh
pnpm --filter @decksmith/web-ui typecheck
pnpm --filter @decksmith/web typecheck
pnpm --filter @decksmith/web-ui test
pnpm --filter @decksmith/web test
pnpm exec oxlint packages/web-ui/src/ui/Tooltip apps/web/src/components/shell
pnpm --filter @decksmith/storybook build
pnpm --filter @decksmith/web build
```

Vérifier le formatage des fichiers effectivement changés. Ajouter des tests de comportement là où
ils protègent une modification réelle, sans multiplier les snapshots qui ne prouveraient ni le
contraste ni le positionnement. Le build seul ne valide pas l’apparence.

### Nettoyage et compte rendu final attendu de Claude

Conserver le comparateur tant que la comparaison de l’intégration n’est pas terminée. Après
vérification, supprimer uniquement les fichiers exploratoires devenus inutiles, sans supprimer le
composant partagé ni les modifications antérieures du workspace. Laisser TanStack Router régénérer
`routeTree.gen.ts` ; ne pas le maintenir à la main.

Dans la réponse finale, lister : fichiers changés, valeurs finales effectivement portées,
comportements préservés, commandes réellement exécutées et recette visuelle réellement effectuée.
Mentionner explicitement tout point non vérifié. Fournir idéalement une capture clair et une capture
sombre du **composant intégré**, au survol ou au focus.

**Ne pas déclarer « terminé » uniquement parce que le violet et le doré sont présents : le poids, le
padding, l’absence de flèche, l’ombre, les défauts de props, les usages indirects et le comportement
du shell font partie de la livraison.**

## Retour arrière limité à cette exploration

Sauvegarde du route tree avant l’ajout et script avec contrôle des empreintes :
`/private/tmp/decksmith-tooltips-before-20261113/`.

```sh
# Vérifier sans modifier
python3 /private/tmp/decksmith-tooltips-before-20261113/revert.py

# Retirer uniquement cette exploration si demandé, après arrêt de Vite
python3 /private/tmp/decksmith-tooltips-before-20261113/revert.py --apply
```

Ce retour arrière conserve le shell et le travail de Claude. Il refuse de remplacer un fichier
modifié depuis les empreintes enregistrées. Ne pas utiliser de reset/clean global. Sauvegarde locale
temporaire, pas une version Git partagée.
