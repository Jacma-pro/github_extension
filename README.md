# GitHub Keyboard Navigation

Extension Chrome pour naviguer dans l'interface de GitHub au clavier (macOS).

## Règles pour les raccourcis

- Pas de conflit avec les raccourcis de Chrome ou de macOS.
- Éviter `Cmd` (presque tout est déjà pris par Chrome/macOS).
- Privilégier les séquences sans modificateur (`g` puis une lettre), comme le fait déjà GitHub.
- Les raccourcis sont désactivés quand on tape dans un champ texte.

## Raccourcis natifs de GitHub (pas besoin de l'extension)

Appuyer sur `?` sur n'importe quelle page GitHub pour voir la liste à jour.
S'ils ne marchent pas : **Settings → Accessibility → Keyboard shortcuts**.

### Recherche

| Raccourci | Action |
|---|---|
| `/` ou `s` | Focus sur la barre de recherche |
| `Cmd` + `K` | Ouvrir la palette de commandes |

### Onglets d'un repo

Séquences : appuyer sur `g`, relâcher, puis la lettre.

| Raccourci | Onglet |
|---|---|
| `g` `c` | Code |
| `g` `i` | Issues |
| `g` `p` | Pull requests |
| `g` `a` | Actions |
| `g` `w` | Wiki |
| `g` `g` | Discussions |
| ~~`g` `s`~~ | Security and quality — **remplacé par l'extension** (Settings) |

## Installation

1. Ouvrir `chrome://extensions`.
2. Activer le **Mode développeur** (en haut à droite).
3. **Charger l'extension non empaquetée** → sélectionner ce dossier.
4. Après une modif du code : cliquer sur ↻ sur la carte de l'extension, puis recharger l'onglet GitHub.

## Raccourcis de l'extension

| Raccourci | Action | Où |
|---|---|---|
| `g` `?` | Afficher les raccourcis disponibles sur la page actuelle (`Esc` pour fermer) | Partout sur GitHub |
| `g` `h` | Aller à l'accueil (dashboard) | Partout sur GitHub |
| `g` `u` | Mon profil | Partout (connecté) |
| `g` `m` | Mes repos | Partout (connecté) |
| `g` `l` | Mes pull requests | Partout sur GitHub |
| `g` `s` | Ouvrir les Settings du repo | N'importe quelle page d'un repo |
| `g` `b` | Branches | N'importe quelle page d'un repo |
| `g` `t` | Tags | N'importe quelle page d'un repo |
| `g` `r` | Releases | N'importe quelle page d'un repo |
| `g` `o` | Commits (branche par défaut) | N'importe quelle page d'un repo |
| `g` `y` | Insights | N'importe quelle page d'un repo |
| `g` `d` | Copier `git clone git@github.com:owner/repo.git` (SSH) | N'importe quelle page d'un repo |
| `-` | Remonter au dossier parent | En parcourant le code (`/tree/...` ou `/blob/...`) |

> `-` suppose que le nom de branche ne contient pas de `/` (une branche `feat/x` donnera une mauvaise URL).

### Dans une pull request

Actifs uniquement sur les pages `/owner/repo/pull/123/...`.

| Raccourci | Onglet |
|---|---|
| `p` `c` | Conversation |
| `p` `o` | Commits |
| `p` `k` | Checks |
| `p` `f` | Files changed |

### Dans les Settings d'un repo

Actifs uniquement sur les pages `/owner/repo/settings/...`. Sur ces pages, `s` seul ne met plus le focus sur la recherche (utiliser `/` à la place).

| Raccourci | Page |
|---|---|
| `s` `g` | General |
| `s` `c` | Collaborators |
| `s` `r` | Rulesets |
| `s` `b` | Branches |
| `s` `a` | Actions |
| `s` `w` | Webhooks |
| `s` `e` | Environments |
| `s` `p` | Pages |
| `s` `y` | Advanced Security |
| `s` `k` | Deploy keys |
| `s` `s` | Secrets (Actions) |
| `s` `v` | Variables (Actions) |
| `s` `i` | GitHub Apps |
| `s` `l` | Autolink references |

Pas encore couverts (URL incertaine) : Moderation, Tags, Copilot, Planning, Codespaces.

## Ce qui est galère (besoins)

| Besoin | Statut | Notes |
|---|---|---|
| Ouvrir la recherche sur la page principale | ✅ Natif | `/` ou `s`. Idée initiale `Cmd + F + R` abandonnée : conflit avec `Cmd + F` (recherche Chrome) et `Cmd + R` (reload). |
| Accéder à un onglet du repo sans faire plein de `Tab` | 🟡 Partiel en natif | Couvert par `g` + lettre en natif, le reste (Settings, Insights, Branches, Tags, Releases, Commits) par l'extension. |
| Passer d'un onglet à l'autre dans une PR | ✅ Extension | `p` + lettre. Pas de raccourci natif. |
| Remonter dans l'arborescence du code | ✅ Extension | `-`. |
| Copier la commande de clone | ✅ Extension | `g` `d`, en SSH. `y y` écarté : `y` est natif (permalien) dans le code. |
| Aller sur mon profil, mes repos, mes PR | ✅ Extension | `g` `u`, `g` `m`, `g` `l`. |
| Revenir à l'accueil | ✅ Extension | `g` `h`. Pas de raccourci natif. |
| Retrouver les raccourcis quand on les a oubliés | ✅ Extension | `g` `?`. Popup contextuel : n'affiche que les raccourcis utilisables sur la page actuelle. Le `?` natif reste celui de GitHub. |
| Naviguer entre les pages des Settings | ✅ Extension | `s` + lettre, seulement dans les Settings. |
| Accéder aux Settings d'un repo | ✅ Extension | `g` `s`. Pas de raccourci natif. Écrase volontairement le `g s` natif (Security and quality), jugé moins utile. |

## Idées

- **Security** si besoin, puisque `g s` est repris par l'extension. Lettres encore libres après `g` : `e j k q v x z`.
- **Hints à la Vimium** : une touche affiche une lettre sur chaque onglet ou lien cliquable, on tape la lettre pour cliquer. Plus générique, et peut s'étendre à toute la page. `f` est le choix classique mais il est pris dans les logs Actions.
