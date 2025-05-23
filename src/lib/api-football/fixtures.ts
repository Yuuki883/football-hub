/**
 * 試合データ（フィクスチャー）関連の共通ユーティリティ
 *
 * API-Footballからの試合データをアプリケーションで統一された形式に変換
 */

import { LEAGUE_ID_MAPPING, DEFAULT_SEASON } from '@/config/api';
import { Match, MATCH_STATUS_MAPPING, DateRange } from './types/fixture';

// デフォルトのシーズン設定をエクスポート
export { DEFAULT_SEASON } from '@/config/api';
export { MATCH_STATUS_MAPPING } from './types/fixture';
export type { Match } from './types/fixture';

/**
 * API-Football形式の試合データをアプリで使用する形式に変換
 *
 * @param fixture API-Footballから返される試合データ
 * @returns アプリで統一された形式の試合データ
 */
export function formatMatch(fixture: any): Match {
  return {
    id: fixture.fixture.id.toString(),
    utcDate: fixture.fixture.date,
    status: fixture.fixture.status.short,
    homeTeam: {
      id: fixture.teams.home.id.toString(),
      name: fixture.teams.home.name,
      shortName: fixture.teams.home.name,
      crest: fixture.teams.home.logo,
      logo: fixture.teams.home.logo,
    },
    awayTeam: {
      id: fixture.teams.away.id.toString(),
      name: fixture.teams.away.name,
      shortName: fixture.teams.away.name,
      crest: fixture.teams.away.logo,
      logo: fixture.teams.away.logo,
    },
    score: {
      home: fixture.goals.home,
      away: fixture.goals.away,
    },
    competition: {
      id: fixture.league.id.toString(),
      name: fixture.league.name,
      code:
        Object.keys(LEAGUE_ID_MAPPING).find(
          (key) => LEAGUE_ID_MAPPING[key] === fixture.league.id
        ) || fixture.league.id.toString(),
      type: 'LEAGUE',
      emblem: fixture.league.logo,
    },
    venue: fixture.fixture.venue?.name,
    matchday: fixture.league.round,
  };
}

/**
 * 複数の試合データをフォーマットする
 *
 * @param fixtures API-Footballから返される試合データの配列
 * @returns フォーマット済みの試合データ配列
 */
export function formatMatches(fixtures: any[]): Match[] {
  return fixtures.map((fixture) => formatMatch(fixture));
}

/**
 * 日付範囲を計算するヘルパー関数
 *
 * @param past 過去の試合を含めるか
 * @param future 将来の試合を含めるか
 * @param days 何日分のデータを取得するか（デフォルト90日）
 * @returns 日付範囲 {dateFrom, dateTo}
 */
export function calculateDateRange(
  past: boolean = true,
  future: boolean = true,
  days: number = 90
): DateRange {
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];

  let dateFrom, dateTo;

  if (past && !future) {
    // 過去の試合のみ
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - days);
    dateFrom = pastDate.toISOString().split('T')[0];
    dateTo = formattedToday;
  } else if (!past && future) {
    // 将来の試合のみ
    dateFrom = formattedToday;
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    dateTo = futureDate.toISOString().split('T')[0];
  } else {
    // 両方（デフォルト）
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - days);
    dateFrom = pastDate.toISOString().split('T')[0];
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    dateTo = futureDate.toISOString().split('T')[0];
  }

  return { dateFrom, dateTo };
}
