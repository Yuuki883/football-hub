/**
 * 試合情報API
 *
 * API-Footballから試合データを取得するための機能を提供
 * フィクスチャーAPIをラップして、特定の条件での試合データ取得を可能に
 */

import { getFixtures } from './fixtures-api';
import type { Match } from './fixtures';
import { LEAGUE_ID_MAPPING, DEFAULT_SEASON } from '@/config/api';

/**
 * 特定リーグの試合データを取得
 *
 * 指定されたリーグコードの試合データを取得
 * リーグコードはPL, PD, BL1, SA, FL1, CLなどの形式で指定
 *
 * @param leagueCode リーグコード
 * @param season シーズン（指定なしの場合はデフォルトシーズン）
 * @returns 試合データの配列
 */
export async function getMatchesByLeague(
  leagueCode: string,
  season: string | number = DEFAULT_SEASON
): Promise<Match[]> {
  if (!leagueCode) {
    throw new Error('リーグコードが指定されていません');
  }

  // API-FootballのリーグIDに変換
  const leagueId = LEAGUE_ID_MAPPING[leagueCode];
  if (!leagueId) {
    throw new Error(`サポートされていないリーグコードです: ${leagueCode}`);
  }

  // 現在の日付から今後90日の試合を取得
  const today = new Date();
  const ninetyDaysLater = new Date(today);
  ninetyDaysLater.setDate(today.getDate() + 90);

  const dateFrom = today.toISOString().split('T')[0];
  const dateTo = ninetyDaysLater.toISOString().split('T')[0];

  // fixtures-apiを使用して試合データを取得
  const matches = await getFixtures({
    leagueId,
    season,
    dateFrom,
    dateTo,
    limit: 10, // 最大10試合に制限
  });

  return matches;
}

/**
 * 特定の日付範囲の試合を取得
 *
 * @param leagueCode リーグコード
 * @param dateFrom 開始日（YYYY-MM-DD形式）
 * @param dateTo 終了日（YYYY-MM-DD形式）
 * @param forceRefresh キャッシュを無視して強制的に更新する場合はtrue
 * @param season シーズン（指定なしの場合はデフォルトシーズン）
 * @returns 試合データの配列
 */
export async function getMatchesByDateRange(
  leagueCode: string,
  dateFrom: string,
  dateTo: string,
  forceRefresh: boolean = false,
  season: string | number = DEFAULT_SEASON
): Promise<Match[]> {
  if (!leagueCode) {
    throw new Error('リーグコードが指定されていません');
  }

  // API-FootballのリーグIDに変換
  const leagueId = LEAGUE_ID_MAPPING[leagueCode];
  if (!leagueId) {
    throw new Error(`リーグコードが存在しません: ${leagueCode}`);
  }

  // fixtures-apiを使用して試合データを取得
  return getFixtures({
    leagueId,
    season,
    dateFrom,
    dateTo,
    forceRefresh,
  });
}

/**
 * 指定された日付の全リーグの試合データを一括取得
 *
 * @param date 日付（YYYY-MM-DD形式）
 * @param forceRefresh キャッシュを無視して強制的に更新する場合はtrue
 * @param season シーズン（指定なしの場合はデフォルトシーズン）
 * @returns 全リーグの試合データの配列（時間順にソート済み）
 */
export async function getAllMatchesByDate(
  date: string,
  forceRefresh: boolean = false,
  season: string | number = DEFAULT_SEASON
): Promise<Match[]> {
  try {
    // 全リーグのコード一覧
    const leagueCodes = Object.keys(LEAGUE_ID_MAPPING);
    let allMatches: Match[] = [];

    // 並列処理で全リーグの試合を取得
    const matchPromises = leagueCodes.map((code) =>
      getMatchesByDateRange(code, date, date, forceRefresh, season).catch((error) => {
        console.error(`Error fetching matches for league ${code}:`, error);
        return []; // エラー時は空配列を返してプロセスを継続
      })
    );

    const results = await Promise.all(matchPromises);

    // 結果をマージ
    results.forEach((matches) => {
      if (matches && matches.length > 0) {
        allMatches = [...allMatches, ...matches];
      }
    });

    // 試合開始時間順にソート
    allMatches.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

    return allMatches;
  } catch (error) {
    console.error('複数リーグの試合取得中にエラーが発生しました:', error);
    return [];
  }
}
