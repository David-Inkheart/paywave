/*
  Warnings:

  - A unique constraint covering the columns `[accountNumber]` on the table `BusinessAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Country" AS ENUM ('Nigeria', 'Ghana', 'Kenya', 'Uganda');

-- AlterTable
ALTER TABLE "BusinessAccount" ADD COLUMN     "Country" "Country",
ADD COLUMN     "accountName" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankCode" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "streetAddress" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BusinessAccount_accountNumber_key" ON "BusinessAccount"("accountNumber");
