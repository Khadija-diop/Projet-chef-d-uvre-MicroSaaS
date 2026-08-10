# PITCH SCRIPT - Parcours DevOps Guide (10 minutes)

## 1. Objet du document

Structure minutée du pitch oral de fin de Phase 1, découpée en séquences avec les points clés à dire pour chacune. Sert de base pour produire le support visuel final (`docs/PITCH.pdf`, actuellement vide) et pour répéter l'oral.

Sources : `docs/PRD.md`, `docs/PRESENTATION-MENTOR.md`, `docs/SPECS.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`.

## 2. Minutage global

| # | Séquence | Durée | Cumul |
| --- | --- | --- | --- |
| 1 | Accroche + problème | 0:45 | 0:45 |
| 2 | Contexte et vision (dogfooding) | 1:00 | 1:45 |
| 3 | Le produit V1 | 1:30 | 3:15 |
| 4 | Démo du prototype interactif | 2:30 | 5:45 |
| 5 | Architecture et choix techniques | 1:15 | 7:00 |
| 6 | Modèle de données et sécurité | 1:00 | 8:00 |
| 7 | Roadmap Phase 2/3 | 0:45 | 8:45 |
| 8 | Décisions prises et points à valider | 0:45 | 9:30 |
| 9 | Conclusion + ouverture Q&A | 0:30 | 10:00 |

Marge de sécurité : viser 9:30 à la répétition pour absorber les aléas de démo en live.

## 3. Séquence par séquence

### 1. Accroche + problème (0:45)

- Phrase d'ouverture : « Apprendre le DevOps en théorie reste abstrait : ressources dispersées, ordre d'apprentissage flou, progression impossible à suivre. »
- Une phrase de positionnement : ce pitch présente `Parcours DevOps Guide`, un MicroSaaS conçu pour résoudre exactement ça  et construit en dogfooding.

### 2. Contexte et vision (1:00)

- Le principe du dogfooding : utiliser moi-même les pratiques DevOps pour construire, sécuriser et déployer le site qui enseigne ces mêmes pratiques.
- Cible : moi-même en tant qu'apprenante, les apprenant·es débutant·es en DevOps, le jury CDA.
- Hors périmètre assumé (à dire clairement pour couper court aux questions de scope) : Kubernetes, microservices, multi-cloud, plateforme e-learning complexe.

### 3. Le produit V1 (1:30)

- Une phrase de proposition de valeur (PRD ).
- 3 rôles : Visiteur·se / Apprenant·e authentifié·e / Administrateur·rice.
- Fonctionnalités V1 : présentation publique, auth simple, liste de modules, détail de module avec ressources, suivi de progression, administration minimale.
- 8 modules déjà spécifiés et maquettés (citer 2-3 exemples : Linux/terminal, Git, Docker...).

### 4. Démo du prototype interactif (2:30)

- Bascule vers le prototype  suivre `docs/DEMO-SCRIPT.md` pour le déroulé écran par écran et le plan de secours.
- Ne pas réexpliquer ce qui est visible à l'écran : commenter les décisions de design (charte, accessibilité) pendant que ça défile.

### 5. Architecture et choix techniques (1:15)

- Architecture multicouche, séparation frontend/backend non négociable.
- Stack : Next.js/TypeScript/React Router (frontend), Node.js/Express/TypeScript (backend), PostgreSQL/Prisma (données).
- Une phrase sur le pourquoi : simple à maintenir, pertinent pour une V1, séparation claire des responsabilités.

### 6. Modèle de données et sécurité (1:00)

- 4 entités : USERS, MODULES, RESOURCES, PROGRESS (montrer le MCD une dizaine de secondes si les slides le permettent).
- Sécurité : authentification par session + cookie `HttpOnly`, contrôle d'accès par rôle, validation défense en profondeur, pas de secrets committés.

### 7. Roadmap Phase 2/3 (0:45)

- Phase 2 : développement, base de données, auth, CI, conteneurisation, déploiement Ansible.
- Phase 3 (proposé) : modules avancés (Ansible, Terraform, Kubernetes, GitOps, Kafka/Debezium, observabilité et sécurité avancées)  présenté comme piste à valider, pas comme engagement.

### 8. Décisions prises et points à valider (0:45)

- Rappeler que 3 questions ouvertes ont été tranchées avant la démo (types de ressources, affichage de la progression, catégories de modules)  voir `docs/SPECS.md` . Donner la réponse retenue pour chacune en une phrase, sans détailler la justification sauf si demandé.
- Poser explicitement au mentor les 2 questions qui restent réellement ouvertes (roadmap des modules avancés, périmètre d'infra en Phase 3  `docs/PRESENTATION-MENTOR.md` ).

### 9. Conclusion + ouverture Q&A (0:30)

- Résumé en une phrase (reprendre `docs/PRESENTATION-MENTOR.md` en-tête).
- Transition explicite vers les questions.

## 4. Anti-questions pièges (préparer une réponse courte)

- « Pourquoi pas Kubernetes tout de suite ? » → hors périmètre V1 assumé, cf. réponse au point 2 de la roadmap.
- « Pourquoi une seule table de progression et pas un historique complet ? » → sobriété V1, `status` suffit pour la V1 ; historique identifié comme évolution possible.
- « Pourquoi session/cookie plutôt que JWT ? » → évite le stockage de jetons sensibles côté client, contrôle serveur plus simple (`ARCHITECTURE.md` ).

## 5. Prochaine étape

Ce script est la structure ; il reste à le transformer en support visuel (slides) pour remplacer `docs/PITCH.pdf`, aujourd'hui un fichier vide. Une fois les slides produites, mettre à jour le statut correspondant dans `docs/DOSSIER-FINAL.md`.
