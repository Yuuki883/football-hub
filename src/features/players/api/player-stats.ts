/**
 * 選手の統計情報処理モジュール
 *
 * 選手の統計データを取得し、表示用に整形する機能
 */
import { PlayerDetailStats } from '../types/types';
import { API_FOOTBALL } from '@/config/api';
import { transformPlayerStats } from './stats-helper';

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
): Promise<PlayerDetailStats | null> {
  try {
    if (!API_FOOTBALL.KEY) {
      throw new Error('API key is not configured');
    }

    // API呼び出しのためのヘッダー
    const headers: Record<string, string> = {
      'x-apisports-key': API_FOOTBALL.KEY,
      'Content-Type': 'application/json',
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

    // 統計情報を変換（stats-helperの関数を使用）
    const { stats } = transformPlayerStats(statistics);

    return stats;
  } catch (error) {
    console.error('選手統計取得処理エラー:', error);
    return null;
  }
}
