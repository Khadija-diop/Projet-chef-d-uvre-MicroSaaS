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

const modules = [
  {
    displayOrder: 1,
    title: "Les bases de Linux et du terminal",
    shortDescription: "Prendre en main le terminal et les commandes essentielles.",
    learningObjective: "Etre autonome dans un terminal Linux pour les modules suivants.",
    publicationStatus: "published" as const,
    resources: [{ resourceType: "article" as const, content: lessons.linux, displayOrder: 1 }],
  },
  {
    displayOrder: 2,
    title: "Git et le versioning",
    shortDescription: "Versionner son code et collaborer avec Git.",
    learningObjective: "Maitriser le cycle branche / commit / pull request.",
    publicationStatus: "published" as const,
    resources: [{ resourceType: "article" as const, content: lessons.git, displayOrder: 1 }],
  },
  {
    displayOrder: 3,
    title: "Introduction a Docker",
    shortDescription: "Comprendre la conteneurisation et Docker.",
    learningObjective: "Construire et executer une image Docker simple.",
    publicationStatus: "published" as const,
    resources: [{ resourceType: "article" as const, content: lessons.docker, displayOrder: 1 }],
  },
  {
    displayOrder: 4,
    title: "Podman, une alternative a Docker",
    shortDescription: "Decouvrir Podman et la conteneurisation sans daemon.",
    learningObjective: "Construire et executer un conteneur avec Podman.",
    publicationStatus: "published" as const,
    resources: [{ resourceType: "article" as const, content: lessons.podman, displayOrder: 1 }],
  },
  {
    displayOrder: 5,
    title: "Integration continue (CI)",
    shortDescription: "Automatiser les verifications a chaque changement de code.",
    learningObjective: "Mettre en place un pipeline CI avec GitHub Actions.",
    publicationStatus: "published" as const,
    resources: [{ resourceType: "article" as const, content: lessons.ci, displayOrder: 1 }],
  },
  {
    displayOrder: 6,
    title: "Deploiement continu (CD)",
    shortDescription: "Automatiser la livraison d'une application.",
    learningObjective: "Comprendre les strategies de deploiement continu.",
    publicationStatus: "published" as const,
    resources: [{ resourceType: "article" as const, content: lessons.cd, displayOrder: 1 }],
  },
  {
    displayOrder: 7,
    title: "Infrastructure as Code",
    shortDescription: "Decrire son infrastructure dans du code versionne.",
    learningObjective: "Comprendre les principes de l'Infrastructure as Code.",
    publicationStatus: "draft" as const,
    resources: [{ resourceType: "article" as const, content: lessons.iac, displayOrder: 1 }],
  },
  {
    displayOrder: 8,
    title: "Ansible et l'automatisation de configuration",
    shortDescription: "Automatiser la configuration de serveurs avec Ansible.",
    learningObjective: "Ecrire un playbook Ansible pour configurer un serveur cible.",
    publicationStatus: "published" as const,
    resources: [{ resourceType: "article" as const, content: lessons.ansible, displayOrder: 1 }],
  },
  {
    displayOrder: 9,
    title: "Monitoring et observabilite",
    shortDescription: "Savoir si une application fonctionne correctement.",
    learningObjective: "Mettre en place des indicateurs de suivi basiques.",
    publicationStatus: "published" as const,
    resources: [{ resourceType: "article" as const, content: lessons.monitoring, displayOrder: 1 }],
  },
  {
    displayOrder: 10,
    title: "Securite web",
    shortDescription: "Connaitre les vulnerabilites web courantes et comment s'en proteger.",
    learningObjective: "Identifier les risques OWASP Top 10 et appliquer les bonnes pratiques de base.",
    publicationStatus: "published" as const,
    resources: [{ resourceType: "article" as const, content: lessons.securiteWeb, displayOrder: 1 }],
  },
  {
    displayOrder: 11,
    title: "Securite DevOps",
    shortDescription: "Appliquer les reflexes de securite applicative de base.",
    learningObjective: "Identifier et corriger les vulnerabilites courantes.",
    publicationStatus: "hidden" as const,
    resources: [{ resourceType: "article" as const, content: lessons.securiteDevops, displayOrder: 1 }],
  },
];

/**
 * Une ressource peut desormais etre partagee par plusieurs modules (table de jointure
 * module_resources), donc on l'upsert par contenu (pas de create imbrique via Module).
 */
async function upsertResourceByContent(resourceType: (typeof modules)[number]["resources"][number]["resourceType"], content: string) {
  const existing = await prisma.resource.findFirst({ where: { content } });
  if (existing) {
    return existing;
  }

  return prisma.resource.create({ data: { resourceType, content } });
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

  for (const { resources, ...module } of modules) {
    const createdModule = await prisma.module.upsert({
      where: { title: module.title },
      update: module,
      create: module,
    });

    // Le contenu d'une ressource peut changer d'une execution a l'autre (texte redige).
    // On repart des liaisons de ce module pour ne garder que celles definies ci-dessus,
    // plutot que d'accumuler d'anciennes ressources (ex. placeholders example.org).
    await prisma.moduleResource.deleteMany({ where: { moduleId: createdModule.id } });

    for (const { resourceType, content, displayOrder } of resources) {
      const resource = await upsertResourceByContent(resourceType, content);

      await prisma.moduleResource.create({
        data: { moduleId: createdModule.id, resourceId: resource.id, displayOrder },
      });
    }
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
