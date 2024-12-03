/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PassengerCategory" AS ENUM ('Adult', 'Child', 'Baby');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "category" "PassengerCategory" NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "paymentMethod" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Unpaid';

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
