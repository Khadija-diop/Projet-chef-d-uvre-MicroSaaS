# Moodboard - Parcours DevOps Guide


## Mots-cles

- progression
- clarte
- confiance
- apprentissage structure
- interface technique accessible

## Univers visuel cible

Le produit doit evoquer :

- un tableau de bord moderne
- une plateforme d'apprentissage structurée
- une documentation technique lisible

## Couleurs dominantes

- bleu nuit pour la structure et la confiance
- bleu clair pour la progression et les interactions
- vert pour les statuts de completion
- gris neutres pour les surfaces et separations
- blanc casse pour garder une interface douce

## Typographies souhaitees

- une sans-serif tres lisible pour l'interface
- une monospace reservee aux extraits techniques et labels develops

## Composants visuels a privilegier

- cartes de modules
- badges de statut
- barre ou anneau de progression
- listes de ressources tres lisibles
- navigation simple par sections

## Ambiance generale

Le rendu vise un equilibre entre :

- produit tech
- pedagogie
- sobriete

L'interface doit etre plus proche d'un outil utile que d'une plateforme marketing demonstrative.

## A integrer dans Figma

Pour la version Figma, le moodboard devra reunir :

- 5 a 10 captures de references
- la palette de couleurs
- les choix de typographie
- des exemples de cartes, listes et tableaux de bord
- des inspirations d'icones simples et lineaires

---

## Étape A · Charte graphique

### Design tokens — Parcours DevOps Guide

Reprend la charte déjà posée dans le prototype (`docs/DESIGN.md`), formalisée en tokens et vérifiée RGAA 4.1 niveau AAA.

#### Couleurs

Un seul accent bleu, deux couleurs sémantiques (succès / attention), une échelle de neutres.

| Token | Valeur | Usage / contraste |
| --- | --- | --- |
| `color-primary` | `#2563EB` | Blanc sur fond : 5.2:1 (AA texte) |
| `color-primary-soft` | `#DBEAFE` | Fond de badge, texte `#0F172A` dessus |
| `color-text` | `#0F172A` | Sur fond `#F8FAFC` : ≈17:1 (AAA) |
| `color-text-muted` | `#475569` | Sur fond `#F8FAFC` : ≈7.2:1 (AAA) |
| `color-success` | `#16A34A` | Toujours sur fond `success-soft`, jamais texte blanc dessus |
| `color-success-soft` | `#DCFCE7` | Fond des badges de statut "terminé" |
| `color-warning` | `#F59E0B` | Texte `#0F172A` dessus : 8.3:1 (AAA) |
| `color-warning-soft` | `#FEF3C7` | Fond des badges de statut "attention" |
| `color-border` | `#CBD5E1` | Séparateurs, contours de champs et cartes |
| `color-neutral-soft` | `#F1F5F9` | Fond de survol, onglets inactifs |
| `color-bg` | `#F8FAFC` | Fond principal de l'application |
| `color-surface` | `#FFFFFF` | Cartes, panneaux, formulaires |

**Règle RGAA clé** : le blanc sur `success`/`warning` pleins échoue en AA pour du texte (≈3.3:1 et ≈2.1:1). Tous les badges de statut utilisent donc un fond `-soft` avec texte `#0F172A`, jamais la couleur seule pour porter l'information (icône ou libellé toujours présent).

#### Typographie

`Inter` pour l'interface, `JetBrains Mono` pour le code, les métadonnées et les statuts techniques.

| Style | Spécification | Exemple |
| --- | --- | --- |
| H1 | 34px / 700 | Apprends le DevOps |
| H2 | 22px / 600 | Vos modules |
| Corps | 16px / 400 | Un seul chemin, dans le bon ordre. |
| Label | 13px / 600 | Objectif pédagogique |
| Mono | 12px / 500 | `app.parcours-devops.guide` |

#### Espacements & rayons

Échelle en base 4px, deux rayons de coin.

| Token | Valeur |
| --- | --- |
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 24px |
| `space-6` | 32px |

- `radius-sm` : 8px
- `radius-md` : 12px
- `shadow` (carte élevée) : `0 1px 2px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.08)`

#### Composants clés

- carte de module
- badge de statut (`-soft` + icône, jamais couleur seule)
- barre de progression
- bouton principal / secondaire / ghost
- champ de formulaire
- navigation latérale (sidebar) et topbar simple