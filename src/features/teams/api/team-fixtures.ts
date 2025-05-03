/**
 * チーム試合データAPI
 *
 * 特定チームの試合データを取得する機能を提供
 * lib/api-footballの共通機能を使用。
 */

import { getFixtures } from '@/lib/api-football/fixtures-api';
import type { Match } from '@/lib/api-football/fixtures';
import { DEFAULT_SEASON } from '@/config/api';

/**
 * チームの試合日程を取得する
 *
 * @param teamId チームID
 * @param params 取得パラメータ
 * @returns 試合データの配列
 */
export async function getTeamFixtures(
  teamId: number | string,
  params: {
    season?: number | string;
    past?: boolean;
    future?: boolean;
    limit?: number;
    forceRefresh?: boolean;
  } = {}
): Promise<Match[]> {
  if (!teamId) {
    throw new Error('チームIDが指定されていません');
  }

  const {
    season = DEFAULT_SEASON,
    past = true,
    future = true,
    limit = 5,
    forceRefresh = false,
  } = params;

  // 共通機能を使用して試合データを取得
  return getFixtures({
    teamId,
    season,
    past,
    future,
    limit,
    forceRefresh,
  });
}
