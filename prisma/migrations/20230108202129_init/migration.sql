/*
  Warnings:

  - You are about to drop the column `tg_id` on the `User` table. All the data in the column will be lost.
  - Added the required column `updated` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "is_bot" BOOLEAN,
    "first_name" TEXT,
    "language_code" TEXT,
    "currency" TEXT DEFAULT 'USD'
);
INSERT INTO "new_User" ("first_name", "id", "is_bot", "language_code", "username") SELECT "first_name", "id", "is_bot", "language_code", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "new_Expense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" REAL NOT NULL,
    "currency" TEXT DEFAULT 'USD',
    "category" TEXT NOT NULL,
    "comment" TEXT,
    "userId" INTEGER NOT NULL,
    "added" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL,
    CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Expense" ("amount", "category", "comment", "currency", "id", "userId") SELECT "amount", "category", "comment", "currency", "id", "userId" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
