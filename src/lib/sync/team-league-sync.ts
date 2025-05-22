/**
 * チームとリーグのデータ同期モジュール
 *
 * API-Footballから取得したデータをデータベースに同期する機能を提供
 * お気に入り登録時にデータが存在しない場合に自動でデータを取得・保存
 */

import { prisma } from '@/lib/prisma/client';
import { getLeagueById } from '@/features/leagues/api/league-info';
import { getTeamById } from '@/features/teams/api/team-info';
import { LEAGUE_ID_MAPPING } from '@/config/api';

/**
 * APIからリーグデータを取得し、DBに保存
 *
 * @param apiId APIのリーグID
 * @returns 保存されたLeagueレコード、取得失敗時はnull
 */
export async function syncLeagueData(apiId: number) {
  try {
    `リーグデータ同期開始: apiId=${apiId}`;

    // 既に存在するか確認
    const existingLeague = await prisma.league.findUnique({
      where: { apiId },
    });

    if (existingLeague) {
      `リーグ(apiId=${apiId})は既に存在します`;
      return existingLeague;
    }

    // APIからデータ取得
    const leagueData = await getLeagueById(apiId);

    if (!leagueData) {
      console.error(`APIからリーグ(apiId=${apiId})のデータを取得できませんでした`);
      return null;
    }

    // リーグスラグを生成（リーグ名の小文字化、スペースをハイフンに変換）
    const slug = leagueData.league.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // DBに保存
    const league = await prisma.league.create({
      data: {
        apiId: leagueData.league.id,
        name: leagueData.league.name,
        country: leagueData.country.name,
        logo: leagueData.league.logo,
        slug,
      },
    });

    `リーグデータを同期しました: ${league.name} (apiId=${league.apiId})`;
    return league;
  } catch (error) {
    console.error(`リーグデータ同期エラー(apiId=${apiId}):`, error);
    return null;
  }
}

/**
 * APIからチームデータを取得し、DBに保存
 *
 * @param apiId APIのチームID
 * @returns 保存されたTeamレコード、取得失敗時はnull
 */
export async function syncTeamData(apiId: number) {
  try {
    `チームデータ同期開始: apiId=${apiId}`;

    // 既に存在するか確認
    const existingTeam = await prisma.team.findUnique({
      where: { apiId },
    });

    if (existingTeam) {
      `チーム(apiId=${apiId})は既に存在します`;
      return existingTeam;
    }

    // APIからデータ取得
    const teamData = await getTeamById(apiId);

    if (!teamData) {
      console.error(`APIからチーム(apiId=${apiId})のデータを取得できませんでした`);
      return null;
    }

    // チームのリーグを判定（デフォルトでプレミアリーグに所属とする）
    // 実際のアプリでは適切なリーグ判定ロジックが必要
    const defaultLeagueApiId = LEAGUE_ID_MAPPING.PL; // デフォルトはプレミアリーグ

    // リーグを取得または作成
    let league = await prisma.league.findUnique({
      where: { apiId: defaultLeagueApiId },
    });

    if (!league) {
      league = await syncLeagueData(defaultLeagueApiId);

      if (!league) {
        console.error(`チームのリーグデータが取得できませんでした`);
        return null;
      }
    }

    // DBに保存
    const team = await prisma.team.create({
      data: {
        apiId: teamData.team.id,
        name: teamData.team.name,
        shortName: teamData.team.code || null,
        country: teamData.team.country,
        logo: teamData.team.logo,
        leagueId: league.id,
      },
    });

    `チームデータを同期しました: ${team.name} (apiId=${team.apiId})`;
    return team;
  } catch (error) {
    console.error(`チームデータ同期エラー(apiId=${apiId}):`, error);
    return null;
  }
}
