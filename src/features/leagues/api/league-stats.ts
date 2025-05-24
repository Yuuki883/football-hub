/**
 * リーグ統計API
 *
 * 特定リーグの選手統計データを取得する機能を提供
 * lib/api-footballの共通機能を使用
 */

import { LEAGUE_ID_MAPPING, DEFAULT_SEASON } from '@/config/api';
import { getTopScorers, getTopAssists } from '@/lib/api-football/api-football';
import type { FormattedPlayerStats } from '@/lib/api-football/api-football';

/**
 * リーグの得点ランキングを取得
 *
 * @param leagueIdOrSlug リーグID または スラグ
 * @param season シーズン（指定なしの場合はデフォルトシーズン）
 * @param forceRefresh キャッシュを無視して強制的に更新する場合はtrue
 * @returns 得点ランキングデータ
 */
export async function getLeagueTopScorers(
  leagueIdOrSlug: number | string,
  season: number | string = DEFAULT_SEASON,
  forceRefresh: boolean = false
): Promise<FormattedPlayerStats[]> {
  try {
    // リーグ短縮コード（PL=プレミアリーグ、PD=ラ・リーガなど）を内部IDに変換
    if (typeof leagueIdOrSlug === 'string' && LEAGUE_ID_MAPPING[leagueIdOrSlug]) {
      leagueIdOrSlug = LEAGUE_ID_MAPPING[leagueIdOrSlug];
    }

    // リーグIDまたはスラグを使用して得点ランキングを取得
    return getTopScorers(leagueIdOrSlug, season, forceRefresh);
  } catch (error) {
    console.error(
      `得点ランキングの取得中にエラーが発生しました - リーグ:${leagueIdOrSlug}, シーズン:${season}:`,
      error
    );
    return [];
  }
}

/**
 * リーグのアシストランキングを取得
 *
 * @param leagueIdOrSlug リーグID または スラグ
 * @param season シーズン（指定なしの場合はデフォルトシーズン）
 * @param forceRefresh キャッシュを無視して強制的に更新する場合はtrue
 * @returns アシストランキングデータ
 */
export async function getLeagueTopAssists(
  leagueIdOrSlug: number | string,
  season: number | string = DEFAULT_SEASON,
  forceRefresh: boolean = false
): Promise<FormattedPlayerStats[]> {
  try {
    // リーグ短縮コード（PL=プレミアリーグ、PD=ラ・リーガなど）を内部IDに変換
    if (typeof leagueIdOrSlug === 'string' && LEAGUE_ID_MAPPING[leagueIdOrSlug]) {
      leagueIdOrSlug = LEAGUE_ID_MAPPING[leagueIdOrSlug];
    }

    // リーグIDまたはスラグを使用してアシストランキングを取得
    return getTopAssists(leagueIdOrSlug, season, forceRefresh);
  } catch (error) {
    console.error(
      `アシストランキングの取得中にエラーが発生しました - リーグ:${leagueIdOrSlug}, シーズン:${season}:`,
      error
    );
    return [];
  }
}

/**
 * リーグの統計情報（得点ランキング、アシストランキングなど）を取得
 *
 * @param leagueIdOrSlug リーグID または スラグ
 * @param params パラメータオブジェクト
 * @returns 統計情報オブジェクト
 */
export async function getLeagueStats(
  leagueIdOrSlug: number | string,
  params: {
    season?: number | string;
    forceRefresh?: boolean;
  } = {}
): Promise<{
  topScorers: FormattedPlayerStats[];
  topAssists: FormattedPlayerStats[];
}> {
  try {
    const { season = DEFAULT_SEASON, forceRefresh = false } = params;

    // 並列処理で両方のランキングを取得
    const [topScorers, topAssists] = await Promise.all([
      getLeagueTopScorers(leagueIdOrSlug, season, forceRefresh),
      getLeagueTopAssists(leagueIdOrSlug, season, forceRefresh),
    ]);

    return {
      topScorers,
      topAssists,
    };
  } catch (error) {
    console.error(
      `リーグ統計情報の取得中にエラーが発生しました - リーグ:${leagueIdOrSlug}:`,
      error
    );
    return {
      topScorers: [],
      topAssists: [],
    };
  }
}
