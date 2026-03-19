/*
  Warnings:

  - You are about to drop the column `roomId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Complaint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Emergency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Complaint" DROP CONSTRAINT "Complaint_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Emergency" DROP CONSTRAINT "Emergency_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roomId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "roomId";

-- DropTable
DROP TABLE "Complaint";

-- DropTable
DROP TABLE "Emergency";

-- DropTable
DROP TABLE "Room";

-- DropEnum
DROP TYPE "ComplaintStatus";

-- DropEnum
DROP TYPE "EmergencyStatus";

-- DropEnum
DROP TYPE "Priority";

-- DropEnum
DROP TYPE "RoomType";
