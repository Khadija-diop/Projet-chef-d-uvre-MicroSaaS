-- AlterTable
ALTER TABLE "resources" ADD COLUMN "title" TEXT NOT NULL DEFAULT '';

-- AlterTable: drop the default once existing rows are backfilled by the seed
ALTER TABLE "resources" ALTER COLUMN "title" DROP DEFAULT;
