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
- created_at
- updated_at
- role : porte desormais par l'association **A pour role** vers l'entite ROLES (plus un attribut simple)

#### ROLES

Represente un role applicatif attribuable a un utilisateur (extensible sans modifier une enum).

Attributs conceptuels :

- code (identifiant, ex. `learner`, `admin`)
- libelle
- description

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

Represente un contenu pedagogique (article, video, lien, checklist via `resource_type`), independant de tout module : une meme ressource peut etre proposee dans plusieurs modules.

Attributs conceptuels :

- content (identifiant / cible du contenu)
- resource_type
- created_at

#### MODULE_RESOURCES

Association entite qui relie un module a une ressource qu'il propose (relation N,N materialisee, sur le meme principe que PROGRESS pour USERS/MODULES). Porte l'ordre d'affichage de la ressource **dans ce module precis** : la meme ressource peut avoir un `display_order` different selon le module ou elle apparait.

Attributs conceptuels :

- display_order

#### PROGRESS

Represente l'avancement d'un·e apprenant·e sur un module (association `Suit` / `Concerne` materialisee).

Attributs conceptuels :

- module (identifiant du module concerne)
- status (`a_faire` / `en_cours` / `termine`)
- updated_at

### Associations Merise

| Association | Entite A | Cardinalite A | Entite B | Cardinalite B |
| --- | --- | --- | --- | --- |
| **A pour role** | USERS | (1,1) | ROLES | (0,n) |
| **Suit** | USERS | (0,n) | PROGRESS | (1,1) |
| **Concerne** | PROGRESS | (1,1) | MODULES | (0,n) |
| **Propose** | MODULES | (0,n) | MODULE_RESOURCES | (1,1) |
| **Cible** | MODULE_RESOURCES | (1,1) | RESOURCES | (0,n) |

Regles metier :

- un **utilisateur** a exactement un **role** ; un **role** peut etre attribue a zero, un ou plusieurs **utilisateurs**
- un **module** propose zero, une ou plusieurs **ressources**, et une **ressource** peut etre proposee dans zero, un ou plusieurs **modules** (ex. une doc officielle Git referencee a la fois dans le module Git et dans un module CI/CD ulterieur). C'est une veritable relation **many-to-many (N,N)**, materialisee par l'entite association `MODULE_RESOURCES` (associations `Propose` + `Cible`) sur le meme principe que `PROGRESS` pour USERS/MODULES : la table de jointure demandee. Sa cle est le couple `(module_id, resource_id)`, et elle porte l'attribut `display_order` puisque l'ordre d'affichage d'une ressource peut varier d'un module a l'autre
- un **utilisateur** peut avoir zero, une ou plusieurs **progressions** ; un **module** peut etre concerne par zero, une ou plusieurs **progressions**
- une **progression** relie exactement un **utilisateur** et exactement un **module** : `PROGRESS` est l'entite association qui **materialise la relation many-to-many (N,N) entre USERS et MODULES**. C'est la table de jointure demandee : elle porte elle-meme les attributs `status` et `updated_at`, ce qui justifie de la representer comme une entite a part entiere (associations `Suit` + `Concerne`) plutot que comme une simple table de liaison sans donnees
- `resource_type` distingue `article`, `video`, `link`, `checklist` sans sous-entites dediees en V1

## 4. MLD

Le MLD retenu repose sur six relations principales.

### `roles`

- `id` PK (`uuid`)
- `code` UNIQUE (ex. `learner`, `admin`)
- `libelle`
- `description`

### `users`

- `id` PK (`uuid`)
- `email` UNIQUE
- `password_hash`
- `role_id` FK -> `roles.id`
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
- `content`
- `resource_type`
- `created_at`

### `module_resources`

- `module_id` PK, FK -> `modules.id`
- `resource_id` PK, FK -> `resources.id`
- `display_order`

### `progress`

- `user_id` PK, FK -> `users.id`
- `module_id` PK, FK -> `modules.id`
- `status` (enum : `a_faire`, `en_cours`, `termine`)
- `updated_at`

La table `progress` **est la table de jointure** qui materialise l'association N,N entre `users` et `modules` : sa cle primaire composite `(user_id, module_id)` empeche qu'un meme utilisateur ait deux lignes de progression pour un meme module, et ses colonnes `status`/`updated_at` sont les attributs portes par cette relation.

`module_resources` **est la table de jointure** entre `modules` et `resources` : sa cle primaire composite `(module_id, resource_id)` empeche qu'une meme ressource soit rattachee deux fois au meme module, tout en permettant qu'elle soit rattachee a plusieurs modules differents. Son attribut `display_order` est intentionnellement porte par la table de jointure (et non par `resources`) car l'ordre d'affichage d'une ressource peut differer selon le module dans lequel elle apparait.

## 5. MPD

Le MPD cible est `PostgreSQL`.

Choix retenus :

- `uuid` pour les identifiants techniques
- `timestamptz` pour les dates
- enums pour les statuts et types de ressources
- cle primaire composite sur `progress (user_id, module_id)`
- contraintes `UNIQUE` sur les identifiants metier (`email`, `title`, `display_order`)
- index sur les cles etrangeres et les colonnes de filtrage utiles
- `ON DELETE CASCADE` sur les dependances `resources` et `progress`

Le DDL de reference est versionne dans `sql/MPD.sql`.

**Etat du diagramme `docs/diagrams/mpd.puml`** : il a ete mis a jour pour representer la **cible** physique (avec `roles` et `module_resources`), conformement au MCD/MLD ci-dessus. `sql/MPD.sql` et le schema Prisma, eux, n'ont **pas encore** ete migres et refletent toujours l'ancienne version (`users.role` en enum, `resources.module_id` en FK directe) : il y a donc temporairement un ecart assume entre le diagramme (cible) et le DDL reellement applique (existant), le temps de valider la conception avant de coder la migration.

**Evolutions MCD/MLD non encore appliquees au physique (a faire plus tard)** : deux ecarts assumes entre la conception ci-dessus et `sql/MPD.sql` / Prisma pour le moment (temps de valider la conception avant de migrer le physique) :

- une entite `roles` remplace l'enum `user_role_enum` porte par `users.role`. A l'implementation : creer la table `roles`, la peupler (`learner`, `admin`), ajouter `users.role_id uuid NOT NULL REFERENCES roles(id)`, migrer les donnees existantes puis supprimer la colonne `users.role` et le type enum `user_role_enum`.
- une table de jointure `module_resources` remplace la FK directe `resources.module_id`, pour permettre a une ressource d'etre partagee entre plusieurs modules. A l'implementation : creer `module_resources (module_id, resource_id, display_order)` avec `PRIMARY KEY (module_id, resource_id)`, migrer les lignes existantes de `resources` (chaque `resources.module_id` actuel devient une ligne dans `module_resources` avec le `display_order` deja present), puis supprimer les colonnes `resources.module_id` et `resources.display_order`. Prevoir `ON DELETE CASCADE` sur les deux FK de `module_resources` (si un module ou une ressource est supprime, seul le lien disparait, pas les autres rattachements de la ressource).

## 6. Diagrammes associes

Les sources et exports de cette etape sont stockes dans `docs/diagrams/`.

| Diagramme | Source | Export |
| --- | --- | --- |
| MCD | `mcd.dot` (Graphviz, `dot -Tpng mcd.dot -o mcd.png`) | `mcd.png` |
| MLD | `mld.dot` (Graphviz, `dot -Tpng mld.dot -o mld.png`) | `mld.png` |
| MPD | `mpd.puml` | `mpd.png` |
| Cas d'utilisation | `use-case.puml` | `use-case.png` |
| Deploiement | `deployment.puml` | `deployment.png` |
| Sequence 1 - Inscription | `sequence-01-inscription.puml` | `sequence-01-inscription.png` |
| Sequence 2 - Connexion | `sequence-02-connexion.puml` | `sequence-02-connexion.png` |
| Sequence 3 - Consultation du parcours | `sequence-03-consultation-parcours.puml` | `sequence-03-consultation-parcours.png` |
| Sequence 4 - Progression | `sequence-04-progression.puml` | `sequence-04-progression.png` |

## 7. Checklist livrables - Etape C

| Livrable | Fichier ou emplacement | Statut |
| --- | --- | --- |
| MCD (conceptuel) | `docs/diagrams/mcd.puml` + `mcd.png` | source versionnee, export PNG |
| MLD (logique relationnel) | `docs/diagrams/mld.puml` + `mld.png` | source versionnee, export PNG |
| MPD (physique / DDL PostgreSQL) | `sql/MPD.sql` + `mpd.puml` + `mpd.png` | DDL et diagramme alignes |
| Diagrammes de sequence (parcours principal) | `sequence-01` a `sequence-04` (`.puml` + `.png`, style commun `sequence-common.iuml`) | parcours complet documente en 4 diagrammes |
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
