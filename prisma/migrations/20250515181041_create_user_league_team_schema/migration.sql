/*
  Warnings:

  - You are about to drop the column `competitionId` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `matchday` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `referee` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `seasonId` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `venue` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `shirtNumber` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `competitionId` on the `standings` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `standings` table. All the data in the column will be lost.
  - You are about to drop the column `playedGames` on the `standings` table. All the data in the column will be lost.
  - You are about to drop the column `seasonId` on the `standings` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `clubColors` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `crestUrl` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `founded` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `tla` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `venue` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the `advanced_stats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `analysis_dashboards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `api_usage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `competitions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `match_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `match_lineups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `match_stats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `player_stats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `predictions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `seasons` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `team_stats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_settings` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[leagueId,teamId,season]` on the table `standings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leagueId` to the `matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `players` table without a default value. This is not possible if the table is not empty.
  - Made the column `teamId` on table `players` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `leagueId` to the `standings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `played` to the `standings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `season` to the `standings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `standings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leagueId` to the `teams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "advanced_stats" DROP CONSTRAINT "advanced_stats_matchId_fkey";

-- DropForeignKey
ALTER TABLE "advanced_stats" DROP CONSTRAINT "player_advanced_stats_fkey";

-- DropForeignKey
ALTER TABLE "advanced_stats" DROP CONSTRAINT "team_advanced_stats_fkey";

-- DropForeignKey
ALTER TABLE "analysis_dashboards" DROP CONSTRAINT "analysis_dashboards_userId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_matchId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_userId_fkey";

-- DropForeignKey
ALTER TABLE "match_events" DROP CONSTRAINT "match_events_assistPlayerId_fkey";

-- DropForeignKey
ALTER TABLE "match_events" DROP CONSTRAINT "match_events_matchId_fkey";

-- DropForeignKey
ALTER TABLE "match_events" DROP CONSTRAINT "match_events_playerId_fkey";

-- DropForeignKey
ALTER TABLE "match_lineups" DROP CONSTRAINT "match_lineups_matchId_fkey";

-- DropForeignKey
ALTER TABLE "match_lineups" DROP CONSTRAINT "match_lineups_playerId_fkey";

-- DropForeignKey
ALTER TABLE "match_lineups" DROP CONSTRAINT "match_lineups_teamId_fkey";

-- DropForeignKey
ALTER TABLE "match_stats" DROP CONSTRAINT "match_stats_matchId_fkey";

-- DropForeignKey
ALTER TABLE "match_stats" DROP CONSTRAINT "match_stats_teamId_fkey";

-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_seasonId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "player_stats" DROP CONSTRAINT "player_stats_playerId_fkey";

-- DropForeignKey
ALTER TABLE "player_stats" DROP CONSTRAINT "player_stats_seasonId_fkey";

-- DropForeignKey
ALTER TABLE "players" DROP CONSTRAINT "players_teamId_fkey";

-- DropForeignKey
ALTER TABLE "predictions" DROP CONSTRAINT "predictions_matchId_fkey";

-- DropForeignKey
ALTER TABLE "predictions" DROP CONSTRAINT "predictions_userId_fkey";

-- DropForeignKey
ALTER TABLE "seasons" DROP CONSTRAINT "seasons_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "standings" DROP CONSTRAINT "standings_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "standings" DROP CONSTRAINT "standings_seasonId_fkey";

-- DropForeignKey
ALTER TABLE "team_stats" DROP CONSTRAINT "team_stats_seasonId_fkey";

-- DropForeignKey
ALTER TABLE "team_stats" DROP CONSTRAINT "team_stats_teamId_fkey";

-- DropForeignKey
ALTER TABLE "user_settings" DROP CONSTRAINT "user_settings_userId_fkey";

-- DropIndex
DROP INDEX "matches_competitionId_idx";

-- DropIndex
DROP INDEX "matches_seasonId_idx";

-- DropIndex
DROP INDEX "matches_startTime_idx";

-- DropIndex
DROP INDEX "standings_competitionId_idx";

-- DropIndex
DROP INDEX "standings_competitionId_seasonId_teamId_key";

-- DropIndex
DROP INDEX "standings_seasonId_idx";

-- AlterTable
ALTER TABLE "matches" DROP COLUMN "competitionId",
DROP COLUMN "lastUpdated",
DROP COLUMN "matchday",
DROP COLUMN "referee",
DROP COLUMN "seasonId",
DROP COLUMN "startTime",
DROP COLUMN "venue",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "leagueId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "players" DROP COLUMN "dateOfBirth",
DROP COLUMN "image",
DROP COLUMN "lastUpdated",
DROP COLUMN "shirtNumber",
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "teamId" SET NOT NULL;

-- AlterTable
ALTER TABLE "standings" DROP COLUMN "competitionId",
DROP COLUMN "lastUpdated",
DROP COLUMN "playedGames",
DROP COLUMN "seasonId",
ADD COLUMN     "leagueId" TEXT NOT NULL,
ADD COLUMN     "played" INTEGER NOT NULL,
ADD COLUMN     "season" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "points" DROP DEFAULT,
ALTER COLUMN "won" DROP DEFAULT,
ALTER COLUMN "draw" DROP DEFAULT,
ALTER COLUMN "lost" DROP DEFAULT,
ALTER COLUMN "goalsFor" DROP DEFAULT,
ALTER COLUMN "goalsAgainst" DROP DEFAULT,
ALTER COLUMN "goalDifference" DROP DEFAULT;

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "address",
DROP COLUMN "clubColors",
DROP COLUMN "crestUrl",
DROP COLUMN "founded",
DROP COLUMN "lastUpdated",
DROP COLUMN "tla",
DROP COLUMN "venue",
DROP COLUMN "website",
ADD COLUMN     "country" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "leagueId" TEXT NOT NULL,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "advanced_stats";

-- DropTable
DROP TABLE "analysis_dashboards";

-- DropTable
DROP TABLE "api_usage";

-- DropTable
DROP TABLE "comments";

-- DropTable
DROP TABLE "competitions";

-- DropTable
DROP TABLE "match_events";

-- DropTable
DROP TABLE "match_lineups";

-- DropTable
DROP TABLE "match_stats";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "player_stats";

-- DropTable
DROP TABLE "predictions";

-- DropTable
DROP TABLE "seasons";

-- DropTable
DROP TABLE "team_stats";

-- DropTable
DROP TABLE "user_settings";

-- DropEnum
DROP TYPE "EventType";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "Position";

-- CreateTable
CREATE TABLE "favorite_leagues" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_leagues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leagues" (
    "id" TEXT NOT NULL,
    "apiId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "logo" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leagues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorite_leagues_userId_idx" ON "favorite_leagues"("userId");

-- CreateIndex
CREATE INDEX "favorite_leagues_leagueId_idx" ON "favorite_leagues"("leagueId");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_leagues_userId_leagueId_key" ON "favorite_leagues"("userId", "leagueId");

-- CreateIndex
CREATE UNIQUE INDEX "leagues_apiId_key" ON "leagues"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "leagues_slug_key" ON "leagues"("slug");

-- CreateIndex
CREATE INDEX "leagues_country_idx" ON "leagues"("country");

-- CreateIndex
CREATE INDEX "leagues_slug_idx" ON "leagues"("slug");

-- CreateIndex
CREATE INDEX "matches_date_idx" ON "matches"("date");

-- CreateIndex
CREATE INDEX "matches_leagueId_idx" ON "matches"("leagueId");

-- CreateIndex
CREATE INDEX "standings_leagueId_idx" ON "standings"("leagueId");

-- CreateIndex
CREATE INDEX "standings_season_idx" ON "standings"("season");

-- CreateIndex
CREATE UNIQUE INDEX "standings_leagueId_teamId_season_key" ON "standings"("leagueId", "teamId", "season");

-- CreateIndex
CREATE INDEX "teams_leagueId_idx" ON "teams"("leagueId");

-- AddForeignKey
ALTER TABLE "favorite_leagues" ADD CONSTRAINT "favorite_leagues_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_leagues" ADD CONSTRAINT "favorite_leagues_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
