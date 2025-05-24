/**
 * 選手統計API
 *
 * リーグの選手統計（得点王、アシスト王など）を取得する機能を提供。
 */

import { fetchFromAPI, createUrl } from '../client/index';
import { withCache, createCacheKey } from '../client/cache';
import { CACHE_TTL, LEAGUE_SLUG_MAPPING } from '@/config/api';
import { PlayerWithStats, FormattedPlayerStats, ApiFootballPlayer } from '../types/player';
// formatPlayerStats関数は統合データフォーマッターに移動
import { formatPlayerStats } from '../utils/data-formatters';

/**
 * 統計タイプの定義
 */
export type StatsType = 'scorers' | 'assists';

/**
 * リーグの選手統計ランキングを取得する共通関数
 *
 * @param statsType 統計タイプ（'scorers' または 'assists'）
 * @param leagueId リーグID
 * @param season シーズン
 * @param forceRefresh キャッシュを強制更新するかどうか
 * @returns 選手統計ランキングデータ
 */
export async function getLeaguePlayerStats(
  statsType: StatsType,
  leagueId: number | string,
  season: number | string,
  forceRefresh: boolean = false
): Promise<FormattedPlayerStats[]> {
  // 統計タイプに基づくパラメータ設定
  const endpoint = statsType === 'scorers' ? 'topscorers' : 'topassists';
  const cacheKey = createCacheKey(`top${endpoint}`, {
    league: leagueId,
    season,
  });
  const statTypeName = statsType === 'scorers' ? 'scorers' : 'assists';
  const cacheTTL = CACHE_TTL.MEDIUM; // 3時間

  return withCache(
    cacheKey,
    async () => {
      try {
        const url = createUrl(`/players/${endpoint}`, {
          league: leagueId,
          season,
        });
        const data = await fetchFromAPI(url);

        if (!data.response || data.response.length === 0) {
          return [];
        }

        // ランキングデータをフォーマット
        const formattedPlayers = data.response
          .map((player: PlayerWithStats) => formatPlayerStats(player))
          .filter(
            (player: FormattedPlayerStats | null): player is FormattedPlayerStats => player !== null
          );

        return formattedPlayers;
      } catch (error) {
        console.error(
          `Error fetching top ${statTypeName} for league ${leagueId}, season ${season}:`,
          error
        );
        return [];
      }
    },
    cacheTTL,
    forceRefresh
  );
}

/**
 * リーグの得点ランキングを取得
 *
 * @param leagueIdOrSlug リーグID または スラグ
 * @param season シーズン
 * @param forceRefresh キャッシュを強制更新するかどうか
 * @returns 得点ランキングデータ
 */
export async function getTopScorers(
  leagueIdOrSlug: number | string,
  season: number | string,
  forceRefresh: boolean = false
): Promise<FormattedPlayerStats[]> {
  // スラグかどうかを判定（文字列で数値に変換できない場合はスラグとみなす）
  if (typeof leagueIdOrSlug === 'string' && isNaN(Number(leagueIdOrSlug))) {
    // スラグとして処理
    const leagueId = LEAGUE_SLUG_MAPPING[leagueIdOrSlug];
    if (!leagueId) {
      console.error(`No league mapping found for slug: ${leagueIdOrSlug}`);
      return [];
    }
    return getLeaguePlayerStats('scorers', leagueId, season, forceRefresh);
  }

  // IDとして処理
  return getLeaguePlayerStats('scorers', leagueIdOrSlug, season, forceRefresh);
}

/**
 * リーグのアシストランキングを取得
 *
 * @param leagueIdOrSlug リーグID または スラグ
 * @param season シーズン
 * @param forceRefresh キャッシュを強制更新するかどうか
 * @returns アシストランキングデータ
 */
export async function getTopAssists(
  leagueIdOrSlug: number | string,
  season: number | string,
  forceRefresh: boolean = false
): Promise<FormattedPlayerStats[]> {
  // スラグかどうかを判定（文字列で数値に変換できない場合はスラグとみなす）
  if (typeof leagueIdOrSlug === 'string' && isNaN(Number(leagueIdOrSlug))) {
    // スラグとして処理
    const leagueId = LEAGUE_SLUG_MAPPING[leagueIdOrSlug];
    if (!leagueId) {
      console.error(`No league mapping found for slug: ${leagueIdOrSlug}`);
      return [];
    }
    return getLeaguePlayerStats('assists', leagueId, season, forceRefresh);
  }

  // IDとして処理
  return getLeaguePlayerStats('assists', leagueIdOrSlug, season, forceRefresh);
}
