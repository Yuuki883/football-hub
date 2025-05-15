/**
 * 選手の統計情報処理モジュール
 *
 * 選手の統計データを取得し、表示用に整形する機能
 */
import { PlayerStats } from '../types/types';
import { API_FOOTBALL } from '@/config/api';
import { formatRating } from '../utils/format-utils';

/**
 * 選手の統計情報を取得
 *
 * @param playerId - 選手ID
 * @param season - シーズン（例: '2024'）
 * @returns 選手の統計情報
 */
export async function getPlayerStats(
  playerId: string,
  season: string
): Promise<PlayerStats | null> {
  try {
    // API呼び出しのためのヘッダー
    const headers = {
      'x-rapidapi-key': API_FOOTBALL.KEY,
      'x-rapidapi-host': API_FOOTBALL.HOST,
    };

    // 選手統計情報を取得
    const response = await fetch(
      `${API_FOOTBALL.BASE_URL}/players?id=${playerId}&season=${season}`,
      {
        headers,
        next: { revalidate: 3600 }, // 1時間キャッシュ
      }
    );

    if (!response.ok) {
      console.error('選手統計API取得エラー:', response.status);
      return null;
    }

    const data = await response.json();

    // データが存在しない場合
    if (!data.response || !data.response.length || !data.response[0].statistics) {
      console.warn('選手統計データが見つかりません:', playerId);
      return null;
    }

    // 最初の選手データの統計情報を取得
    const playerData = data.response[0];
    const statistics = playerData.statistics;

    // 有効な統計データを探す
    let currentStats: any = {};

    if (statistics && statistics.length > 0) {
      // 統計データを順番に確認し、有効なものを採用
      for (const stats of statistics) {
        if (
          stats.games?.appearences ||
          stats.goals?.total ||
          stats.goals?.assists ||
          stats.games?.rating
        ) {
          currentStats = stats;
          break;
        }
      }

      // 有効なデータが見つからなければ最初のエントリを使用
      if (Object.keys(currentStats).length === 0) {
        currentStats = statistics[0] || {};
      }
    }

    // リーグ情報の抽出
    const leagueInfo = currentStats.league
      ? {
          id: currentStats.league.id,
          name: currentStats.league.name,
          logo: currentStats.league.logo,
          season: currentStats.league.season,
        }
      : undefined;

    // 統計情報の構築
    const stats: PlayerStats = {
      appearances: currentStats.games?.appearences,
      minutes: currentStats.games?.minutes,
      goals: currentStats.goals?.total,
      assists: currentStats.goals?.assists,
      yellowCards: currentStats.cards?.yellow,
      redCards: currentStats.cards?.red,
      rating: formatRating(currentStats.games?.rating),
      league: leagueInfo,
    };

    return stats;
  } catch (error) {
    console.error('選手統計取得処理エラー:', error);
    return null;
  }
}
