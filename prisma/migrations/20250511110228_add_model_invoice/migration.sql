/*
  Warnings:

  - Added the required column `invoiceId` to the `Income` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('ON_HOLD', 'PAID');

-- AlterTable
ALTER TABLE "Income" ADD COLUMN     "invoiceId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalBT" DOUBLE PRECISION NOT NULL,
    "totalInclTax" DOUBLE PRECISION NOT NULL,
    "client" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "status" "InvoiceStatus" NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
