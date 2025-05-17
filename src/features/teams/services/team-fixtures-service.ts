/**
 * チーム試合サービス
 *
 * APIモジュールをラップし、ビジネスロジックを追加するサービスレイヤー
 */

import { getTeamFixtures as apiGetTeamFixtures } from '../api/team-fixtures';
import type { TeamFixturesParams } from '../types/types';
import type { Match } from '@/lib/api-football/types';

/**
 * チームの試合データを取得する
 *
 * @param teamId チームID
 * @param params 取得パラメータ
 * @returns 試合データの配列
 */
export async function getTeamFixtures(
  teamId: number | string,
  params: TeamFixturesParams = {}
): Promise<Match[]> {
  try {
    // APIモジュールからデータを取得
    const fixtures = await apiGetTeamFixtures(teamId, params);

    // 必要に応じてデータ加工などの処理を追加できる

    return fixtures;
  } catch (error) {
    console.error('Team fixtures service error:', error);
    throw error;
  }
}
