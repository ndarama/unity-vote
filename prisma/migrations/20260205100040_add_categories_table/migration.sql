/*
  Warnings:

  - You are about to drop the column `category` on the `contestants` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `contestants` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverPhotoUrl" TEXT NOT NULL,
    "icon" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "contestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- Create default categories from existing contestant categories
INSERT INTO "categories" ("id", "name", "description", "coverPhotoUrl", "displayOrder", "contestId", "createdAt", "updatedAt")
SELECT 
  'cat_' || MD5(c.category || c."contestId")::text AS id,
  c.category AS name,
  'Award category for ' || c.category AS description,
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800' AS "coverPhotoUrl",
  ROW_NUMBER() OVER (PARTITION BY c."contestId" ORDER BY c.category) AS "displayOrder",
  c."contestId",
  NOW() AS "createdAt",
  NOW() AS "updatedAt"
FROM (SELECT DISTINCT category, "contestId" FROM "contestants") c;

-- Add categoryId column with default
ALTER TABLE "contestants" ADD COLUMN "categoryId" TEXT;

-- Update contestants with categoryId from categories
UPDATE "contestants" co
SET "categoryId" = cat.id
FROM "categories" cat
WHERE cat.name = co.category 
  AND cat."contestId" = co."contestId";

-- Make categoryId required
ALTER TABLE "contestants" ALTER COLUMN "categoryId" SET NOT NULL;

-- DropIndex
DROP INDEX IF EXISTS "contestants_category_idx";

-- Drop the old category column
ALTER TABLE "contestants" DROP COLUMN "category";

-- CreateIndex
CREATE INDEX "categories_contestId_idx" ON "categories"("contestId");

-- CreateIndex
CREATE INDEX "categories_displayOrder_idx" ON "categories"("displayOrder");

-- CreateIndex
CREATE INDEX "contestants_categoryId_idx" ON "contestants"("categoryId");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contestants" ADD CONSTRAINT "contestants_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
