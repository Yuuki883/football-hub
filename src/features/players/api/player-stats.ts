/**
 * 選手の統計情報処理モジュール
 *
 * 選手の統計データを取得し、表示用に整形する機能
 */
import { PlayerDetailStats } from '../types/type';
import { API_FOOTBALL } from '@/config/api';
import { transformPlayerStats } from './stats-helper';
import { handleAPICall, validateAPIResponse, logger } from '@/utils/error-handlers';

/**
 * 個別選手の統計情報を取得
 *
 * @param playerId - 選手ID
 * @param season - シーズン（例: '2024'）
 * @returns 選手の統計情報
 */
export async function getIndividualPlayerStats(
  playerId: string,
  season: string
): Promise<PlayerDetailStats | null> {
  return handleAPICall(async () => {
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
      logger.error('選手統計API取得エラー', undefined, {
        status: response.status,
        playerId,
        season,
      });
      return null;
    }

    const data = await response.json();

    // データ検証
    const validatedData = validateAPIResponse(data, '選手統計データ');
    if (validatedData.length === 0) {
      logger.warn('選手統計データが見つかりません', { playerId, season });
      return null;
    }

    // 最初の選手データの統計情報を取得
    const playerData = validatedData[0] as any;
    if (!playerData.statistics) {
      logger.warn('選手統計データの統計情報が見つかりません', { playerId, season });
      return null;
    }

    const statistics = playerData.statistics;

    // 統計情報を変換（stats-helperの関数を使用）
    const { stats } = transformPlayerStats(statistics);

    return stats;
  }, `選手統計取得 (playerId: ${playerId}, season: ${season})`).catch((error) => {
    logger.error('選手統計取得処理エラー', error, { playerId, season });
    return null;
  });
}
