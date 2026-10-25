-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- Seed roles (replaces the values previously held by user_role_enum)
INSERT INTO "roles" ("code", "libelle", "description") VALUES
    ('learner', 'Apprenant', 'Suit le parcours et enregistre sa progression'),
    ('admin', 'Administrateur', 'Gere les modules et les ressources');

-- AlterTable users: add role_id, backfill from the old enum column, then make it required
ALTER TABLE "users" ADD COLUMN "role_id" UUID;

UPDATE "users"
SET "role_id" = (SELECT "id" FROM "roles" WHERE "roles"."code" = "users"."role"::text);

ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "idx_users_role_id" ON "users"("role_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropColumn + DropEnum: users.role is fully replaced by users.role_id -> roles.id
ALTER TABLE "users" DROP COLUMN "role";

DROP TYPE "user_role_enum";

-- CreateTable
CREATE TABLE "module_resources" (
    "module_id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "module_resources_pkey" PRIMARY KEY ("module_id","resource_id")
);

-- CreateIndex
CREATE INDEX "idx_module_resources_module_id" ON "module_resources"("module_id");

-- CreateIndex
CREATE INDEX "idx_module_resources_resource_id" ON "module_resources"("resource_id");

-- AddForeignKey
ALTER TABLE "module_resources" ADD CONSTRAINT "module_resources_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_resources" ADD CONSTRAINT "module_resources_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing resource -> module links into the join table
INSERT INTO "module_resources" ("module_id", "resource_id", "display_order")
SELECT "module_id", "id", "display_order" FROM "resources";

-- DropForeignKey + DropIndex + DropColumn: resources.module_id is fully replaced by module_resources
ALTER TABLE "resources" DROP CONSTRAINT "resources_module_id_fkey";

DROP INDEX "idx_resources_module_id";

ALTER TABLE "resources" DROP COLUMN "module_id";

ALTER TABLE "resources" DROP COLUMN "display_order";
