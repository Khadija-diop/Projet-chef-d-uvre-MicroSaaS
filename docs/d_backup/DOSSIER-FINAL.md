# DOSSIER FINAL - Phase 1 - Parcours DevOps Guide

## 1. Objet du document

Ce document compile et indexe l'ensemble des livrables produits durant la Phase 1 (Étapes A à D), pour constituer le dossier final remis au mentor et au jury. Il ne duplique pas le contenu : il pointe vers chaque livrable et donne son statut.

## 2. Étape A - Discovery & PRD

| Livrable | Fichier | Statut |
| --- | --- | --- |
| Recherche JTBD (sources documentées) | [`recherche-jtbd.md`](recherche-jtbd.md) | fait |
| Product Requirements Document | [`PRD.md`](PRD.md) | fait |

Epic GitHub : [#1 Discovery & PRD](https://github.com/Khadija-diop/Projet-chef-d-uvre-MicroSaaS/issues/1) — fermé.

## 3. Étape B - Spécifications & architecture

| Livrable | Fichier | Statut |
| --- | --- | --- |
| Spécifications fonctionnelles + user stories + Gherkin | [`SPECS.md`](SPECS.md) | fait, points ouverts tranchés (§10) |
| Architecture technique, stack, sécurité, sobriété | [`ARCHITECTURE.md`](ARCHITECTURE.md) | fait |
| Diagramme de cas d'utilisation UML | [`diagrams/use-case.png`](diagrams/use-case.png) | fait |
| Diagramme de déploiement logique UML | [`diagrams/deployment.png`](diagrams/deployment.png) | fait |

Epic GitHub : [#2 Specifications & architecture](https://github.com/Khadija-diop/Projet-chef-d-uvre-MicroSaaS/issues/2) — fermé.

## 4. Étape C - Modèle de données & maquettage

| Livrable | Fichier | Statut |
| --- | --- | --- |
| MCD / MLD / MPD (MERISE) | [`DATA_MODEL.md`](DATA_MODEL.md) + `diagrams/mcd.png`, `mld.png`, `mpd.png` | fait |
| DDL PostgreSQL | `sql/MPD.sql` | fait |
| Diagramme de séquence (parcours principal) | [`diagrams/sequence.png`](diagrams/sequence.png) | fait |
| Benchmark visuel | [`benchmark.md`](benchmark.md) | fait |
| Moodboard | [`moodboard.md`](moodboard.md) | fait |
| Charte graphique + design tokens + RGAA 4.1 | [`DESIGN.md`](DESIGN.md) | fait |
| Wireframes textuels | [`WIREFRAMES.md`](WIREFRAMES.md) | fait |
| Maquettes haute fidélité (Figma) | lien dans `DESIGN.md` §9 | fait |
| Prototype interactif (Figma + version HTML locale) | lien dans `DESIGN.md` §9, secours `mes-guides/prototype.html` | fait |

Epic GitHub : [#3 Etape C Modèle de données & maquettage](https://github.com/Khadija-diop/Projet-chef-d-uvre-MicroSaaS/issues/3) — fermé.

## 5. Étape D - Pitch & Dossier

| Livrable | Fichier | Statut |
| --- | --- | --- |
| Présentation de synthèse pour le mentor | [`PRESENTATION-MENTOR.md`](PRESENTATION-MENTOR.md) / `.html` | fait |
| Dossier final compilé | ce document | fait |
| Script du pitch (10 min) | [`PITCH-SCRIPT.md`](PITCH-SCRIPT.md) | fait — **à transformer en support visuel** (voir note ci-dessous) |
| Support de pitch (slides) | `PITCH.pdf` | **fichier vide (placeholder), à produire avant la soutenance** à partir de `PITCH-SCRIPT.md` |
| Script de démonstration du prototype | [`DEMO-SCRIPT.md`](DEMO-SCRIPT.md) | fait |
| Collecte des retours mentor/pairs | [`RETOURS.md`](RETOURS.md) | **template prêt, à remplir lors des sessions réelles** |
| Intégration des retours au dossier | idem, section « Synthèse et arbitrages » de `RETOURS.md` | **en attente de retours réels** |

Epic GitHub : [#4 Etape D - Pitch & Dossier](https://github.com/Khadija-diop/Projet-chef-d-uvre-MicroSaaS/issues/4) — reste ouvert tant que les retours n'ont pas été collectés et intégrés.

## 6. Ce qui reste à faire avant la soutenance

1. Exporter `PITCH-SCRIPT.md` en support visuel (slides) et remplacer `docs/PITCH.pdf`, actuellement vide.
2. Répéter la démo en suivant `DEMO-SCRIPT.md`, dans les deux environnements de secours (Figma + `mes-guides/prototype.html`).
3. Faire relire le pitch et la démo par au moins un pair et par le mentor, consigner les retours dans `RETOURS.md`, puis mettre à jour les documents concernés.

## 7. Synthèse produit (rappel en une phrase)

`Parcours DevOps Guide` est un site-lab pédagogique conçu en dogfooding : un MicroSaaS qui aide des apprenant·es débutant·es en DevOps à suivre un parcours structuré en modules avec suivi de progression, servant lui-même de terrain d'application des pratiques DevOps (Git, CI/CD, Docker, Ansible, sécurité).
