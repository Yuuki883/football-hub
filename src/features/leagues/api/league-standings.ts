/**
 * リーグ順位表API
 *
 * リーグの順位表を取得する機能を提供
 * lib/api-footballの共通機能を使用
 */

import { LEAGUE_ID_MAPPING, DEFAULT_SEASON } from '@/config/api';
import { getStandings, getStandingsBySlug } from '@/lib/api-football/api-football';
import type { FormattedStandingGroup } from '@/lib/api-football/api-football';

/**
 * リーグの順位表を取得
 *
 * @param leagueIdOrSlug リーグID または スラグ
 * @param seasonOrParams シーズンまたはパラメータオブジェクト
 * @returns 順位表データ
 */
export async function getLeagueStandings(
  leagueIdOrSlug: number | string,
  seasonOrParams:
    | number
    | string
    | { season?: number | string; forceRefresh?: boolean } = DEFAULT_SEASON
): Promise<FormattedStandingGroup[] | null> {
  try {
    // パラメータの解析
    let season: number | string = DEFAULT_SEASON;
    let forceRefresh = false;

    if (typeof seasonOrParams === 'object') {
      season = seasonOrParams.season || DEFAULT_SEASON;
      forceRefresh = seasonOrParams.forceRefresh || false;
    } else {
      season = seasonOrParams;
    }

    // スラグの場合はIDに変換
    let leagueId = leagueIdOrSlug;
    let slug = '';

    if (typeof leagueIdOrSlug === 'string' && isNaN(Number(leagueIdOrSlug))) {
      // コード形式（PL, PDなど）の場合はマッピングを使用
      if (LEAGUE_ID_MAPPING[leagueIdOrSlug]) {
        leagueId = LEAGUE_ID_MAPPING[leagueIdOrSlug];
      } else {
        // スラグ形式の場合はスラグからリーグ情報を取得
        slug = leagueIdOrSlug;
      }
    }

    // スラグが指定されている場合はスラグベースの関数を使用
    if (slug) {
      return getStandingsBySlug(slug, season, forceRefresh);
    }

    // IDの場合は直接ID指定
    return getStandings(leagueId, season, forceRefresh);
  } catch (error) {
    console.error('順位表の取得中にエラーが発生しました:', error);
    return null;
  }
}
