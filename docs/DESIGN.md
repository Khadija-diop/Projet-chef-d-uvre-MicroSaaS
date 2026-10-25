# DESIGN - Parcours DevOps Guide

## 1. Objectif

Definir la direction visuelle de la V1 et preparer les livrables Figma de l'etape C.

## 2. Principes de design

L'interface doit etre :

- claire pour un public debutant
- sobre pour rester credible face a un public technique
- structuree autour de la progression
- accessible et lisible sur desktop en priorite

## 3. Charte graphique

### Palette

| Token | Valeur | Usage |
| --- | --- | --- |
| `color-bg` | `#F8FAFC` | fond principal |
| `color-surface` | `#FFFFFF` | cartes et panneaux |
| `color-text` | `#0F172A` | texte principal |
| `color-text-muted` | `#475569` | texte secondaire |
| `color-primary` | `#2563EB` | actions principales |
| `color-primary-soft` | `#DBEAFE` | fonds d'accent |
| `color-success` | `#16A34A` | progression terminee |
| `color-warning` | `#F59E0B` | points d'attention |
| `color-border` | `#CBD5E1` | separateurs |

### Typographies

- texte interface : `Inter`, `Arial`, `sans-serif`
- texte technique ou labels : `JetBrains Mono`, `Consolas`, `monospace`

### Rayons et espacements

- `radius-sm` : `8px`
- `radius-md` : `12px`
- `space-1` : `4px`
- `space-2` : `8px`
- `space-3` : `12px`
- `space-4` : `16px`
- `space-5` : `24px`
- `space-6` : `32px`

### Composants UI principaux

- carte module
- badge de statut
- barre de progression
- bouton principal
- champ de formulaire
- navigation laterale ou topbar simple

## 4. Design tokens

### Tokens de texte

- `text-title`
- `text-body`
- `text-caption`
- `text-code`

### Tokens d'etat

- `status-todo`
- `status-in_progress`
- `status-done`
- `status-draft`
- `status-published`
- `status-hidden`

### Tokens d'ombre

- `shadow-sm` : ombre legere pour cartes
- `shadow-none` : par defaut sur zones de lecture

## 5. Contraintes RGAA 4.1

Les maquettes haute fidelite devront respecter au minimum :

- contraste suffisant entre texte et fond
- focus visible sur les elements interactifs
- navigation clavier logique
- information non portee uniquement par la couleur
- alternatives textuelles pour icones significatives
- zones cliquables suffisamment lisibles

## 6. Ecrans a produire dans Figma

### Parcours public

- page d'accueil
- page de connexion / inscription
- page liste des modules
- page detail d'un module
- page progression

### Parcours administration

- liste des modules
- formulaire creation / edition module
- liste des ressources d'un module (ajout / edition / suppression)

## 7. Prototype interactif cible

Le prototype Figma doit simuler ce parcours principal :

1. arriver sur la page d'accueil
2. se connecter
3. consulter la liste des modules
4. ouvrir le detail d'un module
5. marquer le module comme termine
6. voir la progression mise a jour

## 8. Livrables design attendus

- `docs/benchmark.md`
- `docs/moodboard.md`
- `docs/WIREFRAMES.md`
- maquettes haute fidelite sur Figma
- prototype interactif cliquable sur Figma

## 9. Liens Figma

Fichier Figma officiel du projet : <https://www.figma.com/design/OL1nUrNFEaoYM0AvW0JXll/Parcours-DevOps-Guide?node-id=0-1&t=UhNtkQxaIak8HDA2-1>.

Guide de portage utilise pour construire ce fichier (import plugin + spec manuelle ecran par ecran, valeurs de charte exactes) : `mes-guides/figma-build-spec.md`.

| Livrable | URL |
| --- | --- |
| Fichier Figma (maquettes + composants) | <https://www.figma.com/design/OL1nUrNFEaoYM0AvW0JXll/Parcours-DevOps-Guide?node-id=0-1&t=UhNtkQxaIak8HDA2-1> |
| Prototype interactif (mode Present / Prototype) | <https://www.figma.com/design/OL1nUrNFEaoYM0AvW0JXll/Parcours-DevOps-Guide?node-id=0-1&t=UhNtkQxaIak8HDA2-1> |

**Verification RGAA 4.1 avant rendu** : contraste des paires texte/fond sur les frames principales, ordre de tabulation teste sur la navigation et les formulaires, texte alternatif sur les icones decoratives ou informatives, etats de focus visibles sur les boutons et liens.

### Notes d'accessibilite du prototype Claude

Verifications deja faites sur `docs/prototype.html`, a reproduire a l'identique lors du portage Figma :

| Paire | Ratio | Verdict |
| --- | --- | --- |
| Texte `#0F172A` sur fond `#F8FAFC` / `#FFFFFF` | ~17:1 | AAA |
| Texte secondaire `#475569` sur fond `#F8FAFC` | ~7.2:1 | AAA |
| Texte blanc sur bouton primaire `#2563EB` | ~5.2:1 | AA |
| Texte `#0F172A` sur badge succes plein `#16A34A` | ~5.4:1 | AA |
| Texte `#0F172A` sur badge attention plein `#F59E0B` | ~8.3:1 | AAA |

Consequence retenue : le blanc sur `#16A34A` / `#F59E0B` pleins echoue en AA pour du texte (~3.3:1 et ~2.1:1). Tous les badges de statut (`todo`/`in_progress`/`done`, `draft`/`published`/`hidden`) utilisent donc un fond teinte clair (`success-soft` `#DCFCE7`, `warning-soft` `#FEF3C7`) avec du texte `#0F172A`, doublé d'une icone — jamais la couleur seule.

Navigation clavier : lien d'evitement en premier element tabulable, focus visible (contour 2px `color-primary`) sur tous les controles, focus deplace programmatiquement sur le titre `h1` a chaque changement d'ecran, mise a jour de la progression annoncee via une region `aria-live="polite"`.

## 10. Decision de design

La direction retenue privilegie :

- une lecture rapide
- des cartes simples
- une progression visible
- une interface sans surcharge decorative

Le produit doit ressembler davantage a un outil pedagogique moderne qu'a une plateforme marketing.