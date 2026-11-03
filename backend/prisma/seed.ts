import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";


const prisma = new PrismaClient();

/**
 * Contenu pedagogique original, redige pour ce projet (pas des liens externes).
 * Chaque texte suit la meme structure : pourquoi, concepts cles, exemple pratique,
 * pour aller plus loin.
 */
const lessons = {
  linux: `## Pourquoi ce module
Le terminal est l'outil de base pour administrer un serveur, executer des scripts et comprendre ce qui se passe reellement sur une machine. Avant d'utiliser Docker, Git ou Ansible, il faut etre a l'aise avec les commandes essentielles : se deplacer dans l'arborescence, lire et editer des fichiers, gerer les droits et les processus.

## Les concepts cles
- Arborescence : tout part de la racine /, chaque fichier a un chemin absolu (depuis /) ou relatif (depuis le dossier courant).
- Permissions : chaque fichier a un proprietaire, un groupe et des droits de lecture, ecriture et execution, modifiables avec chmod et chown.
- Processus : un programme en cours d'execution est identifie par un PID ; on peut les lister et les arreter.
- Variables d'environnement : des valeurs disponibles dans tout le shell, comme PATH ou HOME, qui influencent le comportement des commandes.

## Exemple pratique
Pour explorer un dossier : \`ls -la\` affiche tous les fichiers, y compris les caches, avec leurs permissions. \`cd\` suivi d'un chemin permet de s'y deplacer. \`pwd\` rappelle ou on se trouve. \`grep -r "erreur" /var/log\` cherche le mot "erreur" dans tous les fichiers d'un dossier, une premiere etape classique de diagnostic.

## Pour aller plus loin
Chaque commande a son propre manuel integre : \`man\` suivi du nom de la commande (par exemple \`man ls\`) donne la liste complete de ses options, directement dans le terminal.`,

  git: `## Pourquoi ce module
Git permet d'enregistrer l'historique des modifications d'un projet et de collaborer a plusieurs sans ecraser le travail des autres. C'est l'outil que ce projet utilise lui-meme, du premier commit jusqu'a la mise en production.

## Les concepts cles
- Commit : un instantane du projet a un moment donne, accompagne d'un message qui explique le changement.
- Branche : une ligne de developpement independante, utile pour travailler sur une fonctionnalite sans toucher au code principal.
- Pull request (ou merge request) : une proposition de fusionner une branche dans une autre, relue avant d'etre acceptee.
- Conflit : quand deux modifications touchent la meme ligne d'un fichier, Git demande de choisir laquelle garder.

## Exemple pratique
Un cycle de travail courant : \`git checkout -b ma-fonctionnalite\` cree une nouvelle branche. Apres avoir modifie du code, \`git add .\` puis \`git commit -m "Ajoute la fonctionnalite X"\` enregistre le changement. \`git push\` envoie la branche sur le depot distant, et une pull request est ouverte pour la faire relire avant de la fusionner dans la branche principale.

## Pour aller plus loin
\`git log --oneline --graph\` donne une vue rapide et lisible de l'historique d'un depot, tres utile pour comprendre ce qui s'est passe avant de modifier quoi que ce soit.`,

  docker: `## Pourquoi ce module
Un conteneur empaquete une application avec tout ce dont elle a besoin pour fonctionner (dependances, configuration, version du langage), ce qui evite le fameux "ca marche chez moi mais pas en production". Docker est l'outil le plus utilise pour creer et executer ces conteneurs.

## Les concepts cles
- Image : un modele en lecture seule, construit a partir d'un Dockerfile, qui decrit pas a pas comment assembler l'environnement.
- Conteneur : une instance en cours d'execution d'une image, isolee du reste du systeme mais partageant le noyau de la machine hote.
- Dockerfile : un fichier texte versionnable qui definit la construction de l'image (base, dependances, commande de demarrage).
- Registre (registry) : un entrepot d'images, comme Docker Hub, ou l'on publie et recupere des images.

## Exemple pratique
\`docker build -t mon-app .\` construit une image a partir du Dockerfile du dossier courant. \`docker run -p 3000:3000 mon-app\` demarre un conteneur et expose son port 3000 sur la machine hote. \`docker ps\` liste les conteneurs en cours d'execution, et \`docker logs <id>\` affiche leur sortie pour diagnostiquer un probleme.

## Pour aller plus loin
Un Dockerfile bien ecrit separe les etapes qui changent rarement (installation des dependances) de celles qui changent souvent (code applicatif), pour profiter du cache de build et accelerer les reconstructions.`,

  podman: `## Pourquoi ce module
Podman fait globalement la meme chose que Docker : construire et executer des conteneurs. La difference principale est qu'il n'a pas besoin d'un demon qui tourne en permanence avec les droits root, ce qui reduit la surface d'attaque sur un serveur.

## Les concepts cles
- Sans demon : chaque commande podman lance un processus independant, il n'y a pas de service central a securiser.
- Rootless : Podman peut executer des conteneurs sans privileges administrateur, un conteneur compromis a donc moins de droits sur la machine hote.
- Compatibilite Docker : la plupart des commandes Docker fonctionnent telles quelles avec Podman, souvent en remplacant juste le nom de la commande.
- Pods : Podman reprend la notion de pod de Kubernetes, un groupe de conteneurs qui partagent le meme reseau.

## Exemple pratique
\`podman build -t mon-app .\` et \`podman run -p 3000:3000 mon-app\` fonctionnent comme leurs equivalents Docker. Pour verifier qu'aucun demon ne tourne en arriere-plan, \`podman info\` montre que Podman communique directement avec le noyau Linux, sans service intermediaire.

## Pour aller plus loin
Sur une machine qui a deja Docker installe, la commande \`alias docker=podman\` permet de tester Podman sans changer ses habitudes ni ses scripts existants.`,

  ci: `## Pourquoi ce module
L'integration continue consiste a verifier automatiquement chaque changement de code (tests, lint, build) des qu'il est propose, pour detecter les problemes avant qu'ils n'atteignent la branche principale. Ce projet utilise lui-meme GitHub Actions pour ca.

## Les concepts cles
- Pipeline : une suite d'etapes automatisees (installer les dependances, lancer les tests, construire l'application) executee a chaque changement.
- Workflow : dans GitHub Actions, un fichier YAML qui decrit quand et comment le pipeline se declenche.
- Job : un ensemble d'etapes executees sur une machine virtuelle dediee ; plusieurs jobs peuvent tourner en parallele.
- Statut requis : un pipeline peut etre configure pour bloquer la fusion d'une pull request tant qu'il n'est pas vert.

## Exemple pratique
Un workflow minimal declenche sur chaque pull request : il installe les dependances avec \`npm ci\`, puis lance \`npm run lint\`, \`npm run typecheck\` et \`npm test\`. Si une seule de ces etapes echoue, le pipeline entier est marque en echec et la pull request l'affiche clairement.

## Pour aller plus loin
Faire echouer vite les etapes rapides (lint, typecheck) avant les etapes lentes (tests, build) donne un retour plus rapide a la personne qui a propose le changement.`,

  cd: `## Pourquoi ce module
Une fois qu'un changement a passe l'integration continue, le deploiement continu automatise sa mise en production, pour livrer plus souvent et avec moins de risques qu'une mise en production manuelle et rare.

## Les concepts cles
- Deploiement continu vs livraison continue : le premier met en production automatiquement apres chaque validation, le second prepare un artefact pret a deployer mais garde une validation manuelle avant la mise en ligne.
- Environnements : une application passe souvent par plusieurs etapes (developpement, recette, production), chacune avec sa propre configuration.
- Rollback : la capacite a revenir rapidement a la version precedente si un deploiement pose probleme.
- Deploiement progressif : deployer d'abord sur une petite partie du trafic (canary) avant de generaliser, pour limiter l'impact d'un bug.

## Exemple pratique
Un pipeline de deploiement type : apres un merge sur la branche principale, l'application est construite, l'image est publiee sur un registre, puis un service de deploiement applique la nouvelle version sur le serveur cible et verifie qu'elle repond correctement avant de couper l'ancienne.

## Pour aller plus loin
Avant d'automatiser le deploiement en production, il vaut mieux avoir des tests fiables et une facon simple de revenir en arriere : l'automatisation accelere aussi bien les succes que les erreurs.`,

  ansible: `## Pourquoi ce module
Une fois des serveurs crees, il faut les configurer : installer des paquets, copier des fichiers, demarrer des services. Ansible automatise cette configuration de facon reproductible, sans avoir besoin d'installer un agent sur les machines cibles.

## Les concepts cles
- Playbook : un fichier YAML qui decrit une liste de taches a appliquer sur un ou plusieurs serveurs.
- Inventaire : la liste des machines cibles, organisees eventuellement par groupes (serveurs web, bases de donnees, etc.).
- Module : une brique reutilisable qui realise une action precise (installer un paquet, copier un fichier, demarrer un service).
- Idempotence : relancer un playbook plusieurs fois ne doit rien casser ; Ansible ne rejoue une tache que si l'etat reel differe de l'etat attendu.

## Exemple pratique
Un playbook simple peut installer nginx sur un groupe de serveurs et s'assurer que le service est demarre. On le lance avec \`ansible-playbook -i inventaire.ini playbook.yml\`, qui se connecte en SSH a chaque machine listee et applique les taches dans l'ordre.

## Pour aller plus loin
Organiser ses taches en roles reutilisables (un role "nginx", un role "base de donnees") permet de partager et de reutiliser la configuration entre plusieurs projets.`,

  iac: `## Pourquoi ce module
Decrire son infrastructure (serveurs, reseaux, bases de donnees) dans des fichiers versionnes plutot que de la configurer a la main permet de la recreer a l'identique, de la relire comme du code et de la faire relire avant de l'appliquer.

## Les concepts cles
- Declaratif : on decrit l'etat souhaite (par exemple "trois serveurs avec telle configuration"), et l'outil se charge de l'atteindre, plutot que de lister les commandes a executer.
- State : la plupart des outils d'IaC gardent une trace de l'infrastructure qu'ils gerent, pour savoir quoi creer, modifier ou supprimer au prochain lancement.
- Idempotence : appliquer deux fois la meme description d'infrastructure doit produire le meme resultat, sans effet de bord.
- Plan avant application : un bon outil d'IaC montre ce qu'il va changer avant de le faire reellement.

## Exemple pratique
Avec un outil comme Terraform, on decrit une ressource (un serveur, par exemple) dans un fichier texte, puis \`terraform plan\` affiche les changements prevus, et \`terraform apply\` les applique reellement apres validation.

## Pour aller plus loin
L'Infrastructure as Code se marie bien avec la gestion de configuration (comme Ansible) : l'un cree les machines, l'autre les configure une fois creees.`,

  monitoring: `## Pourquoi ce module
Mettre une application en production ne suffit pas : il faut savoir si elle fonctionne correctement, detecter un probleme avant les utilisateurs et comprendre rapidement sa cause quand il survient.

## Les concepts cles
- Metriques : des valeurs numeriques suivies dans le temps (temps de reponse, taux d'erreur, utilisation CPU), utiles pour voir les tendances.
- Logs : la trace textuelle de ce que fait l'application, utile pour comprendre en detail un evenement precis.
- Alerte : une regle qui previent automatiquement une equipe quand une metrique depasse un seuil anormal.
- Disponibilite (uptime) : la proportion du temps pendant laquelle le service repond correctement, souvent exprimee en pourcentage.

## Exemple pratique
Un exemple courant : exposer un point \`/health\` sur l'API qui repond rapidement si l'application et sa base de donnees sont joignables, puis le faire interroger regulierement par un outil de supervision qui declenche une alerte en cas d'echec repete.

## Pour aller plus loin
Commencer petit suffit : quelques metriques essentielles (disponibilite, temps de reponse, taux d'erreur) bien suivies valent mieux qu'un tableau de bord surcharge que personne ne regarde.`,

  securiteWeb: `## Pourquoi ce module
Une application web expose une surface d'attaque directement accessible depuis internet. Connaitre les vulnerabilites les plus courantes permet de les eviter des la conception, plutot que de les corriger en urgence apres un incident.

## Les concepts cles
- Injection : quand une entree utilisateur non verifiee est executee comme du code ou une requete (par exemple une injection SQL), permettant de manipuler la base de donnees.
- XSS (Cross-Site Scripting) : quand une page affiche du contenu utilisateur non echappe, permettant d'executer du code dans le navigateur d'une victime.
- Controle d'acces casse : quand un utilisateur peut acceder a des donnees ou des actions qui ne devraient pas lui etre accessibles, faute de verification cote serveur.
- Mauvaise configuration de securite : des parametres par defaut laisses tels quels (en-tetes manquants, messages d'erreur trop detailles, comptes par defaut).

## Exemple pratique
Pour se proteger des injections, on utilise des requetes parametrees plutot que de concatener des chaines de caracteres dans une requete SQL. Pour se proteger du XSS, on echappe systematiquement le contenu affiche, en s'appuyant sur l'echappement automatique qu'offrent les frameworks modernes plutot que d'injecter du HTML a la main.

## Pour aller plus loin
L'OWASP Top 10 recense et met a jour regulierement les dix categories de vulnerabilites web les plus critiques : c'est la reference la plus largement reconnue du domaine pour prioriser ses efforts de securite.`,

  securiteDevops: `## Pourquoi ce module
La securite ne se limite pas au code de l'application : elle concerne aussi la chaine qui le construit et le deploie (depot de code, pipeline CI/CD, secrets, infrastructure). Un maillon faible dans cette chaine peut compromettre tout ce qu'elle livre.

## Les concepts cles
- Principe du moindre privilege : chaque personne, service ou cle d'API ne doit avoir que les droits strictement necessaires a sa tache.
- Gestion des secrets : les mots de passe, cles et jetons ne doivent jamais etre ecrits en clair dans le code ou versionnes dans Git, mais stockes dans un systeme dedie.
- Chaine d'approvisionnement logicielle : verifier l'origine et l'integrite des dependances et des images utilisees, pour eviter d'importer une vulnerabilite ou un code malveillant.
- Defense en profondeur : empiler plusieurs mesures de securite complementaires, pour qu'une seule faille ne suffise pas a tout compromettre.

## Exemple pratique
Un reflexe simple et tres efficace : ajouter un fichier \`.gitignore\` des le debut d'un projet pour exclure les fichiers \`.env\`, puis verifier regulierement qu'aucun secret n'a ete commite par erreur dans l'historique du depot.

## Pour aller plus loin
La plupart des incidents de securite ne viennent pas d'attaques sophistiquees mais d'erreurs basiques (secret expose, dependance obsolete, acces trop large) : les corriger en premier a souvent plus d'impact qu'un outil avance.`,
};

/** Titre affiche pour la ressource "article" de chaque module (distinct du contenu). */
const lessonTitles: Record<keyof typeof lessons, string> = {
  linux: "Les fondamentaux du terminal Linux",
  git: "Le workflow Git essentiel",
  docker: "Comprendre et utiliser Docker",
  podman: "Podman, l'alternative sans demon",
  ci: "Mettre en place l'integration continue",
  cd: "Automatiser le deploiement continu",
  iac: "Les principes de l'Infrastructure as Code",
  ansible: "Automatiser la configuration avec Ansible",
  monitoring: "Observer une application en production",
  securiteWeb: "Les vulnerabilites web courantes",
  securiteDevops: "Securiser la chaine de livraison",
};

/**
 * Ressource "video" de chaque module : des videos existantes et reconnues (pas produites
 * par nous), choisies pour completer la lecon. Verifiees une a une sur YouTube.
 */
const videos: Record<keyof typeof lessons, { title: string; url: string }> = {
  linux: { title: "Video : prendre en main le terminal Linux", url: "https://www.youtube.com/watch?v=sWbUDq4S6Y8" },
  git: { title: "Video : Git et GitHub de A a Z", url: "https://www.youtube.com/watch?v=RGOj5yH7evk" },
  docker: { title: "Video : Docker pour debutants", url: "https://www.youtube.com/watch?v=3c-iBn73dDE" },
  podman: { title: "Video : Podman, de zero a heros", url: "https://www.youtube.com/watch?v=YXfA5O5Mr18" },
  ci: { title: "Video : mettre en place GitHub Actions", url: "https://www.youtube.com/watch?v=mhw7eyTA4KQ" },
  cd: { title: "Video : comprendre le CI/CD en 8 minutes", url: "https://www.youtube.com/watch?v=ws1qGuFMYlc" },
  iac: { title: "Video : Terraform explique simplement", url: "https://www.youtube.com/watch?v=VxsLlPVhlQc" },
  ansible: { title: "Video : Ansible en 10 minutes", url: "https://www.youtube.com/watch?v=wKXdDCDqrTs" },
  monitoring: { title: "Video : Prometheus et Grafana expliques", url: "https://www.youtube.com/watch?v=x_xkKiRZbKA" },
  securiteWeb: { title: "Video : le Top 10 OWASP explique", url: "https://www.youtube.com/watch?v=xe9LN2w7hfE" },
  securiteDevops: { title: "Video : comprendre le DevSecOps", url: "https://www.youtube.com/watch?v=pnkeQ_olSz0" },
};

/** Ressource "checklist" de chaque module : contenu pratique original, redige pour ce projet. */
const checklists: Record<keyof typeof lessons, { title: string; content: string }> = {
  linux: {
    title: "Check-list : mon terminal Linux est pret",
    content: `Avant de passer aux modules suivants, verifie que tu es a l'aise avec ces bases.

- Se deplacer dans l'arborescence avec cd, pwd et ls -la
- Lire le contenu d'un fichier avec cat ou less
- Comprendre et modifier les permissions d'un fichier avec chmod
- Chercher un mot dans des fichiers avec grep -r
- Lister les processus en cours et en arreter un`,
  },
  git: {
    title: "Check-list avant un commit propre",
    content: `Quelques reflexes a prendre avant chaque commit.

- Lancer git status pour verifier ce qui va etre commite
- Relire son diff avec git diff avant de commiter
- Ecrire un message de commit qui explique le pourquoi, pas juste le quoi
- Verifier qu'aucun fichier .env ou secret n'est inclus
- Travailler sur une branche dediee plutot que directement sur la branche principale`,
  },
  docker: {
    title: "Check-list avant de conteneuriser une application",
    content: `A verifier avant de construire une image pour la production.

- Utiliser une image de base officielle et une version precise (pas latest)
- Ajouter un fichier .dockerignore pour exclure node_modules et les fichiers sensibles
- Ne pas faire tourner le processus en tant que root dans le conteneur
- Garder l'image la plus petite possible (multi-stage build si besoin)
- Verifier que les secrets ne sont jamais copies dans l'image`,
  },
  podman: {
    title: "Check-list pour passer de Docker a Podman",
    content: `Points a verifier avant de migrer une equipe ou un projet.

- Verifier que les commandes utilisees n'ont pas d'option propre au daemon Docker
- Tester le mode rootless sur un cas reel avant de generaliser
- Verifier la compatibilite des volumes et du reseau utilises
- Mettre a jour la documentation et les scripts CI qui appellent docker directement
- Confirmer que podman info ne montre aucun demon actif`,
  },
  ci: {
    title: "Check-list d'un pipeline CI fiable",
    content: `A verifier pour qu'un pipeline CI soit utile, pas juste present.

- Faire echouer vite les etapes rapides (lint, typecheck) avant les etapes lentes (tests, build)
- Executer le pipeline sur chaque pull request, pas seulement sur la branche principale
- Rendre le statut du pipeline requis avant de pouvoir fusionner
- Mettre en cache les dependances pour accelerer les executions
- Afficher clairement quelle etape a echoue et pourquoi`,
  },
  cd: {
    title: "Check-list avant un deploiement automatise",
    content: `A verifier avant d'automatiser completement une mise en production.

- Avoir une suite de tests fiable qui bloque un deploiement casse
- Prevoir un moyen simple de revenir a la version precedente (rollback)
- Verifier la configuration de chaque environnement (dev, recette, production)
- Ajouter une verification de sante apres le deploiement avant de couper l'ancienne version
- Informer l'equipe quand un deploiement reussit ou echoue`,
  },
  iac: {
    title: "Check-list avant un terraform apply",
    content: `A verifier avant d'appliquer un changement d'infrastructure.

- Lire integralement le resultat de terraform plan avant d'appliquer
- Verifier que le state est stocke dans un backend partage, pas en local
- Verser les fichiers .tf dans Git et les faire relire comme du code
- Verrouiller les versions du provider pour eviter un changement de comportement inattendu
- Ne jamais ecrire de secret en clair dans un fichier .tf`,
  },
  ansible: {
    title: "Check-list avant de lancer un playbook",
    content: `A verifier avant d'executer un playbook sur de vrais serveurs.

- Verifier l'inventaire : le bon groupe de machines est cible
- Lancer d'abord le playbook avec --check pour simuler sans rien modifier
- Verifier que les taches sont bien idempotentes
- Stocker les secrets avec Ansible Vault, jamais en clair dans le playbook
- Tester sur un seul serveur avant de generaliser a tout le parc`,
  },
  monitoring: {
    title: "Check-list observabilite minimale",
    content: `Le socle minimal pour savoir si une application va bien.

- Exposer un endpoint /health qui verifie l'application et ses dependances (base de donnees incluse)
- Suivre au moins trois metriques : disponibilite, temps de reponse, taux d'erreur
- Centraliser les logs plutot que de les laisser uniquement sur chaque serveur
- Configurer une alerte qui previent une personne en cas de probleme, pas juste un graphique
- Verifier regulierement que les alertes se declenchent vraiment (pas seulement en theorie)`,
  },
  securiteWeb: {
    title: "Check-list securite avant la mise en ligne",
    content: `Les reflexes de base contre les vulnerabilites web les plus courantes.

- Utiliser des requetes parametrees, jamais de concatenation de chaines dans une requete SQL
- Echapper systematiquement le contenu utilisateur affiche dans la page (protection XSS)
- Verifier les droits d'acces cote serveur, jamais seulement cote interface
- Ne jamais renvoyer de message d'erreur detaille (stack trace) a l'utilisateur
- Garder les dependances a jour pour eviter une vulnerabilite connue`,
  },
  securiteDevops: {
    title: "Check-list securite avant la mise en production",
    content: `A verifier sur la chaine complete, pas seulement sur le code applicatif.

- Verifier qu'aucun secret n'est present dans l'historique Git (pas seulement dans le code actuel)
- Donner a chaque service et chaque cle d'API uniquement les droits necessaires
- Verifier l'origine des dependances et des images utilisees
- Mettre a jour regulierement les dependances et les images de base
- Documenter qui a acces a quoi, et retirer les acces qui ne servent plus`,
  },
};

type QuizChoiceSeed = { label: string; isCorrect: boolean };
type QuizQuestionSeed = { prompt: string; choices: QuizChoiceSeed[] };

/**
 * Deux questions de quiz par module, pour l'auto-evaluation (issue #83).
 * Une seule reponse correcte par question.
 */
const quizzes: Record<string, QuizQuestionSeed[]> = {
  linux: [
    {
      prompt: "Quelle commande affiche les fichiers d'un dossier, y compris leurs permissions ?",
      choices: [
        { label: "ls -la", isCorrect: true },
        { label: "cd -la", isCorrect: false },
        { label: "pwd -la", isCorrect: false },
      ],
    },
    {
      prompt: "A quoi sert la variable d'environnement PATH ?",
      choices: [
        { label: "Elle liste les dossiers ou le shell cherche les commandes executables", isCorrect: true },
        { label: "Elle stocke le mot de passe de l'utilisateur", isCorrect: false },
        { label: "Elle definit la taille maximale d'un fichier", isCorrect: false },
      ],
    },
  ],
  git: [
    {
      prompt: "Que permet de faire une pull request ?",
      choices: [
        { label: "Proposer de fusionner une branche dans une autre, apres relecture", isCorrect: true },
        { label: "Supprimer definitivement l'historique d'un depot", isCorrect: false },
        { label: "Changer le mot de passe du compte Git", isCorrect: false },
      ],
    },
    {
      prompt: "Quelle commande enregistre un instantane du travail en cours, avec un message ?",
      choices: [
        { label: "git commit -m \"message\"", isCorrect: true },
        { label: "git branch -m \"message\"", isCorrect: false },
        { label: "git clone -m \"message\"", isCorrect: false },
      ],
    },
  ],
  docker: [
    {
      prompt: "Que decrit un Dockerfile ?",
      choices: [
        { label: "Les etapes pour construire une image Docker", isCorrect: true },
        { label: "La liste des conteneurs en cours d'execution", isCorrect: false },
        { label: "Les droits d'acces d'un utilisateur Linux", isCorrect: false },
      ],
    },
    {
      prompt: "Quelle est la difference entre une image et un conteneur ?",
      choices: [
        {
          label: "Une image est un modele en lecture seule, un conteneur en est une instance en cours d'execution",
          isCorrect: true,
        },
        { label: "Une image et un conteneur designent exactement la meme chose", isCorrect: false },
        { label: "Un conteneur sert a construire une image", isCorrect: false },
      ],
    },
  ],
  podman: [
    {
      prompt: "Quel est l'avantage principal de Podman par rapport a Docker ?",
      choices: [
        { label: "Il n'a pas besoin d'un demon tournant en permanence avec les droits root", isCorrect: true },
        { label: "Il ne peut executer que des images Windows", isCorrect: false },
        { label: "Il remplace completement le langage YAML", isCorrect: false },
      ],
    },
    {
      prompt: "Que signifie executer un conteneur en mode rootless ?",
      choices: [
        { label: "Le conteneur tourne sans privileges administrateur sur la machine hote", isCorrect: true },
        { label: "Le conteneur n'a pas de systeme de fichiers", isCorrect: false },
        { label: "Le conteneur ne peut pas acceder au reseau", isCorrect: false },
      ],
    },
  ],
  ci: [
    {
      prompt: "Que verifie typiquement un pipeline d'integration continue ?",
      choices: [
        { label: "Le lint, le typecheck, les tests et le build a chaque changement", isCorrect: true },
        { label: "Uniquement la taille du depot Git", isCorrect: false },
        { label: "Le nombre de contributeurs du projet", isCorrect: false },
      ],
    },
    {
      prompt: "Dans GitHub Actions, que decrit un fichier YAML de workflow ?",
      choices: [
        { label: "Quand et comment le pipeline se declenche et s'execute", isCorrect: true },
        { label: "Les droits d'acces des utilisateurs a la base de donnees", isCorrect: false },
        { label: "Le contenu de la page d'accueil du site", isCorrect: false },
      ],
    },
  ],
  cd: [
    {
      prompt: "Quelle est la difference entre livraison continue et deploiement continu ?",
      choices: [
        {
          label: "Le deploiement continu met en production automatiquement, la livraison continue garde une validation manuelle",
          isCorrect: true,
        },
        { label: "Ce sont deux noms pour exactement la meme pratique", isCorrect: false },
        { label: "La livraison continue concerne uniquement la base de donnees", isCorrect: false },
      ],
    },
    {
      prompt: "A quoi sert un rollback ?",
      choices: [
        { label: "A revenir rapidement a la version precedente si un deploiement pose probleme", isCorrect: true },
        { label: "A supprimer definitivement une branche Git", isCorrect: false },
        { label: "A augmenter automatiquement le nombre de serveurs", isCorrect: false },
      ],
    },
  ],
  iac: [
    {
      prompt: "Qu'est-ce qu'une approche declarative en Infrastructure as Code ?",
      choices: [
        { label: "On decrit l'etat souhaite, et l'outil se charge de l'atteindre", isCorrect: true },
        { label: "On ecrit la liste exacte des commandes a executer dans l'ordre", isCorrect: false },
        { label: "On configure l'infrastructure uniquement via une interface graphique", isCorrect: false },
      ],
    },
    {
      prompt: "A quoi sert la commande terraform plan ?",
      choices: [
        { label: "A afficher les changements prevus avant de les appliquer", isCorrect: true },
        { label: "A supprimer toute l'infrastructure immediatement", isCorrect: false },
        { label: "A installer Terraform sur la machine", isCorrect: false },
      ],
    },
  ],
  ansible: [
    {
      prompt: "Que decrit un playbook Ansible ?",
      choices: [
        { label: "Une liste de taches a appliquer sur un ou plusieurs serveurs", isCorrect: true },
        { label: "La liste des utilisateurs autorises a se connecter en SSH", isCorrect: false },
        { label: "Le code source d'une application", isCorrect: false },
      ],
    },
    {
      prompt: "Que garantit l'idempotence d'un playbook ?",
      choices: [
        { label: "Le relancer plusieurs fois produit le meme resultat sans rien casser", isCorrect: true },
        { label: "Il s'execute deux fois plus vite a chaque lancement", isCorrect: false },
        { label: "Il ne peut etre lance qu'une seule fois", isCorrect: false },
      ],
    },
  ],
  monitoring: [
    {
      prompt: "Quelle est la difference entre une metrique et un log ?",
      choices: [
        {
          label: "Une metrique est une valeur numerique suivie dans le temps, un log est une trace textuelle detaillee",
          isCorrect: true,
        },
        { label: "Une metrique et un log designent exactement la meme chose", isCorrect: false },
        { label: "Un log ne peut contenir que des erreurs", isCorrect: false },
      ],
    },
    {
      prompt: "A quoi sert une alerte de supervision ?",
      choices: [
        {
          label: "A prevenir automatiquement une equipe quand une metrique depasse un seuil anormal",
          isCorrect: true,
        },
        { label: "A ameliorer automatiquement les performances du serveur", isCorrect: false },
        { label: "A remplacer les tests automatises", isCorrect: false },
      ],
    },
  ],
  securiteWeb: [
    {
      prompt: "Qu'est-ce qu'une injection SQL ?",
      choices: [
        {
          label: "Une entree utilisateur non verifiee executee comme une requete, permettant de manipuler la base",
          isCorrect: true,
        },
        { label: "Un type de panne reseau", isCorrect: false },
        { label: "Une technique pour accelerer les requetes SQL", isCorrect: false },
      ],
    },
    {
      prompt: "Comment se proteger principalement du XSS ?",
      choices: [
        { label: "En echappant systematiquement le contenu utilisateur affiche dans la page", isCorrect: true },
        { label: "En augmentant la taille du mot de passe", isCorrect: false },
        { label: "En desactivant le pare-feu", isCorrect: false },
      ],
    },
  ],
  securiteDevops: [
    {
      prompt: "Que recommande le principe du moindre privilege ?",
      choices: [
        { label: "Donner uniquement les droits strictement necessaires a chaque tache", isCorrect: true },
        { label: "Donner tous les droits a tout le monde pour simplifier", isCorrect: false },
        { label: "Supprimer tous les comptes administrateur", isCorrect: false },
      ],
    },
    {
      prompt: "Quelle est la bonne pratique pour stocker un secret (mot de passe, cle API) ?",
      choices: [
        { label: "Dans un systeme de gestion des secrets dedie, jamais en clair dans Git", isCorrect: true },
        { label: "Directement en clair dans le fichier de code versionne", isCorrect: false },
        { label: "Dans un commentaire du code pour s'en souvenir facilement", isCorrect: false },
      ],
    },
  ],
};

type ExerciseSeed = { prompt: string; modelAnswer: string };

/**
 * Un exercice par module, concret sur ce depot (dogfooding, issue #84). Pas d'execution
 * de code : l'apprenant s'auto-corrige en comparant sa reponse a modelAnswer, revele
 * seulement apres soumission.
 */
const exercises: Record<keyof typeof lessons, ExerciseSeed> = {
  linux: {
    prompt:
      "Depuis un terminal, place-toi dans le dossier `backend` de ce projet, liste tous les fichiers (y compris caches) avec leurs permissions, puis trouve tous les fichiers `.ts` du dossier `src` qui contiennent le mot `AppError`. Note les deux commandes utilisees.",
    modelAnswer:
      "`cd backend && ls -la` liste les fichiers du dossier courant, y compris les caches (ceux qui commencent par un point), avec leurs permissions. Pour chercher `AppError` dans les fichiers `.ts` : `grep -r \"AppError\" src --include=\"*.ts\"` (ou `grep -rl` pour n'afficher que les noms de fichiers). Le flag `-r` rend la recherche recursive, `--include` filtre par extension.",
  },
  git: {
    prompt:
      "Sur une copie locale de ce depot, cree une branche nommee `exercice-git`, modifie un fichier, commite le changement avec un message clair, puis affiche l'historique sous forme compacte. Note les commandes utilisees, dans l'ordre.",
    modelAnswer:
      "`git checkout -b exercice-git` cree et bascule sur la nouvelle branche. Apres modification : `git add <fichier>` puis `git commit -m \"message qui explique le pourquoi du changement\"`. Enfin `git log --oneline --graph` affiche l'historique de maniere compacte et lisible.",
  },
  docker: {
    prompt:
      "Ecris un Dockerfile multi-stage pour le backend de ce projet (Node/Express/TypeScript) : une etape \"build\" qui installe les dependances et compile le TypeScript, et une etape finale plus legere qui ne contient que le code compile et les dependances de production. Decris le contenu des deux etapes.",
    modelAnswer:
      "Etape build : `FROM node:22-alpine AS build`, `WORKDIR /app`, `COPY package*.json ./`, `RUN npm ci`, `COPY . .`, `RUN npm run build` (produit `dist/`). Etape finale : `FROM node:22-alpine`, `WORKDIR /app`, `COPY package*.json ./`, `RUN npm ci --omit=dev`, `COPY --from=build /app/dist ./dist`, puis `CMD [\"node\", \"dist/server.js\"]`. Separer les deux etapes evite d'embarquer les devDependencies et les sources TypeScript dans l'image finale, qui reste donc plus legere et avec une surface d'attaque reduite.",
  },
  podman: {
    prompt:
      "En supposant que le Dockerfile de l'exercice precedent existe, quelles commandes Podman permettent de le construire puis de lancer le conteneur en exposant le port 3001 ? Explique en une phrase la difference avec l'equivalent Docker.",
    modelAnswer:
      "`podman build -t parcours-backend .` construit l'image, puis `podman run -p 3001:3001 parcours-backend` lance le conteneur, syntaxe quasiment identique a Docker. La difference principale : ces commandes s'executent par defaut sans privileges administrateur et sans demon en arriere-plan, donc un conteneur compromis a moins de droits sur la machine hote.",
  },
  ci: {
    prompt:
      "Dans `.github/workflows/ci.yml` de ce projet, identifie l'ordre des etapes du job backend. Pourquoi lint et typecheck sont-elles placees avant test et build, et que se passe-t-il si lint echoue ?",
    modelAnswer:
      "L'ordre est : `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Lint et typecheck sont rapides (pas de compilation ni de base de donnees) alors que test et build sont plus couteux : les placer en premier donne un retour rapide en cas d'erreur evidente. Si lint echoue, le job s'arrete a cette etape : typecheck, test et build ne sont pas executes, et le workflow est marque en echec.",
  },
  cd: {
    prompt:
      "Ce projet n'a pas encore de deploiement continu automatise. Decris en quelques etapes ce qu'un workflow de deploiement continu ajouterait apres que la CI ait reussi sur `master`, pour ce projet precis (backend Express + frontend Next.js).",
    modelAnswer:
      "Apres une CI verte sur `master` : construire les images Docker (backend et frontend), les publier sur un registre, puis se connecter au serveur cible pour tirer les nouvelles images et redemarrer les conteneurs. Avant de couper l'ancienne version, verifier que la nouvelle repond correctement (par exemple via `GET /health`). Prevoir aussi un rollback rapide vers l'image precedente en cas de probleme.",
  },
  iac: {
    prompt:
      "Ce projet decrit sa base Postgres avec Docker Compose en local. Si tu devais la decrire avec Terraform pour un hebergeur cloud, quelles informations la ressource devrait-elle contenir au minimum, et pourquoi executer `terraform plan` avant `terraform apply` ?",
    modelAnswer:
      "Au minimum : le type d'instance, la version de PostgreSQL, les identifiants de connexion (via un gestionnaire de secrets, jamais en clair), la taille de stockage, et les regles reseau qui n'autorisent que le backend a s'y connecter. `terraform plan` affiche les changements prevus sans rien modifier : cela evite par exemple de supprimer accidentellement une base existante avant de valider avec `terraform apply`.",
  },
  ansible: {
    prompt:
      "Decris les grandes lignes (sans le YAML complet) d'un playbook Ansible qui installerait Node.js 22 et cloneraient ce depot sur un serveur cible nomme \"web\".",
    modelAnswer:
      "Un inventaire listerait le groupe `web` avec l'adresse du serveur cible. Le playbook ciblerait ce groupe (`hosts: web`) avec des taches : mettre a jour le cache des paquets, installer Node.js 22, installer Git si absent, puis cloner ce depot avec le module `git` (`repo`, `dest`, `version`). Chaque tache doit etre idempotente : relancer le playbook plusieurs fois ne doit rien casser.",
  },
  monitoring: {
    prompt:
      "Ce projet expose deja `GET /health`. Que devrait repondre cet endpoint pour etre vraiment utile a un outil de supervision (au-dela de juste repondre 200), et quelles 2-3 metriques simples seraient pertinentes pour ce backend precis ?",
    modelAnswer:
      "Un `/health` utile verifie reellement les dependances critiques (par exemple une requete simple vers Postgres) et renvoie un code d'erreur explicite si l'une d'elles ne repond pas. Pour ce backend : le temps de reponse moyen des routes API, le taux d'erreurs 5xx, et le nombre de requetes bloquees par le rate limiting sur `/api/auth` (un pic peut signaler une tentative de force brute).",
  },
  securiteWeb: {
    prompt:
      "Dans ce code : `app.innerHTML = \"Bienvenue \" + userInput;` quelle vulnerabilite cela introduit-il, et comment ce projet evite-t-il ce probleme dans ses propres pages (regarde comment `lesson-content.tsx` affiche du texte) ?",
    modelAnswer:
      "C'est une faille XSS : si `userInput` contient du HTML/JavaScript, il serait execute dans le navigateur de la victime au lieu d'etre affiche comme texte. Ce projet laisse React afficher le texte via `{variable}` dans le JSX, ce qui echappe automatiquement le contenu — et `lesson-content.tsx` interprete seulement un format markdown-lite restreint, sans jamais utiliser `dangerouslySetInnerHTML`.",
  },
  securiteDevops: {
    prompt:
      "Un service de CI a besoin d'un token GitHub pour publier des releases. Ou ce token doit-il etre stocke pour ce projet, et que verifies-tu avant de committer un changement sur `backend/.env.example` pour eviter d'y laisser fuiter un vrai secret ?",
    modelAnswer:
      "Le token doit etre stocke comme secret chiffre dans les parametres du depot GitHub (Settings > Secrets and variables > Actions), jamais en clair dans un fichier versionne, et reference via `secrets.NOM_DU_SECRET`. Avant de committer `backend/.env.example` : verifier qu'il ne contient que des noms de variables avec des valeurs placeholder, jamais une vraie valeur copiee depuis un `.env` local, et relire le diff une derniere fois.",
  },
};

/**
 * Les 3 ressources d'un module (article redige, video existante, check-list originale),
 * dans cet ordre d'affichage, plus le quiz qui les evalue (issue #83/#84).
 */
function moduleResources(key: keyof typeof lessons) {
  return [
    { resourceType: "article" as const, title: lessonTitles[key], content: lessons[key], displayOrder: 1 },
    { resourceType: "video" as const, title: videos[key].title, content: videos[key].url, displayOrder: 2 },
    { resourceType: "checklist" as const, title: checklists[key].title, content: checklists[key].content, displayOrder: 3 },
  ];
}

const modules = [
  {
    displayOrder: 1,
    title: "Les bases de Linux et du terminal",
    shortDescription: "Prendre en main le terminal et les commandes essentielles.",
    learningObjective: "Etre autonome dans un terminal Linux pour les modules suivants.",
    publicationStatus: "published" as const,
    resources: moduleResources("linux"),
    quiz: quizzes.linux,
    exercise: exercises.linux,
  },
  {
    displayOrder: 2,
    title: "Git et le versioning",
    shortDescription: "Versionner son code et collaborer avec Git.",
    learningObjective: "Maitriser le cycle branche / commit / pull request.",
    publicationStatus: "published" as const,
    resources: moduleResources("git"),
    quiz: quizzes.git,
    exercise: exercises.git,
  },
  {
    displayOrder: 3,
    title: "Introduction a Docker",
    shortDescription: "Comprendre la conteneurisation et Docker.",
    learningObjective: "Construire et executer une image Docker simple.",
    publicationStatus: "published" as const,
    resources: moduleResources("docker"),
    quiz: quizzes.docker,
    exercise: exercises.docker,
  },
  {
    displayOrder: 4,
    title: "Podman, une alternative a Docker",
    shortDescription: "Decouvrir Podman et la conteneurisation sans daemon.",
    learningObjective: "Construire et executer un conteneur avec Podman.",
    publicationStatus: "published" as const,
    resources: moduleResources("podman"),
    quiz: quizzes.podman,
    exercise: exercises.podman,
  },
  {
    displayOrder: 5,
    title: "Integration continue (CI)",
    shortDescription: "Automatiser les verifications a chaque changement de code.",
    learningObjective: "Mettre en place un pipeline CI avec GitHub Actions.",
    publicationStatus: "published" as const,
    resources: moduleResources("ci"),
    quiz: quizzes.ci,
    exercise: exercises.ci,
  },
  {
    displayOrder: 6,
    title: "Deploiement continu (CD)",
    shortDescription: "Automatiser la livraison d'une application.",
    learningObjective: "Comprendre les strategies de deploiement continu.",
    publicationStatus: "published" as const,
    resources: moduleResources("cd"),
    quiz: quizzes.cd,
    exercise: exercises.cd,
  },
  {
    displayOrder: 7,
    title: "Infrastructure as Code",
    shortDescription: "Decrire son infrastructure dans du code versionne.",
    learningObjective: "Comprendre les principes de l'Infrastructure as Code.",
    publicationStatus: "draft" as const,
    resources: moduleResources("iac"),
    quiz: quizzes.iac,
    exercise: exercises.iac,
  },
  {
    displayOrder: 8,
    title: "Ansible et l'automatisation de configuration",
    shortDescription: "Automatiser la configuration de serveurs avec Ansible.",
    learningObjective: "Ecrire un playbook Ansible pour configurer un serveur cible.",
    publicationStatus: "published" as const,
    resources: moduleResources("ansible"),
    quiz: quizzes.ansible,
    exercise: exercises.ansible,
  },
  {
    displayOrder: 9,
    title: "Monitoring et observabilite",
    shortDescription: "Savoir si une application fonctionne correctement.",
    learningObjective: "Mettre en place des indicateurs de suivi basiques.",
    publicationStatus: "published" as const,
    resources: moduleResources("monitoring"),
    quiz: quizzes.monitoring,
    exercise: exercises.monitoring,
  },
  {
    displayOrder: 10,
    title: "Securite web",
    shortDescription: "Connaitre les vulnerabilites web courantes et comment s'en proteger.",
    learningObjective: "Identifier les risques OWASP Top 10 et appliquer les bonnes pratiques de base.",
    publicationStatus: "published" as const,
    resources: moduleResources("securiteWeb"),
    quiz: quizzes.securiteWeb,
    exercise: exercises.securiteWeb,
  },
  {
    displayOrder: 11,
    title: "Securite DevOps",
    shortDescription: "Appliquer les reflexes de securite applicative de base.",
    learningObjective: "Identifier et corriger les vulnerabilites courantes.",
    publicationStatus: "hidden" as const,
    resources: moduleResources("securiteDevops"),
    quiz: quizzes.securiteDevops,
    exercise: exercises.securiteDevops,
  },
];

/**
 * Une ressource peut desormais etre partagee par plusieurs modules (table de jointure
 * module_resources), donc on l'upsert par contenu (pas de create imbrique via Module).
 */
async function upsertResourceByContent(
  resourceType: (typeof modules)[number]["resources"][number]["resourceType"],
  title: string,
  content: string,
) {
  const existing = await prisma.resource.findFirst({ where: { content } });
  if (existing) {
    return prisma.resource.update({ where: { id: existing.id }, data: { title, resourceType } });
  }

  return prisma.resource.create({ data: { resourceType, title, content } });
}

/**
 * Recree le quiz d'un module a chaque execution (questions/choix repartis du contenu
 * ci-dessus), pour rester simple et idempotent plutot que de diffuser les changements.
 */
async function upsertQuiz(moduleId: string, questions: QuizQuestionSeed[]) {
  const quiz = await prisma.quiz.upsert({
    where: { moduleId },
    update: {},
    create: { moduleId },
  });

  await prisma.question.deleteMany({ where: { quizId: quiz.id } });

  for (const [questionIndex, question] of questions.entries()) {
    await prisma.question.create({
      data: {
        quizId: quiz.id,
        prompt: question.prompt,
        displayOrder: questionIndex + 1,
        choices: {
          create: question.choices.map((choice, choiceIndex) => ({
            label: choice.label,
            isCorrect: choice.isCorrect,
            displayOrder: choiceIndex + 1,
          })),
        },
      },
    });
  }
}

/**
 * Recree l'exercice d'un module a chaque execution, meme principe que upsertQuiz :
 * le contenu peut changer d'une execution a l'autre.
 */
async function upsertExercise(moduleId: string, { prompt, modelAnswer }: ExerciseSeed) {
  await prisma.exercise.upsert({
    where: { moduleId },
    update: { prompt, modelAnswer },
    create: { moduleId, prompt, modelAnswer },
  });
}

async function main() {
  
  if (process.env.NODE_ENV === "production") {
    throw new Error("Le seed de developpement ne doit pas etre lance en production");
  }
  await prisma.role.upsert({
    where: { code: "learner" },
    update: {},
    create: { code: "learner", libelle: "Apprenant", description: "Suit le parcours et enregistre sa progression" },
  });
  await prisma.role.upsert({
    where: { code: "admin" },
    update: {},
    create: { code: "admin", libelle: "Administrateur", description: "Gere les modules et les ressources" },
  });

  // Decale d'abord les modules existants vers des display_order temporaires et negatifs
  // (donc hors de la plage 1..N utilisee ci-dessous) pour eviter toute collision avec la
  // contrainte unique display_order quand un reordonnancement change l'ordre des modules.
  const existingModules = await prisma.module.findMany({ select: { id: true } });
  for (const [index, existing] of existingModules.entries()) {
    await prisma.module.update({ where: { id: existing.id }, data: { displayOrder: -(index + 1) } });
  }

  for (const { resources, quiz, exercise, ...module } of modules) {
    const createdModule = await prisma.module.upsert({
      where: { title: module.title },
      update: module,
      create: module,
    });

    // Le contenu d'une ressource peut changer d'une execution a l'autre (texte redige).
    // On repart des liaisons de ce module pour ne garder que celles definies ci-dessus,
    // plutot que d'accumuler d'anciennes ressources (ex. placeholders example.org).
    await prisma.moduleResource.deleteMany({ where: { moduleId: createdModule.id } });

    for (const { resourceType, title, content, displayOrder } of resources) {
      const resource = await upsertResourceByContent(resourceType, title, content);

      await prisma.moduleResource.create({
        data: { moduleId: createdModule.id, resourceId: resource.id, displayOrder },
      });
    }

    await upsertQuiz(createdModule.id, quiz);
    await upsertExercise(createdModule.id, exercise);
  }

  // Supprime les ressources qui ne sont plus rattachees a aucun module (anciens placeholders).
  await prisma.resource.deleteMany({ where: { modules: { none: {} } } });

  const adminPassword = await argon2.hash("admin-devops-guide");
  await prisma.user.upsert({
    where: { email: "admin@parcours-devops-guide.local" },
    update: {},
    create: {
      email: "admin@parcours-devops-guide.local",
      passwordHash: adminPassword,
      role: { connect: { code: "admin" } },
    },
  });

  const learnerPassword = await argon2.hash("apprenant-devops-guide");
  const learner = await prisma.user.upsert({
    where: { email: "apprenant@parcours-devops-guide.local" },
    update: {},
    create: {
      email: "apprenant@parcours-devops-guide.local",
      passwordHash: learnerPassword,
      role: { connect: { code: "learner" } },
    },
  });

  const linuxModule = await prisma.module.findUniqueOrThrow({ where: { title: modules[0].title } });
  const gitModule = await prisma.module.findUniqueOrThrow({ where: { title: modules[1].title } });
  const dockerModule = await prisma.module.findUniqueOrThrow({ where: { title: modules[2].title } });

  await prisma.progress.upsert({
    where: { userId_moduleId: { userId: learner.id, moduleId: linuxModule.id } },
    update: { status: "done" },
    create: { userId: learner.id, moduleId: linuxModule.id, status: "done" },
  });
  await prisma.progress.upsert({
    where: { userId_moduleId: { userId: learner.id, moduleId: gitModule.id } },
    update: { status: "done" },
    create: { userId: learner.id, moduleId: gitModule.id, status: "done" },
  });
  await prisma.progress.upsert({
    where: { userId_moduleId: { userId: learner.id, moduleId: dockerModule.id } },
    update: { status: "in_progress" },
    create: { userId: learner.id, moduleId: dockerModule.id, status: "in_progress" },
  });
}

main()
  .then(async () => {
  await prisma.$disconnect();
})
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
