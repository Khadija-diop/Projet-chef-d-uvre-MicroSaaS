# SPECS - Parcours DevOps Guide

## 1. Objet du document

Ce document decrit les specifications fonctionnelles de la V1 du MicroSaaS **Parcours DevOps Guide**.

Le produit a un objectif simple : proposer a des apprenant·es debutant·es en DevOps un parcours structure en modules, avec des ressources associees et un suivi de progression leger.

Les choix d'implementation de l'application globale, de deploiement et d'automatisation ne font pas partie du perimetre fonctionnel de ce document.


---

## 2. Perimetre fonctionnel V1

La V1 couvre :

- une page publique de presentation du MicroSaaS
- une authentification simple
- une liste de modules pedagogiques
- une page detaillee par module
- une progression enregistree par apprenant·e
- une interface d'administration minimale pour gerer les contenus

La V1 ne couvre pas :

- quiz complexes
- correction automatique
- gamification avancee
- gestion de cohortes
- marketplace de contenus
- sandbox technique ou laboratoire automatise

---

## 3. Acteur·rices

### Acteur·rices principal·es

- **Visiteur·se** : consulte la presentation du produit et les contenus publics
- **Apprenant·e authentifie·e** : consulte les modules, accede aux ressources et suit sa progression
- **Administrateur·rice** : cree, modifie et publie les modules et les ressources

### Systeme

- **Application web** : interface et logique metier du MicroSaaS
- **Base de donnees** : stockage des comptes, modules, ressources et progressions

---

## 4. User stories

### Epic - Consultation du parcours

- En tant que visiteur·se, je veux consulter la presentation du parcours, afin de comprendre la promesse du produit.
- En tant qu'apprenant·e, je veux voir la liste des modules, afin de savoir par ou commencer.
- En tant qu'apprenant·e, je veux consulter le detail d'un module, afin de comprendre son objectif et les ressources associees.

### Epic - Progression

- En tant qu'apprenant·e, je veux marquer un module comme termine, afin de suivre mon avancement.
- En tant qu'apprenant·e, je veux voir ma progression globale, afin de savoir ce qu'il me reste a faire.

### Epic - Administration de contenu

_Brique support minimale necessaire pour alimenter le parcours ; elle ne constitue pas la fonctionnalite principale du produit, qui reste la consultation du parcours et le suivi de progression (cf. `PRD.md` section 6)._

- En tant qu'administrateur·rice, je veux creer un module, afin d'enrichir le parcours.
- En tant qu'administrateur·rice, je veux modifier un module ou ses ressources, afin de maintenir le contenu a jour.
- En tant qu'administrateur·rice, je veux publier ou masquer un module, afin de controler ce qui est visible.

### Epic - Securite applicative

- En tant qu'apprenant·e, je veux que mon compte soit protege, afin d'utiliser l'application en confiance.
- En tant qu'administrateur·rice, je veux que les acces soient limites selon les roles, afin d'eviter les actions non autorisees.

---

## 5. Exigences fonctionnelles

### Contenus

Chaque module doit pouvoir contenir au minimum :

- un titre
- une description courte
- un objectif pedagogique
- un niveau ou une position dans le parcours
- une ou plusieurs ressources
- un statut de publication

### Comptes et progression

L'application doit permettre :

- la creation d'un compte
- la connexion a un compte existant
- l'association d'une progression a chaque apprenant·e
- l'affichage de l'etat de completion de chaque module

### Administration

L'administration doit permettre :

- de creer un module
- de modifier un module
- d'ajouter ou supprimer une ressource
- de publier ou de masquer un module

---

## 6. Regles de gestion

### Progression

- un module suit trois etats de progression : `a faire`, `en cours` (module suivant dans l'ordre du parcours, non encore termine) ou `termine`
- un module termine peut etre remis a l'etat `a faire` via l'action "Marquer a refaire"
- la progression d'un·e apprenant·e est personnelle et ne modifie pas le contenu du module
- un module masque ne doit pas apparaitre dans l'espace public ni dans le parcours apprenant

### Contenus

- un module doit avoir un titre avant de pouvoir etre publie
- un module publie doit contenir au minimum une description et un objectif pedagogique
- l'ordre d'affichage des modules doit rester stable et comprehensible

### Securite

- seules les personnes authentifiees peuvent enregistrer une progression
- seules les personnes disposant du role d'administration peuvent gerer les modules
- les donnees saisies dans les formulaires doivent etre validees cote client et cote serveur

---

## 7. Scenarios Gherkin

Les scenarios ci-dessous decrivent le comportement metier attendu de la V1. Ils ne decrivent pas les clics d'interface, mais les interactions attendues entre les acteur·rices et le systeme.

### Feature: Consulter le parcours

```gherkin
Scenario: Consulter la presentation du produit
  Given une visiteuse ou un visiteur non authentifie
  When cette personne accede a la page d'accueil
  Then le systeme affiche la promesse du MicroSaaS
  And il presente le parcours ou ses modules principaux
```

```gherkin
Scenario: Consulter la liste des modules
  Given un·e apprenant·e connecte·e
  When cette personne accede a la page du parcours
  Then le systeme affiche les modules publies dans leur ordre prevu
  And chaque module affiche un titre et un etat de progression
```

```gherkin
Scenario: Consulter le detail d'un module
  Given un module publie existant
  When un·e apprenant·e ouvre la page du module
  Then le systeme affiche la description, l'objectif et les ressources associees
```

### Feature: Gerer la progression

```gherkin
Scenario: Marquer un module comme termine
  Given un·e apprenant·e connecte·e sur un module publie
  When cette personne marque le module comme termine
  Then le systeme enregistre la progression sur son compte
  And l'etat du module est mis a jour dans le parcours
```

```gherkin
Scenario: Afficher la progression globale
  Given un·e apprenant·e ayant deja valide un ou plusieurs modules
  When cette personne consulte son tableau de progression
  Then le systeme affiche le nombre de modules termines
  And il affiche le nombre de modules restants
```

### Feature: Authentification et securite

```gherkin
Scenario: Se connecter avec des identifiants valides
  Given un compte actif existant
  When l'utilisateur·rice soumet un identifiant valide et un mot de passe correct
  Then le systeme authentifie cette personne
  And il ouvre l'acces a l'espace apprenant
```

```gherkin
Scenario: Refuser l'acces a l'administration sans autorisation
  Given un compte authentifie sans role d'administration
  When l'utilisateur·rice tente d'acceder a une page d'administration
  Then le systeme refuse l'acces
  And il affiche un message adapte
```

### Feature: Gerer les contenus

```gherkin
Scenario: Creer un module
  Given un·e administrateur·rice authentifie·e
  When cette personne cree un module avec les informations minimales requises
  Then le systeme enregistre le module
  And le module peut ensuite etre publie
```

```gherkin
Scenario: Masquer un module
  Given un module deja publie
  When un·e administrateur·rice change son statut en masque
  Then le module n'apparait plus dans le parcours public
```

---

## 8. Diagrammes UML associes

Les diagrammes UML relies a cette etape sont stockes dans `docs/diagrams/`.

- diagramme de cas d'utilisation : `docs/diagrams/use-case.puml`
- export attendu : `docs/diagrams/use-case.png`
- diagramme de deploiement logique : `docs/diagrams/deployment.puml`
- export attendu : `docs/diagrams/deployment.png`

Le diagramme de cas d'utilisation couvre les interactions entre :

- `Visiteur·se`
- `Apprenant·e authentifie·e`
- `Administrateur·rice`
- le systeme `Parcours DevOps Guide`

---

## 9. Criteres d'acceptation V1

- un·e visiteur·se peut comprendre la promesse du produit depuis la page d'accueil
- un·e apprenant·e peut creer un compte et se connecter
- un·e apprenant·e peut consulter les modules publies
- un·e apprenant·e peut consulter le detail d'un module
- un·e apprenant·e peut marquer un module comme termine
- la progression globale est visible et cohérente
- un·e administrateur·rice peut creer, modifier et masquer un module
- les acces sont controles selon les roles

---

## 10. Decisions retenues pour la V1

Points precedemment ouverts, tranches avant la demonstration pour eviter de laisser des questions sans reponse pendant le pitch. Ils restent revisables si le mentor ou les pairs apportent un argument contraire (voir `docs/RETOURS.md`).

### Ressources multi-types des la V1 ?

**Decision : oui.** Un discriminant `resource_type` (`article` / `video` / `lien` / `checklist`) est deja porte par l'entite `RESOURCES` sans sous-entites dediees (cf. `docs/DATA_MODEL.md` §3 et §4). Le cout de modelisation est nul (un seul champ enum) et c'est deja reflete dans les wireframes (ecran 8) et la page de detail module.

### Pourcentage de progression ou seul un nombre de modules termines ?

**Decision : les deux.** Le nombre de modules termines/restants est affiche, complete par un pourcentage global calcule (`termines / total`), sans champ supplementaire en base : c'est une valeur derivee au moment de la lecture, pas une donnee stockee. Deja illustre dans le wireframe de l'ecran 5 (tableau de progression).

### Categories de modules des la V1 ?

**Decision : non, pas en V1.** Le MLD ne porte pas de champ `category` sur `modules` (seulement `display_order`), et la V1 ne compte que 8 modules (cf. `docs/PRESENTATION-MENTOR.md` §3.1) : une liste ordonnee unique reste lisible sans categorisation. Une categorisation est identifiee comme evolution possible en Phase 2/3 si le nombre de modules augmente significativement (cf. `docs/DATA_MODEL.md` §8).
