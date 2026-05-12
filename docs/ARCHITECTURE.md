# ARCHITECTURE - Parcours DevOps Guide

## 1. Objet du document

Ce document decrit l'architecture fonctionnelle et technique du MicroSaaS **Parcours DevOps Guide**.

Il porte sur le **produit** documente dans `docs/` :

- la structure applicative
- les choix de stack
- le patron d'architecture
- les couches du backend
- les choix de securite
- les choix de sobriete

Le cadrage technique global du projet et les choix DevOps transverses sont documentes dans `mes-guides/`.

---

## 2. Vue d'ensemble

`Parcours DevOps Guide` est une application web permettant a des apprenant·es debutant·es en DevOps de :

- consulter un parcours structure en modules
- lire les ressources associees a chaque module
- creer un compte et se connecter
- enregistrer leur progression
- acceder a une administration minimale pour gerer les contenus

L'application suit une architecture **frontend / backend / base de donnees** clairement separee.

---

## 3. Patron de conception retenu

Le patron retenu est une **architecture multicouche**.

Ce choix est fait pour plusieurs raisons :

- il est simple a comprendre et a maintenir
- il correspond bien a une V1 de MicroSaaS
- il facilite la separation des responsabilites
- il est pertinent pour la soutenance, car chaque couche a un role clair

L'architecture est organisee autour de quatre niveaux :

- **presentation** : interface utilisateur et endpoints HTTP
- **metier** : logique fonctionnelle du produit
- **acces aux donnees** : lecture et ecriture vers la base
- **donnees** : modele relationnel et persistance

---

## 4. Stack retenue

### Frontend

- **Next** 
- **TypeScript**
- **React Router**

### Backend

- **Node.js**
- **Express**
- **TypeScript**

### Base de donnees

- **PostgreSQL**
- **Prisma** comme ORM

### Justification

Cette stack est retenue car elle permet :

- une separation explicite entre frontend et backend
- une experience de developpement rapide
- un typage cohérent entre les couches avec `TypeScript`
- une base relationnelle adaptee aux entites du produit (`users`, `modules`, `resources`, `progress`)
- un acces aux donnees simple et lisible via `Prisma`

---

## 5. Separation frontend / backend

La separation frontend / backend est **explicite et non negociable** dans ce projet.

### Frontend

Le frontend est responsable de :

- l'affichage des pages publiques
- l'authentification cote interface
- la consultation des modules
- l'affichage de la progression
- les formulaires d'administration

Le frontend ne contient pas de logique metier critique ni d'acces direct a la base.

### Backend API

Le backend est responsable de :

- l'authentification
- la validation des donnees
- l'application des regles metier
- la gestion des droits
- l'acces a la base de donnees

Le frontend communique uniquement avec l'API via des appels HTTP/JSON.

### Nœuds logiques retenus en Phase 1

La vue de deploiement logique retenue pour la Phase 1 comprend les nœuds suivants :

- **Navigateur web** : point d'entree utilisateur
- **Reverse-proxy** : point de routage unique entre le client et les services applicatifs
- **Frontend** : SPA `React` livree au navigateur
- **Backend (API)** : API `Express` et services metier
- **Database** : `PostgreSQL` pour la persistance

Le detail des echanges est le suivant :

- le navigateur communique avec le reverse-proxy en `HTTPS` en cible et `HTTP` en environnement local
- le reverse-proxy sert l'application frontend en `HTTP`
- le reverse-proxy transmet les appels API au backend en `HTTP/JSON`
- le backend communique avec la base en `SQL`

Aucun service tiers n'est obligatoire dans la V1. Si un service mail transactionnel est ajoute plus tard, il sera rattache au backend et apparaitra dans le diagramme de Phase 2.

La source du diagramme de deploiement logique est versionnee dans `docs/diagrams/deployment.puml`. L'export attendu pour le dossier final est `docs/diagrams/deployment.png`.

---

## 6. Couches du backend

### Couche presentation

Cette couche contient :

- les routes HTTP
- les controleurs
- la validation d'entree de premier niveau
- la transformation des reponses API

Responsabilite :

- recevoir la requete
- verifier les donnees minimales attendues
- appeler la couche metier
- retourner une reponse claire au frontend

### Couche metier

Cette couche contient les **services** applicatifs.

Responsabilite :

- appliquer les regles du produit
- gerer les cas d'usage
- calculer la progression
- verifier qu'un·e utilisateur·rice a le droit d'effectuer une action

Exemples de services :

- `AuthService`
- `ModuleService`
- `ProgressService`
- `AdminModuleService`

### Couche acces aux donnees

Cette couche contient les **repositories** ou adaptateurs de persistance.

Responsabilite :

- lire les modules publies
- enregistrer une progression
- recuperer un compte utilisateur
- creer ou modifier un module

Elle isole la logique metier des details lies a `Prisma` et a `PostgreSQL`.

### Couche donnees

Cette couche correspond :

- au schema relationnel
- aux tables
- aux contraintes d'integrite
- aux relations entre entites

Entites principales prevues :

- `User`
- `Module`
- `Resource`
- `Progress`

---

## 7. Modele de donnees cible

### `User`

Represente un compte applicatif.

Champs principaux envisages :

- identifiant
- email
- mot de passe hache
- role
- date de creation

### `Module`

Represente une etape du parcours.

Champs principaux envisages :

- identifiant
- titre
- description
- objectif pedagogique
- ordre d'affichage
- statut de publication

### `Resource`

Represente une ressource rattachee a un module.

Champs principaux envisages :

- identifiant
- titre
- type
- url ou contenu
- module parent

### `Progress`

Represente l'etat d'avancement d'un·e apprenant·e pour un module donne.

Champs principaux envisages :

- identifiant
- utilisateur·rice
- module
- statut
- date de mise a jour

---

## 8. Cas d'usage techniques principaux

### Consulter les modules

1. le frontend appelle l'API publique
2. le backend recupere les modules publies
3. la base retourne les modules dans l'ordre prevu
4. le frontend affiche la liste

### Marquer un module comme termine

1. l'apprenant·e authentifie·e lance l'action
2. le frontend appelle l'API de progression
3. le backend verifie l'identite et les droits
4. le service met a jour la progression
5. la base enregistre l'etat
6. le frontend rafraichit la progression affichee

### Administrer un module

1. l'administrateur·rice envoie le formulaire
2. le backend valide les champs
3. le service applique les regles de publication
4. le repository persist le module
5. la reponse confirme la mise a jour

---

## 9. Choix de securite

Les choix suivants sont retenus pour rester coherents avec de bonnes pratiques applicatives et avec les principes attendus par l'ANSSI : validation en defense en profondeur, moindre privilege, cloisonnement des acces et protection des secrets.

### Validation des entrees

- validation cote frontend pour le confort utilisateur
- validation cote backend obligatoire pour la securite
- rejet des donnees invalides avant traitement metier
- messages d'erreur sobres, sans exposer d'informations internes

### Authentification

Le choix recommande pour la V1 est une **authentification par session avec cookie securise**.

Ce choix permet :

- d'eviter le stockage de jetons sensibles dans `localStorage`
- d'utiliser des cookies `HttpOnly`
- de mieux controler la session cote serveur

Mesures prevues :

- cookie `HttpOnly`
- cookie `Secure` en production
- politique `SameSite`
- expiration de session

### Autorisation

Les droits sont controles par role :

- `apprenant·e`
- `administrateur·rice`

Chaque route sensible doit verifier explicitement le role attendu.
Le cloisonnement des permissions suit une logique de moindre privilege : un compte apprenant ne peut jamais acceder aux actions de gestion de contenu.

### Secrets

- aucun secret ne doit etre committe dans le depot
- les variables sensibles sont chargees via l'environnement
- un fichier `.env.example` documente les variables attendues

### Protection applicative

Mesures minimales prevues :

- hachage des mots de passe
- limitation des erreurs verbeuses
- controle d'acces aux routes d'administration
- protection contre les entrees invalides
- requetes SQL indirectes via ORM pour limiter le risque d'injection

---

## 10. Choix de sobriete

Le produit doit rester simple, lisible et raisonnable en consommation de ressources.
Les choix suivants s'inscrivent dans une logique d'eco-conception : limiter les transferts inutiles, reduire la complexite fonctionnelle et ne charger que ce qui apporte une valeur directe a l'utilisateur·rice.

Choix retenus :

- pagination ou limitation du nombre d'elements si les modules augmentent
- chargement uniquement des donnees necessaires a chaque page
- pas de polling inutile
- calcul de progression simple
- interface legere, sans surcharge visuelle ni scripts inutiles
- mutualisation des composants frontend

La sobriete concerne aussi la maintenance :

- peu d'entites
- peu de roles
- peu de fonctionnalites simultanees en V1

---

## 11. Structure logique des composants

### Frontend

Exemple de structure cible :

- `pages/`
- `components/`
- `services/api/`
- `hooks/`
- `stores/` ou gestion d'etat simple

### Backend

Exemple de structure cible :

- `routes/`
- `controllers/`
- `services/`
- `repositories/`
- `middlewares/`
- `schemas/`

Cette organisation renforce la lisibilite et facilite les tests.

---

## 12. Evolutivite

La V1 doit rester volontairement petite, mais l'architecture doit permettre des evolutions futures :

- ajout de categories de modules
- ajout de plusieurs types de ressources
- ajout d'un pourcentage de progression
- ajout d'un tableau de bord plus riche

Ces evolutions doivent rester compatibles avec le schema de base sans imposer une refonte complete.

---

## 13. Limites assumées de la V1

Pour ne pas sortir du cadre MicroSaaS :

- pas de moteur de quiz complexe
- pas de correction automatique
- pas de systeme de cohortes
- pas de gamification avancee
- pas de laboratoire d'infrastructure integre

L'architecture est donc volontairement dimensionnee pour un produit simple et bien execute.

---

## 14. Resume

`Parcours DevOps Guide` repose sur une architecture multicouche simple :

- un frontend `Next`
- une API `Express`
- une base `PostgreSQL`
- une logique metier separee
- une authentification par session
- des regles de securite et de sobriete appliquees des la V1

Cette architecture est choisie parce qu'elle est lisible, maintenable et adaptee a un MicroSaaS avec une seule fonctionnalite forte : **guider un parcours DevOps et suivre la progression de l'apprenant·e**.