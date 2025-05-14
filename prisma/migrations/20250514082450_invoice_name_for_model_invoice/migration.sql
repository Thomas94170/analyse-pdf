/*
  Warnings:

  - You are about to drop the column `number` on the `Invoice` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[invoiceName]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invoiceName` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Invoice_number_key";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "number",
ADD COLUMN     "invoiceName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceName_key" ON "Invoice"("invoiceName");
