/**
 * チームAPI
 *
 * リーグのチーム一覧を取得する機能を提供
 */

import { fetchFromAPI, createUrl } from './index';
import { withCache, createCacheKey } from './cache';
import { CACHE_TTL, LEAGUE_SLUG_MAPPING } from '@/config/api';

// 統一された型定義を使用
import type { Team, TeamDetail } from '@/types/type';
import type { ApiFootballTeamDetailRaw } from './types/team';

/**
 * 変換後のチーム情報の型定義
 * @deprecated UiTeamInfo または TeamCardInfo を使用してください
 */
export interface FormattedTeam {
  id: string;
  name: string;
  shortName: string;
  tla: string | null;
  crest: string;
  address?: string;
  venue?: string;
  venueCapacity?: number;
  colors?: string;
  founded?: number;
  country?: string;
}

/**
 * APIから返されるチーム情報をアプリで使用する形式に変換
 *
 * @param teamDetails API-Footballから返されるチーム情報
 * @returns 変換後のチーム情報
 * @deprecated 新しい変換ユーティリティを使用してください
 */
function formatTeam(teamDetails: ApiFootballTeamDetailRaw): FormattedTeam {
  return {
    id: teamDetails.team.id.toString(),
    name: teamDetails.team.name,
    shortName: teamDetails.team.name,
    tla: teamDetails.team.code,
    crest: teamDetails.team.logo,
    address: teamDetails.venue?.address,
    venue: teamDetails.venue?.name,
    venueCapacity: teamDetails.venue?.capacity,
    founded: teamDetails.team.founded,
    country: teamDetails.team.country,
  };
}

/**
 * リーグに所属するチーム一覧を取得
 *
 * @param leagueId リーグID
 * @param season シーズン
 * @param forceRefresh キャッシュを強制更新するかどうか
 * @returns チーム情報の配列
 */
export async function getLeagueTeams(
  leagueId: number | string,
  season: number | string,
  forceRefresh: boolean = false
): Promise<FormattedTeam[]> {
  // キャッシュキーを作成
  const cacheParams = { league: leagueId, season };
  const cacheKey = createCacheKey('league-teams', cacheParams);
  const cacheTTL = CACHE_TTL.LONG; // 1日

  return withCache(
    cacheKey,
    async () => {
      const url = createUrl('/teams', { league: leagueId, season });
      const data = await fetchFromAPI(url);

      if (!data.response || data.response.length === 0) {
        return [];
      }

      // チーム情報を変換して返す
      return data.response.map((teamData: ApiFootballTeamDetailRaw) => formatTeam(teamData));
    },
    cacheTTL,
    forceRefresh
  );
}

/**
 * リーグのスラグからチーム一覧を取得
 *
 * @param slug リーグスラグ（例: premier-league）
 * @param season シーズン
 * @param forceRefresh キャッシュを強制更新するかどうか
 * @returns チーム情報の配列
 */
export async function getLeagueTeamsBySlug(
  slug: string,
  season: number | string,
  forceRefresh: boolean = false
): Promise<FormattedTeam[]> {
  // スラグからリーグIDを検索
  const leagueId = LEAGUE_SLUG_MAPPING[slug];

  if (!leagueId) {
    console.error(`No league mapping found for slug: ${slug}`);
    return [];
  }

  return getLeagueTeams(leagueId, season, forceRefresh);
}
