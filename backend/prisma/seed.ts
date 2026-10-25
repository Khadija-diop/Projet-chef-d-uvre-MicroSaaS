import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";


const prisma = new PrismaClient();

const modules = [
  {
    displayOrder: 1,
    title: "Les bases de Linux et du terminal",
    shortDescription: "Prendre en main le terminal et les commandes essentielles.",
    learningObjective: "Etre autonome dans un terminal Linux pour les modules suivants.",
    publicationStatus: "published" as const,
    resources: [{ resourceType: "article" as const, content: "https://example.org/linux-bases", displayOrder: 1 }],
  },
  {
    displayOrder: 2,
    title: "Git et le versioning",
    shortDescription: "Versionner son code et collaborer avec Git.",
    learningObjective: "Maitriser le cycle branche / commit / pull request.",
    publicationStatus: "published" as const,
    resources: [{ resourceType: "article" as const, content: "https://example.org/git-versioning", displayOrder: 1 }],
  },
  {
    displayOrder: 3,
    title: "Introduction a Docker",
    shortDescription: "Comprendre la conteneurisation et Docker.",
    learningObjective: "Construire et executer une image Docker simple.",
    publicationStatus: "published" as const,
    resources: [{ resourceType: "video" as const, content: "https://example.org/docker-intro", displayOrder: 1 }],
  },
  {
    displayOrder: 4,
    title: "Integration continue (CI)",
    shortDescription: "Automatiser les verifications a chaque changement de code.",
    learningObjective: "Mettre en place un pipeline CI avec GitHub Actions.",
    publicationStatus: "published" as const,
    resources: [
      { resourceType: "article" as const, content: "https://example.org/ci-intro", displayOrder: 1 },
      { resourceType: "article" as const, content: "https://example.org/git-versioning", displayOrder: 2 },
    ],
  },
  {
    displayOrder: 5,
    title: "Deploiement continu (CD)",
    shortDescription: "Automatiser la livraison d'une application.",
    learningObjective: "Comprendre les strategies de deploiement continu.",
    publicationStatus: "published" as const,
    resources: [{ resourceType: "article" as const, content: "https://example.org/cd-intro", displayOrder: 1 }],
  },
  {
    displayOrder: 6,
    title: "Infrastructure as Code",
    shortDescription: "Decrire son infrastructure dans du code versionne.",
    learningObjective: "Comprendre les principes de l'Infrastructure as Code.",
    publicationStatus: "draft" as const,
    resources: [],
  },
  {
    displayOrder: 7,
    title: "Monitoring et observabilite",
    shortDescription: "Savoir si une application fonctionne correctement.",
    learningObjective: "Mettre en place des indicateurs de suivi basiques.",
    publicationStatus: "published" as const,
    resources: [{ resourceType: "link" as const, content: "https://example.org/monitoring", displayOrder: 1 }],
  },
  {
    displayOrder: 8,
    title: "Securite DevOps",
    shortDescription: "Appliquer les reflexes de securite applicative de base.",
    learningObjective: "Identifier et corriger les vulnerabilites courantes.",
    publicationStatus: "hidden" as const,
    resources: [],
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

  for (const { resources, ...module } of modules) {
    const createdModule = await prisma.module.upsert({
      where: { title: module.title },
      update: module,
      create: module,
    });

    for (const { resourceType, content, displayOrder } of resources) {
      const resource = await upsertResourceByContent(resourceType, content);

      await prisma.moduleResource.upsert({
        where: { moduleId_resourceId: { moduleId: createdModule.id, resourceId: resource.id } },
        update: { displayOrder },
        create: { moduleId: createdModule.id, resourceId: resource.id, displayOrder },
      });
    }
  }

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
