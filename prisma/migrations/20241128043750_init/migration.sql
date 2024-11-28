/*
  Warnings:

  - You are about to drop the column `passangerId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the `Passanger` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `passengerId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_passangerId_fkey";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "passangerId",
ADD COLUMN     "passengerId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Passanger";

-- CreateTable
CREATE TABLE "Passenger" (
    "id" SERIAL NOT NULL,
    "title" "Title" NOT NULL,
    "name" TEXT NOT NULL,
    "familyName" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "nationality" TEXT NOT NULL,
    "identityNumber" TEXT NOT NULL,
    "issuingCountry" TEXT NOT NULL,
    "validUntil" TIMESTAMP(3),
    "deleteAt" TIMESTAMP(3),

    CONSTRAINT "Passenger_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
