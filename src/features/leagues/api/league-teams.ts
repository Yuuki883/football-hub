/**
 * リーグチームAPI
 *
 * 特定リーグのチーム一覧を取得する機能を提供
 * lib/api-footballの共通機能を使用
 *  */

import { LEAGUE_ID_MAPPING, DEFAULT_SEASON } from '@/config/api';
import {
  getLeagueTeams as getTeamsFromAPI,
  getLeagueTeamsBySlug as getTeamsBySlugFromAPI,
  FormattedTeam,
} from '@/lib/api-football/teams-api';
import { getLeagueBySlug } from './league-info';

// 型定義をエクスポート
export type { FormattedTeam } from '@/lib/api-football/teams-api';

/**
 * リーグのチーム一覧を取得
 *
 * @param leagueIdOrSlug リーグID または スラグ
 * @param params 取得パラメータ
 * @returns チーム情報の配列
 */
export async function getLeagueTeams(
  leagueIdOrSlug: number | string,
  params: {
    season?: number | string;
    forceRefresh?: boolean;
  } = {}
): Promise<FormattedTeam[]> {
  // スラグの場合はIDに変換
  let leagueId = leagueIdOrSlug;

  if (typeof leagueIdOrSlug === 'string' && isNaN(Number(leagueIdOrSlug))) {
    // コード形式（PL, PDなど）の場合はマッピングを使用
    if (LEAGUE_ID_MAPPING[leagueIdOrSlug]) {
      leagueId = LEAGUE_ID_MAPPING[leagueIdOrSlug];
    } else {
      // スラグ形式（premier-league）の場合はスラグからリーグ情報を取得
      const league = await getLeagueBySlug(leagueIdOrSlug);
      if (!league) {
        console.error('リーグが見つかりませんでした:', leagueIdOrSlug);
        return [];
      }
      leagueId = league.league.id;
    }
  }

  const { season = DEFAULT_SEASON, forceRefresh = false } = params;

  // 共通機能を使用してチームデータを取得
  return getTeamsFromAPI(leagueId, season, forceRefresh);
}

/**
 * リーグスラグからチーム一覧を取得
 *
 * @param slug リーグスラグ（例: premier-league）
 * @param params 取得パラメータ
 * @returns チーム情報の配列
 */
export async function getLeagueTeamsBySlug(
  slug: string,
  params: {
    season?: number | string;
    forceRefresh?: boolean;
  } = {}
): Promise<FormattedTeam[]> {
  const { season = DEFAULT_SEASON, forceRefresh = false } = params;

  // 共通機能を使用してチームデータを取得
  return getTeamsBySlugFromAPI(slug, season, forceRefresh);
}
