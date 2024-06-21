/*
  Warnings:

  - The primary key for the `UserRoom` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserRoom` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserRoom" DROP CONSTRAINT "UserRoom_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "UserRoom_pkey" PRIMARY KEY ("userId", "roomId");
