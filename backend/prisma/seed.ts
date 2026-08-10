import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
    resources: [{ resourceType: "article" as const, content: "https://example.org/ci-intro", displayOrder: 1 }],
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

async function main() {
  for (const { resources, ...module } of modules) {
    await prisma.module.upsert({
      where: { title: module.title },
      update: module,
      create: { ...module, resources: { create: resources } },
    });
  }

  const adminPassword = await bcrypt.hash("admin-devops-guide", 10);
  await prisma.user.upsert({
    where: { email: "admin@parcours-devops-guide.local" },
    update: {},
    create: {
      email: "admin@parcours-devops-guide.local",
      password: adminPassword,
      role: "admin",
    },
  });

  const learnerPassword = await bcrypt.hash("apprenant-devops-guide", 10);
  const learner = await prisma.user.upsert({
    where: { email: "apprenant@parcours-devops-guide.local" },
    update: {},
    create: {
      email: "apprenant@parcours-devops-guide.local",
      password: learnerPassword,
      role: "learner",
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
