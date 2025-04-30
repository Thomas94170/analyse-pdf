/*
  Warnings:

  - A unique constraint covering the columns `[originalName]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Document_originalName_key" ON "Document"("originalName");
