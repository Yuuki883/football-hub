/**
 * チーム統計情報取得API
 *
 * 指定されたチーム、リーグ、シーズンの統計データを取得する
 */
import { fetchFromAPI, createUrl } from '@/lib/api-football/index';
import { TeamStats } from '../types/type';

/**
 * チームの統計情報を取得する
 */
export async function fetchTeamStats(
  teamId: number,
  leagueId: number,
  season: number = 2024
): Promise<TeamStats | null> {
  if (!teamId || !leagueId) {
    throw new Error('チームIDとリーグIDが必要です');
  }

  try {
    const url = createUrl('/teams/statistics', {
      team: teamId,
      league: leagueId,
      season,
    });

    const data = await fetchFromAPI(url);

    if (!data?.response) {
      console.error(
        `チーム統計データが見つかりません: teamId=${teamId}, leagueId=${leagueId}, season=${season}`
      );
      return null;
    }

    return data.response as TeamStats;
  } catch (error) {
    console.error(`チーム統計データの取得に失敗: teamId=${teamId}, leagueId=${leagueId}`, error);
    return null;
  }
}
