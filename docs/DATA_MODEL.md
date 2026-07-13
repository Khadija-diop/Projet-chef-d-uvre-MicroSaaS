# DATA MODEL - Parcours DevOps Guide

## 1. Objet du document

Ce document decrit le modele de donnees de la V1 de `Parcours DevOps Guide` pour l'etape C.

Il couvre :

- le **MCD** (modele conceptuel de donnees)
- le **MLD** (modele logique relationnel)
- le **MPD** (modele physique cible pour `PostgreSQL`)


## 2. Regles de nommage

Pour garder un modele homogene, les regles suivantes sont retenues :

- noms techniques en `snake_case`
- noms de tables au pluriel
- cles primaires nommees `id` au niveau logique et physique (sauf `progress`)
- cles etrangeres nommees `<entite>_id`
- colonnes de dates nommees `created_at` et `updated_at`
- statuts et roles limites a des enums explicites

Au niveau **MCD**, les identifiants metier (`email`, `title`, `content`) sont portes en cles conceptuelles. Au niveau **MLD/MPD**, des `id` techniques `uuid` completent ces identifiants.

## 3. MCD

Le MCD couvre toutes les fonctionnalites prevues pour la V1 :

- gestion des comptes
- consultation des modules
- association de ressources a chaque module
- suivi de progression par apprenant·e
- administration minimale des contenus

### Entites principales

#### USERS

Represente toute personne possedant un compte applicatif.

Attributs conceptuels :

- email (identifiant)
- password
- role
- created_at
- updated_at

#### MODULES

Represente une etape du parcours pedagogique.

Attributs conceptuels :

- title (identifiant)
- short_description
- display_order
- publication_status
- learning_objective
- created_at
- updated_at

#### RESOURCES

Represente un contenu rattache a un module (article, video, lien, checklist via `resource_type`).

Attributs conceptuels :

- content (identifiant / cible du contenu)
- resource_type
- display_order
- created_at
- module_id (rattachement au module parent)

#### PROGRESS

Represente l'avancement d'un·e apprenant·e sur un module (association `Suit` / `Concerne` materialisee).

Attributs conceptuels :

- module (identifiant du module concerne)
- status
- updated_at

### Associations Merise

| Association | Entite A | Cardinalite A | Entite B | Cardinalite B |
| --- | --- | --- | --- | --- |
| **Suit** | USERS | (0,n) | PROGRESS | (1,1) |
| **Concerne** | PROGRESS | (1,1) | MODULES | (0,n) |
| **Contient** | MODULES | (0,n) | RESOURCES | (1,1) |

Regles metier :

- un **module** contient zero, une ou plusieurs **ressources**
- un **utilisateur** peut avoir zero, une ou plusieurs **progressions**
- un **module** peut etre concerne par zero, une ou plusieurs **progressions**
- une **progression** relie exactement un **utilisateur** et exactement un **module**
- une ressource appartient a exactement un module
- `resource_type` distingue `article`, `video`, `link`, `checklist` sans sous-entites dediees en V1

## 4. MLD

Le MLD retenu repose sur quatre relations principales.

### `users`

- `id` PK (`uuid`)
- `email` UNIQUE
- `password`
- `role`
- `created_at`
- `updated_at`

### `modules`

- `id` PK (`uuid`)
- `title` UNIQUE
- `short_description`
- `learning_objective`
- `display_order` UNIQUE
- `publication_status`
- `created_at`
- `updated_at`

### `resources`

- `id` PK (`uuid`)
- `module_id` FK -> `modules.id`
- `content`
- `resource_type`
- `display_order`
- `created_at`

### `progress`

- `user_id` PK, FK -> `users.id`
- `module_id` PK, FK -> `modules.id`
- `status`
- `updated_at`

La table `progress` materialise l'association N,N entre utilisateur et module avec attributs.

## 5. MPD

Le MPD cible est `PostgreSQL`.

Choix retenus :

- `uuid` pour les identifiants techniques
- `timestamptz` pour les dates
- enums pour les statuts, roles et types de ressources
- cle primaire composite sur `progress (user_id, module_id)`
- contraintes `UNIQUE` sur les identifiants metier (`email`, `title`, `display_order`)
- index sur les cles etrangeres et les colonnes de filtrage utiles
- `ON DELETE CASCADE` sur les dependances `resources` et `progress`

Le DDL de reference est versionne dans `sql/MPD.sql`.

## 6. Diagrammes associes

Les sources et exports de cette etape sont stockes dans `docs/diagrams/`.

| Diagramme | Source | Export |
| --- | --- | --- |
| MCD | `mcd.puml` | `mcd.png` |
| MLD | `mld.puml` | `mld.png` |
| MPD | `mpd.puml` | `mpd.png` |
| Cas d'utilisation | `use-case.puml` | `use-case.png` |
| Deploiement | `deployment.puml` | `deployment.png` |
| Sequence (parcours principal) | `sequence-main-flow.puml` | `sequence.png` |

## 7. Checklist livrables - Etape C

| Livrable | Fichier ou emplacement | Statut |
| --- | --- | --- |
| MCD (conceptuel) | `docs/diagrams/mcd.puml` + `mcd.png` | source versionnee, export PNG |
| MLD (logique relationnel) | `docs/diagrams/mld.puml` + `mld.png` | source versionnee, export PNG |
| MPD (physique / DDL PostgreSQL) | `sql/MPD.sql` + `mpd.puml` + `mpd.png` | DDL et diagramme alignes |
| Diagramme de sequence (parcours principal) | `sequence-main-flow.puml` + `sequence.png` | parcours complet documente |
| Cas d'utilisation | `use-case.puml` + `use-case.png` | aligne SPECS / MCD |
| Deploiement logique | `deployment.puml` + `deployment.png` | export PNG |
| Benchmark visuel (3 a 5 references) | `docs/benchmark.md` | 4 references documentees |
| Moodboard | `docs/moodboard.md` | intention + palette + typographies |
| Charte + design tokens | `docs/DESIGN.md` | tokens + contraintes RGAA 4.1 |
| Wireframes ecrans principaux | `docs/WIREFRAMES.md` | wireframes textuels |
| Maquettes haute fidelite Figma | `docs/DESIGN.md` section **9. Liens Figma** | disponible : https://www.figma.com/design/OL1nUrNFEaoYM0AvW0JXll/Parcours-DevOps-Guide |
| Prototype interactif Figma | `docs/DESIGN.md` section **9. Liens Figma** | disponible : https://www.figma.com/design/OL1nUrNFEaoYM0AvW0JXll/Parcours-DevOps-Guide |

## 8. Justification

Ce modele reste volontairement simple pour une V1, mais il couvre deja :

- la separation entre contenu pedagogique et progression utilisateur
- la gestion d'un role d'administration
- l'association de plusieurs ressources a un module
- la distinction des types de ressources via un discriminant
- la tracabilite de l'avancement par apprenant·e

Il est evolutif pour la Phase 2, par exemple pour ajouter :

- des attributs specifiques par type de ressource
- des categories de modules
- un tableau de bord plus riche
- des traces d'audit ou d'administration
