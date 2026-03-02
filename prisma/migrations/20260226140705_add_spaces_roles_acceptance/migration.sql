-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SpaceMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    CONSTRAINT "SpaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SpaceMember_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Phase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "spaceId" TEXT,
    CONSTRAINT "Phase_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Phase" ("id", "name", "order") SELECT "id", "name", "order" FROM "Phase";
DROP TABLE "Phase";
ALTER TABLE "new_Phase" RENAME TO "Phase";
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actionItem" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "startDate" DATETIME,
    "dueDate" DATETIME,
    "durationDays" INTEGER NOT NULL DEFAULT 0,
    "actualDays" INTEGER DEFAULT 0,
    "actualEndDate" DATETIME,
    "variance" TEXT,
    "evidence" TEXT,
    "actionType" TEXT,
    "ragRating" TEXT DEFAULT 'GREEN',
    "completedBy" TEXT,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "submittedById" TEXT,
    "ownerId" TEXT,
    "phaseId" TEXT NOT NULL,
    "spaceId" TEXT,
    "resources" TEXT,
    "estimatedCost" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("actionItem", "actionType", "actualDays", "actualEndDate", "completedBy", "createdAt", "dueDate", "durationDays", "estimatedCost", "evidence", "id", "notes", "ownerId", "phaseId", "priority", "ragRating", "resources", "startDate", "status", "updatedAt", "variance") SELECT "actionItem", "actionType", "actualDays", "actualEndDate", "completedBy", "createdAt", "dueDate", "durationDays", "estimatedCost", "evidence", "id", "notes", "ownerId", "phaseId", "priority", "ragRating", "resources", "startDate", "status", "updatedAt", "variance" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF'
);
INSERT INTO "new_User" ("email", "id", "name", "password", "role") SELECT "email", "id", "name", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SpaceMember_userId_spaceId_key" ON "SpaceMember"("userId", "spaceId");
