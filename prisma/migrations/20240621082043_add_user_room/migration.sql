/*
  Warnings:

  - Added the required column `creatorId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "creatorId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "UserRoom" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRoom_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserRoom" ADD CONSTRAINT "UserRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
