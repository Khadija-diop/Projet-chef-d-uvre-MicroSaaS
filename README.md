# Lab DevOps Securise

Projet de chef-d'oeuvre concu comme un **site-lab pedagogique** pour apprendre le DevOps par la pratique et aider d'autres apprenant·es a suivre un parcours clair.

## Vision

Le projet consiste a construire une application web simple, mais complete, puis a lui appliquer un vrai cycle de vie DevOps :

- developpement en architecture separee `frontend` / `backend`
- conteneurisation avec `Docker`
- automatisation des verifications avec `GitHub Actions`
- configuration et deploiement du serveur avec `Ansible`
- documentation de la securite, des tests et de l'infrastructure

L'idee centrale est le **dogfooding** : utiliser les outils DevOps pour gerer le site qui sert lui-meme de support d'apprentissage.

## Objectif du projet

L'objectif n'est pas de creer une plateforme DevOps pour des tiers. Le but est de realiser un **site web support** qui permet a la fois d'apprendre en pratiquant et de partager ce parcours avec d'autres apprenant·es, tout en demontrant de facon concrete les competences attendues sur :

- la conception applicative
- la securisation d'une application web
- la mise en place d'une architecture en couches
- l'automatisation des taches techniques
- le deploiement et l'exploitation d'une application

## Probleme adresse

Apprendre le DevOps uniquement en theorie reste abstrait. Sans projet reel :

- l'automatisation reste superficielle
- les problemes de deploiement ne sont pas rencontres en conditions concretes
- la securite, les tests et la reprise sur incident restent mal pratiques

Le Lab DevOps Securise repond a ce besoin en fournissant un terrain d'experimentation réel sur lequel appliquer `Git`, `CI/CD`, `Docker`, `Ansible` et les pratiques de securite.

## Cible

La cible principale du projet est pedagogique :

- l'auteur·rice du projet
- les apprenant·es debutant·es en DevOps
- le jury CDA
- les pair·es ou formateur·rices qui evaluent la coherence technique, documentaire et DevOps

## Fonctionnalite principale V1

La V1 porte sur un **site-lab fonctionnel** proposant un **parcours d'apprentissage DevOps guide**.

Cette V1 doit inclure au minimum :

- une interface web publique
- un backend API distinct du frontend
- une base de donnees
- une authentification simple et securisee
- des pages pedagogiques sur les etapes DevOps
- des modules ou etapes de progression
- une administration minimale pour gerer les contenus

## Apports DevOps attendus

Le projet doit aussi demontrer un apprentissage pratique du DevOps :

- versioning propre avec `Git`
- integration continue avec `GitHub Actions`
- environnement reproductible avec `Docker`
- configuration du serveur avec `Ansible`
- documentation d'infrastructure et strategie de reprise
- prise en compte de la securite applicative

## Hors perimetre

Pour rester realiste et conforme au temps imparti, la V1 ne couvre pas :

- `Kubernetes`
- une architecture microservices
- un multi-cloud avance
- une observabilite complete de niveau production
- une plateforme SaaS pour des utilisateur·rices externes
- une plateforme e-learning complexe avec quiz, cohortes et gamification avancee

## Architecture cible

Le projet suit une architecture en couches conforme au referentiel :

- **Frontend** : interface utilisateur web
- **Backend API** : logique metier, securite, validation et orchestration
- **Base de donnees** : persistance des donnees applicatives
- **Infrastructure** : serveur cible, conteneurs, reverse proxy et automatisation

Repartition des outils DevOps :

- `GitHub` pour le versioning et le suivi
- `GitHub Actions` pour la CI
- `Docker` pour standardiser l'execution
- `Ansible` pour preparer et maintenir le serveur

## Stack envisagee

### Application

- `Next.js` ou `React` pour le frontend
- `Node.js` + `Express` ou `NestJS` pour le backend
- `PostgreSQL` ou `MySQL` pour la base relationnelle
- stockage complementaire souple si besoin justifie

### DevOps

- `GitHub`
- `GitHub Actions`
- `Docker`
- `Ansible`
- hebergement sur `VPS` ou environnement equivalent

## Etat du projet

Le projet est actuellement en **Phase 1 - Conception**.

Cette phase couvre :

- le cadrage du besoin
- les specifications
- l'architecture
- les diagrammes UML et de donnees
- les maquettes
- la documentation technique et DevOps

La **Phase 2** servira a construire, tester, securiser et deployer l'application dans le meme depot.

## Documentation

Les documents de conception sont centralises dans `docs/`.

Structure documentaire cible du depot :

```text
projet-chef-oeuvre-microsaas/
├── README.md
└── docs/
    ├── PRD.md                  Product Requirements Document (lean, 2-5 pages)
    ├── SPECS.md                user stories + scenarios Gherkin
    ├── ARCHITECTURE.md         stack + patron + couches + choix de securite et de sobriete
    ├── DESIGN.md               charte + design tokens + lien Figma
    ├── recherche-jtbd.md       sources documentees (Reddit, avis client·es, videos, articles...)
    ├── benchmark.md
    ├── moodboard.md
    ├── PITCH.pdf               support du pitch oral
    └── diagrams/
        ├── use-cases.png       diagramme de cas d'utilisation
        ├── deployment.png      diagramme de deploiement UML
        ├── sequence.png        diagramme de sequence de la fonctionnalite principale
        ├── mcd.png             modele conceptuel de donnees (MERISE)
        ├── mld.png             modele logique de donnees (MERISE)
        └── mpd.png             modele physique de donnees (MERISE)
```

Documents deja presents :

- `docs/PRD.md`
- `docs/SPECS.md`
- `mes-guides/guide-route-devops.md`
- `mes-guides/plan.md`

## Parcours utilisateur principal

1. Un·e visiteur·se accede au site et consulte la presentation du lab et la feuille de route DevOps.
2. Un·e apprenant·e authentifie·e accede aux modules, ressources et etapes du parcours.
3. Cette personne marque sa progression ou consulte les contenus associes a une etape.
4. L'application valide les donnees, applique les regles de securite et persiste la progression en base.
5. L'administrateur·rice publie ou met a jour les contenus pedagogiques et verifie le bon fonctionnement du site.

## Criteres de reussite

Les indicateurs de succes retenus sont :

- un parcours utilisateur fonctionnel de bout en bout
- un parcours d'apprentissage simple est accessible a d'autres apprenant·es
- une separation claire entre frontend, backend et donnees
- un projet executable localement et en environnement conteneurise
- un pipeline CI en place
- un deploiement ou une preparation serveur automatise avec `Ansible`
- une documentation conforme au referentiel CDA

## Roadmap

### Phase 1 - Conception

- cadrer le projet et le besoin
- rediger le PRD et les specifications
- documenter l'architecture
- concevoir les diagrammes UML et MERISE
- produire les maquettes et le prototype
- preparer la documentation technique et DevOps

### Phase 2 - Realisation

- developper le frontend et le backend
- modeliser et implementer la base de donnees
- integrer l'authentification et les controles d'acces
- automatiser les workflows de qualite
- conteneuriser l'application
- deployer le projet avec `Ansible`

## Resume en une phrase

Le Lab DevOps Securise est un site-lab personnel concu pour apprendre le DevOps par la pratique en construisant, securisant, automatisant et deployant une vraie application web.
