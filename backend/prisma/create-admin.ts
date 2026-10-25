import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

import { registerSchema } from "../src/schemas/auth.schema.js";

/**
 * Cree le premier compte administrateur.
 * L'email et le mot de passe sont fournis par des variables d'environnement :
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run create-admin
 * Le script peut etre relance sans risque : si le compte existe deja, il ne modifie rien.
 */
const prisma = new PrismaClient();

async function main() {
  // 1. Lire et verifier l'email et le mot de passe recus en variables d'environnement
  const parsed = registerSchema.safeParse({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  if (!parsed.success) {
    throw new Error("ADMIN_EMAIL ou ADMIN_PASSWORD manquant ou invalide");
  }
  const { email, password } = parsed.data;

  // 2. Si un compte existe deja avec cet email : afficher un message et s'arreter
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Un compte avec l'email ${email} existe deja, rien n'a ete modifie.`);
    return;
  }

  // 3. Hacher le mot de passe
  const hashedPassword = await argon2.hash(password);

  // 4. Creer l'utilisateur avec le role "admin"
  await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      role: { connect: { code: "admin" } },
    },
  });
  console.log(`Compte admin cree avec l'email ${email}.`);
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
