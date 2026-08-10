# DEMO SCRIPT - Prototype interactif Parcours DevOps Guide

## 1. Objet du document

Déroulé écran par écran de la démonstration du prototype, prévu pour la séquence 4 du pitch (~2:30, voir `docs/PITCH-SCRIPT.md`). Couvre le support principal, le support de secours, et ce qu'il faut dire à chaque étape.

## 2. Supports

| Support | Usage | Lien |
| --- | --- | --- |
| **Principal** — Figma, mode Present/Prototype | démo live, navigable au clic | voir `docs/DESIGN.md` §9 |
| **Secours** — `mes-guides/prototype.html` | si Figma est indisponible (réseau, compte) | fichier local, ouvrir dans un navigateur avant la séance |
| **Filet de sécurité** — captures d'écran | si aucun des deux ne fonctionne | à préparer : exporter 6 écrans clés depuis Figma en amont, les mettre dans un dossier local accessible hors-ligne |

**Avant la démo :** ouvrir les deux supports (Figma + `prototype.html`) dans des onglets séparés, testés au préalable sur la machine et le réseau qui serviront le jour J. Ne pas découvrir un problème de connexion pendant le pitch.

## 3. Déroulé (parcours principal, cf. `DESIGN.md` §7 et `PRD.md` §7)

| Étape | Écran | Action à l'écran | Ce qu'il faut dire |
| --- | --- | --- | --- |
| 1 | Accueil | arrivée sur la page publique | « Un·e visiteur·se arrive et comprend la promesse en quelques secondes » — pointer le hero et le CTA |
| 2 | Connexion | se connecter | « Authentification simple, un compte suffit pour commencer » |
| 3 | Liste des modules | consulter la liste, pointer la barre de progression globale | « Les modules publiés sont affichés dans leur ordre pédagogique, avec le statut de chacun » |
| 4 | Détail d'un module | ouvrir un module (ex. Docker), montrer les ressources associées | « Chaque module a un objectif clair et des ressources de plusieurs types — article, vidéo, lien, check-list » |
| 5 | Marquer terminé | cliquer sur « Marquer comme terminé » | « L'apprenant·e valide son avancement en un clic » |
| 6 | Progression mise à jour | retour sur la liste ou le tableau de progression | « La progression se met à jour immédiatement : nombre de modules terminés et pourcentage global » |

Optionnel si le temps le permet (2:30 est serré, à couper en premier si retard) :

| 7 | Administration | montrer la liste des modules côté admin | « Une administration minimale permet de créer, éditer, publier ou masquer un module » |

## 4. Points d'accessibilité à mentionner si le mentor pose la question (ne pas les dérouler spontanément, ça consomme du temps)

Déjà vérifiés sur `mes-guides/prototype.html` et à reproduire à l'identique dans les maquettes Figma (`docs/DESIGN.md` §9) :

- contrastes texte/fond vérifiés AA/AAA
- statuts jamais portés par la seule couleur (icône + libellé)
- focus clavier visible, lien d'évitement, focus déplacé sur le `h1` à chaque changement d'écran
- mises à jour de progression annoncées via une région `aria-live`

## 5. Répétition — checklist avant le jour J

- [ ] Tester le lien Figma en mode Présentation sur le réseau qui sera utilisé le jour de la soutenance
- [ ] Ouvrir `mes-guides/prototype.html` en local et vérifier qu'il fonctionne hors-ligne
- [ ] Exporter les 6 écrans clés en images, dans un dossier accessible sans connexion (filet de sécurité)
- [ ] Chronométrer une répétition complète du parcours (objectif : rester sous 2:30)
- [ ] Vérifier que le compte de démo utilisé a bien un module « en cours » et un module « à faire » visibles (évite un état vide peu parlant)

## 6. Après la démo

Noter dans `docs/RETOURS.md` toute réaction ou question du mentor/des pairs pendant la démo (pas seulement après le pitch) : ce sont souvent les retours les plus concrets.
