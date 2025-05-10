/**
 * リーグ選手統計API
 *
 * リーグの選手統計（得点王、アシスト王など）を取得する機能を提供
 * lib/api-footballの共通機能を使用
 */

import { LEAGUE_ID_MAPPING, DEFAULT_SEASON } from '@/config/api';
import {
  getTopScorers,
  getTopAssists,
  getTopScorersBySlug,
  getTopAssistsBySlug,
} from '@/lib/api-football/players-api';
import type { FormattedPlayerStats } from '@/lib/api-football/types/players';

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
    // スラグの場合はIDに変換
    let leagueId = leagueIdOrSlug;
    let slug = '';

    if (typeof leagueIdOrSlug === 'string' && isNaN(Number(leagueIdOrSlug))) {
      // コード形式（PL, PDなど）の場合はマッピングを使用
      if (LEAGUE_ID_MAPPING[leagueIdOrSlug]) {
        leagueId = LEAGUE_ID_MAPPING[leagueIdOrSlug];
      } else {
        // スラグ形式の場合はスラグを使用
        slug = leagueIdOrSlug;
      }
    }

    // スラグが指定されている場合はスラグベースの関数を使用
    if (slug) {
      return getTopScorersBySlug(slug, season, forceRefresh);
    }

    // IDの場合は直接ID指定
    return getTopScorers(leagueId, season, forceRefresh);
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
    // スラグの場合はIDに変換
    let leagueId = leagueIdOrSlug;
    let slug = '';

    if (typeof leagueIdOrSlug === 'string' && isNaN(Number(leagueIdOrSlug))) {
      // コード形式（PL, PDなど）の場合はマッピングを使用
      if (LEAGUE_ID_MAPPING[leagueIdOrSlug]) {
        leagueId = LEAGUE_ID_MAPPING[leagueIdOrSlug];
      } else {
        // スラグ形式の場合はスラグを使用
        slug = leagueIdOrSlug;
      }
    }

    // スラグが指定されている場合はスラグベースの関数を使用
    if (slug) {
      return getTopAssistsBySlug(slug, season, forceRefresh);
    }

    // IDの場合は直接ID指定
    return getTopAssists(leagueId, season, forceRefresh);
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
