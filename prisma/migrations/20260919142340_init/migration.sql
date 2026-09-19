-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "xId" VARCHAR(64),
    "xUsername" VARCHAR(255) NOT NULL,
    "xHandle" VARCHAR(255) NOT NULL,
    "xAvatar" TEXT,
    "totalPage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "coverUrl" TEXT,
    "title" VARCHAR(255) NOT NULL,
    "oneLiner" VARCHAR(500),
    "elo" INTEGER NOT NULL DEFAULT 1000,
    "bookmarked" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "pageId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" UUID NOT NULL,
    "voterId" UUID NOT NULL,
    "pageAId" UUID NOT NULL,
    "pageBId" UUID NOT NULL,
    "winnerId" UUID NOT NULL,
    "eloABefore" INTEGER NOT NULL,
    "eloBBefore" INTEGER NOT NULL,
    "eloAAfter" INTEGER NOT NULL,
    "eloBAfter" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_xId_key" ON "User"("xId");

-- CreateIndex
CREATE UNIQUE INDEX "User_xHandle_key" ON "User"("xHandle");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "Page_userId_createdAt_idx" ON "Page"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Page_elo_idx" ON "Page"("elo");

-- CreateIndex
CREATE INDEX "Bookmark_pageId_idx" ON "Bookmark"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_pageId_key" ON "Bookmark"("userId", "pageId");

-- CreateIndex
CREATE INDEX "Match_voterId_createdAt_idx" ON "Match"("voterId", "createdAt");

-- CreateIndex
CREATE INDEX "Match_pageAId_idx" ON "Match"("pageAId");

-- CreateIndex
CREATE INDEX "Match_pageBId_idx" ON "Match"("pageBId");

-- CreateIndex
CREATE INDEX "Match_winnerId_idx" ON "Match"("winnerId");

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_pageAId_fkey" FOREIGN KEY ("pageAId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_pageBId_fkey" FOREIGN KEY ("pageBId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
