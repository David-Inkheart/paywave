/*
  Warnings:

  - The `bankCode` column on the `BusinessAccount` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "BusinessAccount" DROP COLUMN "bankCode",
ADD COLUMN     "bankCode" INTEGER;
