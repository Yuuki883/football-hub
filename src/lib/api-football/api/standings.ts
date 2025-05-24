/**
 * 順位表API
 *
 * リーグの順位表を取得する機能を提供
 * UEFA主要大会（複数グループ）にも対応
 */

import { fetchFromAPI, createUrl } from '../client/index';
import { withCache, createCacheKey } from '../client/cache';
import { CACHE_TTL, LEAGUE_SLUG_MAPPING } from '@/config/api';
import {
  StandingGroup,
  ApiFootballTeamStanding,
  FormattedStanding,
  FormattedStandingGroup,
} from '../types/standing';

// UEFAの主要大会（複数グループ構成）
const MULTI_GROUP_LEAGUES = [2, 3, 848]; // Champions League, Europa League, Conference League

import { formatStanding } from '../utils/data-formatters';

/**
 * リーグの順位表を取得
 *
 * @param leagueId リーグID
 * @param season シーズン
 * @param forceRefresh キャッシュを強制更新するかどうか
 * @returns 順位表データ
 */
export async function getStandings(
  leagueId: number | string,
  season: number | string,
  forceRefresh: boolean = false
): Promise<FormattedStandingGroup[] | null> {
  // キャッシュキーを作成
  const cacheParams = { league: leagueId, season };
  const cacheKey = createCacheKey('standings', cacheParams);
  const cacheTTL = CACHE_TTL.MEDIUM; // 3時間

  return withCache(
    cacheKey,
    async () => {
      const url = createUrl('/standings', { league: leagueId, season });
      const data = await fetchFromAPI(url);

      if (!data.response || data.response.length === 0) {
        return null;
      }

      const responseData = data.response[0]?.league;
      if (!responseData?.standings) {
        return null;
      }

      // 複数グループかどうかを判断
      const isMultiGroup =
        MULTI_GROUP_LEAGUES.includes(Number(leagueId)) || Array.isArray(responseData.standings[0]);

      if (isMultiGroup) {
        // 複数グループの場合（Champions Leagueなど）
        return responseData.standings.map((group: ApiFootballTeamStanding[], index: number) => {
          let groupName = `Group ${String.fromCharCode(65 + index)}`; // Group A, B, C...

          // グループ名がデータに含まれている場合はそれを使用
          if (group.length > 0 && group[0].group) {
            groupName = group[0].group;
          }

          return {
            groupName,
            standings: group.map((teamStanding) => formatStanding(teamStanding)),
          };
        });
      } else {
        // 単一グループの場合（通常のリーグ）
        return [
          {
            groupName: responseData.name || 'League Table',
            standings: responseData.standings.map((teamStanding: ApiFootballTeamStanding) =>
              formatStanding(teamStanding)
            ),
          },
        ];
      }
    },
    cacheTTL,
    forceRefresh
  );
}

/**
 * リーグのスラグから順位表を取得
 *
 * @param slug リーグスラグ（例: premier-league）
 * @param season シーズン
 * @param forceRefresh キャッシュを強制更新するかどうか
 * @returns 順位表データ
 */
export async function getStandingsBySlug(
  slug: string,
  season: number | string,
  forceRefresh: boolean = false
): Promise<FormattedStandingGroup[] | null> {
  // スラグからリーグIDを検索
  const leagueId = LEAGUE_SLUG_MAPPING[slug];

  if (!leagueId) {
    console.error(`No league mapping found for slug: ${slug}`);
    return null;
  }

  return getStandings(leagueId, season, forceRefresh);
}
