-- CreateEnum
CREATE TYPE "user_role_enum" AS ENUM ('learner', 'admin');

-- CreateEnum
CREATE TYPE "module_publication_status_enum" AS ENUM ('draft', 'published', 'hidden');

-- CreateEnum
CREATE TYPE "resource_type_enum" AS ENUM ('article', 'video', 'link', 'checklist');

-- CreateEnum
CREATE TYPE "progress_status_enum" AS ENUM ('todo', 'in_progress', 'done');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "user_role_enum" NOT NULL DEFAULT 'learner',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "learning_objective" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL,
    "publication_status" "module_publication_status_enum" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "module_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "resource_type" "resource_type_enum" NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress" (
    "user_id" UUID NOT NULL,
    "module_id" UUID NOT NULL,
    "status" "progress_status_enum" NOT NULL DEFAULT 'todo',
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_pkey" PRIMARY KEY ("user_id","module_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "modules_title_key" ON "modules"("title");

-- CreateIndex
CREATE UNIQUE INDEX "modules_display_order_key" ON "modules"("display_order");

-- CreateIndex
CREATE INDEX "idx_modules_publication_status" ON "modules"("publication_status");

-- CreateIndex
CREATE INDEX "idx_resources_module_id" ON "resources"("module_id");

-- CreateIndex
CREATE INDEX "idx_progress_user_id" ON "progress"("user_id");

-- CreateIndex
CREATE INDEX "idx_progress_module_id" ON "progress"("module_id");

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress" ADD CONSTRAINT "progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress" ADD CONSTRAINT "progress_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
