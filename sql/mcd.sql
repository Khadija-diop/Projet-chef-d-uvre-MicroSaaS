-- =============================================================================
-- MERISE - Modele Conceptuel de Donnees (MCD)
-- Projet : Parcours DevOps Guide
-- SGBD cible (plus tard) : PostgreSQL
--
-- Ce fichier ne contient pas de DDL executable : il formalise le MCD en SQL
-- commente pour versionner la meme information que docs/diagrams/mcd.puml
-- et docs/diagrams/img-mcd.png
-- =============================================================================

/*
 * ---------------------------------------------------------------------------
 * ENTITE : users (compte applicatif)
 * ---------------------------------------------------------------------------
 * Description :
 *   Personne disposant d'un compte pour se connecter et acceder au produit.
 *
 * Attributs conceptuels :
 *   email             identifiant de connexion (cle conceptuelle)
 *   password          mot de passe (a hasher en implementation)
 *   role              role applicatif (apprenant·e ou administrateur·rice)
 *   created_at        date de creation du compte
 *   updated_at        date de derniere mise a jour du compte
 *
 * Regles metier liees :
 *   - un email ne peut etre associe qu'a un seul compte
 *   - le role determine les actions autorisees (parcours vs administration)
 * ---------------------------------------------------------------------------
 */

/*
 * ---------------------------------------------------------------------------
 * ENTITE : modules (etape du parcours pedagogique)
 * ---------------------------------------------------------------------------
 * Description :
 *   Unite de contenu pedagogique ordonnee dans le parcours.
 *
 * Attributs conceptuels :
 *   title                 identifiant metier du module (cle conceptuelle)
 *   short_description     resume court
 *   learning_objective    objectif pedagogique explicite
 *   display_order         position dans le parcours (ordonnancement stable)
 *   publication_status    brouillon / publie / masque
 *   created_at            creation
 *   updated_at            mise a jour
 *
 * Regles metier liees :
 *   - display_order unique pour garantir un ordre sans ambiguite
 *   - un module masque n'apparait pas dans le parcours apprenant
 * ---------------------------------------------------------------------------
 */

/*
 * ---------------------------------------------------------------------------
 * ENTITE : resources (contenu rattache a un module)
 * ---------------------------------------------------------------------------
 * Description :
 *   Contenu associe a un module : article, video, lien ou checklist.
 *
 * Attributs conceptuels :
 *   content           identifiant / cible du contenu (cle conceptuelle)
 *   resource_type     nature du contenu (article, video, link, checklist)
 *   display_order     ordre d'affichage dans le module
 *   created_at        creation
 *   module_id         rattachement au module parent
 *
 * Regles metier liees :
 *   - une ressource appartient a exactement un module
 *   - le type est porte par resource_type sans sous-entite dediee en V1
 * ---------------------------------------------------------------------------
 */

/*
 * ---------------------------------------------------------------------------
 * ENTITE : progress (avancement utilisateur sur un module)
 * ---------------------------------------------------------------------------
 * Description :
 *   Etat d'avancement d'un·e apprenant·e sur un module donne.
 *   Materialise les associations Merise Suit et Concerne.
 *
 * Attributs conceptuels :
 *   module        module concerne (identifiant metier)
 *   status        etat de completion (a faire / termine)
 *   updated_at    derniere mise a jour de l'etat
 *
 * Cardinalites :
 *   users (0,n) -- Suit -- (1,1) progress
 *   progress (1,1) -- Concerne -- (0,n) modules
 *
 * Contrainte d'integrite (MLD/MPD) :
 *   (user_id, module_id) unique
 * ---------------------------------------------------------------------------
 */

/*
 * ---------------------------------------------------------------------------
 * ASSOCIATION : Contient (modules X resources)
 * ---------------------------------------------------------------------------
 * Cardinalites :
 *   modules (0,n) ---- contient ---- (1,1) resources
 * ---------------------------------------------------------------------------
 */

-- Fin du MCD (aucune instruction DDL obligatoire ci-dessous)
SELECT 1 AS mcd_documentation_ok;
