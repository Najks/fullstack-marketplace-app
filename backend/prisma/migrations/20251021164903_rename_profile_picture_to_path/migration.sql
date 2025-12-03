/*
  Warnings:

  - You are about to drop the column `profile_picture_hash` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "profile_picture_hash",
ADD COLUMN     "profile_picture_path" TEXT;
