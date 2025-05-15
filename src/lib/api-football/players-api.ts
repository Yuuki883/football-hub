/**
 * 選手統計API
 *
 * リーグの選手統計（得点王、アシスト王など）を取得する機能を提供。
 */

import { fetchFromAPI, createUrl } from './index';
import { withCache, createCacheKey } from './cache';
import { CACHE_TTL, LEAGUE_SLUG_MAPPING } from '@/config/api';
import { PlayerWithStats, FormattedPlayerStats, ApiFootballPlayer } from './types/players';

/**
 * 選手統計データをアプリ内で統一された形式に変換
 *
 * @param player API-Footballから返される選手データ
 * @returns 変換後のデータ
 */
function formatPlayerStats(
  player: PlayerWithStats | ApiFootballPlayer
): FormattedPlayerStats | null {
  try {
    // API-Football形式のデータかどうかをチェック
    const isApiFootballFormat = 'player' in player && 'statistics' in player;

    // 入力データが適切な形式であることを確認
    if (!player || !player.statistics || player.statistics.length === 0) {
      console.warn('Invalid player data or missing statistics:', player);
      return null;
    }

    let playerInfo: any;
    let statistics: any;

    if (isApiFootballFormat) {
      // ApiFootballPlayer形式の場合
      playerInfo = (player as ApiFootballPlayer).player;
      statistics = (player as ApiFootballPlayer).statistics[0];
    } else {
      // PlayerWithStats形式の場合
      playerInfo = player;
      statistics = (player as PlayerWithStats).statistics[0];
    }

    // player.idが存在しない場合のフォールバック処理
    const playerId = playerInfo.id
      ? playerInfo.id.toString()
      : `unknown-${Math.random().toString(36).substring(7)}`;

    return {
      id: playerId,
      name: playerInfo.name || 'Unknown Player',
      age: playerInfo.age || 0,
      position: statistics.games?.position || 'Unknown',
      nationality: playerInfo.nationality || '',
      photo: playerInfo.photo || '',
      team: statistics.team
        ? {
            id: statistics.team.id?.toString() || '0',
            name: statistics.team.name || 'Unknown Team',
            logo: statistics.team.logo || '',
          }
        : undefined,
      goals: statistics.goals?.total || 0,
      assists: statistics.goals?.assists || 0,
      appearances: statistics.games?.appearences || 0,
      minutes: statistics.games?.minutes || 0,
      rating: statistics.games?.rating || '',
      cards: {
        yellow: statistics.cards?.yellow || 0,
        red: statistics.cards?.red || 0,
      },
    };
  } catch (error) {
    console.error('Error formatting player stats:', error, player);
    return null;
  }
}

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
export async function getPlayerStats(
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
    return getPlayerStats('scorers', leagueId, season, forceRefresh);
  }

  // IDとして処理
  return getPlayerStats('scorers', leagueIdOrSlug, season, forceRefresh);
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
    return getPlayerStats('assists', leagueId, season, forceRefresh);
  }

  // IDとして処理
  return getPlayerStats('assists', leagueIdOrSlug, season, forceRefresh);
}
