/**
 * 順位表API
 *
 * リーグの順位表を取得する機能を提供
 * UEFA主要大会（複数グループ）にも対応
 */

import { fetchFromAPI, createUrl } from './index';
import { withCache, createCacheKey } from './cache';
import { CACHE_TTL, LEAGUE_SLUG_MAPPING } from '@/config/api';
import {
  StandingGroup,
  TeamStanding,
  FormattedStanding,
  FormattedStandingGroup,
} from './types/standing';

// UEFAの主要大会（複数グループ構成）
const MULTI_GROUP_LEAGUES = [2, 3, 848]; // Champions League, Europa League, Conference League

/**
 * チーム順位データをアプリ内で統一された形式に変換
 *
 * @param standing API-Footballから返されるチーム順位データ
 * @returns 変換後のデータ
 */
function formatStanding(standing: TeamStanding): FormattedStanding {
  return {
    position: standing.rank,
    team: {
      id: standing.team.id.toString(),
      name: standing.team.name,
      shortName: standing.team.name,
      crest: standing.team.logo,
    },
    playedGames: standing.all.played,
    won: standing.all.win,
    draw: standing.all.draw,
    lost: standing.all.lose,
    points: standing.points,
    goalsFor: standing.all.goals.for,
    goalsAgainst: standing.all.goals.against,
    goalDifference: standing.goalsDiff,
    form: standing.form || undefined,
    description: standing.description,
  };
}

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
        return responseData.standings.map((group: TeamStanding[], index: number) => {
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
            standings: responseData.standings.map((teamStanding: TeamStanding) =>
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
