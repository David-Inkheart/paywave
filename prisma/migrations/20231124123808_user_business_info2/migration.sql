/*
  Warnings:

  - You are about to drop the column `Country` on the `BusinessAccount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BusinessAccount" DROP COLUMN "Country",
ADD COLUMN     "country" "Country";
