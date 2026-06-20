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
- cles primaires nommees `id`
- cles etrangeres nommees `<entite>_id`
- colonnes de dates nommees `created_at` et `updated_at`
- statuts et roles limites a des enums explicites

## 3. MCD

Le MCD couvre toutes les fonctionnalites prevues pour la V1 :

- gestion des comptes
- consultation des modules
- association de ressources a chaque module
- suivi de progression par apprenant·e
- administration minimale des contenus

### Entites principales

#### Utilisateur

Represente toute personne possedant un compte applicatif.

Attributs principaux :

- id
- email
- password_hash
- role
- created_at
- updated_at

#### Module

Represente une etape du parcours pedagogique.

Attributs principaux :

- id
- title
- short_description
- learning_objective
- display_order
- publication_status
- created_at
- updated_at

#### Ressource

Represente un contenu rattache a un module.

Attributs principaux :

- id
- module_id
- title
- resource_type
- url
- display_order
- created_at

#### Progression

Represente l'avancement d'un·e apprenant·e sur un module.

Attributs principaux :

- user_id
- module_id
- status
- updated_at

### Associations

- un **module** contient zero, une ou plusieurs **ressources**
- un **utilisateur** peut avoir zero, une ou plusieurs **progressions**
- un **module** peut etre lie a zero, une ou plusieurs **progressions**
- une **progression** relie exactement un **utilisateur** et exactement un **module**

## 4. MLD

Le MLD retenu repose sur quatre relations principales.

### `users`

- `id` PK
- `email` UNIQUE
- `password_hash`
- `role`
- `created_at`
- `updated_at`

### `modules`

- `id` PK
- `title`
- `short_description`
- `learning_objective`
- `display_order`
- `publication_status`
- `created_at`
- `updated_at`

### `resources`

- `id` PK
- `module_id` FK -> `modules.id`
- `title`
- `resource_type`
- `url`
- `display_order`
- `created_at`

### `progress`

- `id` PK
- `user_id` FK -> `users.id`
- `module_id` FK -> `modules.id`
- `status`
- `updated_at`
- contrainte unique sur (`user_id`, `module_id`)

## 5. MPD

Le MPD cible est `PostgreSQL`.

Choix retenus :

- `uuid` pour les identifiants
- `timestamptz` pour les dates
- enums pour les statuts et roles
- contraintes `unique` pour garantir l'integrite metier
- index sur les cles etrangeres et les colonnes de tri utiles

Le DDL de reference est versionne dans `docs/MPD.sql`.

## 6. Diagrammes associes

Les sources et exports de cette etape sont stockes dans `docs/diagrams/`.

- `mcd.puml` / `mcd.png`
- `mld.puml` / `mld.png`
- `sequence-main-flow.puml` / `sequence-main-flow.png`

## 7. Checklist livrables - Etape C

Cette section relie le brief **Etape C** aux fichiers du depot.

| Livrable | Fichier ou emplacement | Statut |
| --- | --- | --- |
| MCD (conceptuel) | `docs/diagrams/mcd.puml` + export `docs/diagrams/mcd.png` | source versionnee, export a generer depuis l'outil |
| MLD (logique relationnel) | `docs/diagrams/mld.puml` + export `docs/diagrams/mld.png` | idem |
| MPD (physique / DDL PostgreSQL) | `docs/MPD.sql` | DDL versionne : c'est le livrable physique principal |
| Diagramme de sequence (parcours principal) | `docs/diagrams/sequence-main-flow.puml` + export `docs/diagrams/sequence-main-flow.png` | idem |
| Benchmark visuel (3 a 5 references) | `docs/benchmark.md` | 4 references documentees |
| Moodboard | `docs/moodboard.md` | intention + palette + typographies |
| Charte + design tokens | `docs/DESIGN.md` | tokens + contraintes RGAA 4.1 |
| Wireframes ecrans principaux | `docs/WIREFRAMES.md` | wireframes textuels |
| Maquettes haute fidelite Figma | `docs/DESIGN.md` section **9. Liens Figma** | a completer avec l'URL du fichier Figma |
| Prototype interactif Figma | `docs/DESIGN.md` section **9. Liens Figma** | a completer avec l'URL du prototype |

**Exports PNG** : ouvrir chaque `.puml` dans un outil compatible PlantUML puis exporter en PNG dans `docs/diagrams/`, ou utiliser un rendu en ligne. Les noms d'export attendus sont listes dans `docs/diagrams/README.md`.

**MPD** : le referentiel demande un DDL pour le SGBD. Le fichier `docs/MPD.sql` remplit ce role. Un eventuel schema physique sous forme d'image reste optionnel.

## 8. Justification

Ce modele reste volontairement simple pour une V1, mais il couvre deja :

- la separation entre contenu pedagogique et progression utilisateur
- la gestion d'un role d'administration
- l'association de plusieurs ressources a un module
- la traçabilite de l'avancement par apprenant·e

Il est evolutif pour la Phase 2, par exemple pour ajouter :

- plusieurs types de ressources enrichies
- des categories de modules
- un tableau de bord plus riche
- des traces d'audit ou d'administration
