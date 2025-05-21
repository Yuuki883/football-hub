/**
 * 国名リストと代表チーム判定のためのユーティリティ関数
 */
import { API_FOOTBALL } from '@/config/api';
import { CACHE_TTL } from '@/config/api';

// 国名のキャッシュ
let countriesCache: string[] | null = null;
let cacheTimestamp: number = 0;

/**
 * API-Footballから国名リストを取得
 *
 * @param forceRefresh キャッシュを強制更新するかどうか
 * @returns 国名の配列
 */
export async function getCountryNames(forceRefresh: boolean = false): Promise<string[]> {
  const now = Date.now();
  const cacheExpiry = CACHE_TTL.VERY_LONG * 1000; // ミリ秒に変換

  // キャッシュが有効な場合はそれを返す
  if (countriesCache && now - cacheTimestamp < cacheExpiry && !forceRefresh) {
    return countriesCache;
  }

  try {
    if (!API_FOOTBALL.KEY) {
      throw new Error('API key is not configured');
    }

    // API呼び出しのためのヘッダー
    const headers: Record<string, string> = {
      'x-apisports-key': API_FOOTBALL.KEY,
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_FOOTBALL.BASE_URL}/countries`, {
      headers,
    });

    if (!response.ok) {
      console.error('国名リスト取得エラー:', response.status);
      return countriesCache || []; // キャッシュがあればそれを返す、なければ空配列
    }

    const data = await response.json();

    // 国名のみを抽出
    const countryNames = data.response?.map((country: any) => country.name) || [];

    // キャッシュを更新
    countriesCache = countryNames;
    cacheTimestamp = now;

    return countryNames;
  } catch (error) {
    console.error('国名リスト取得処理エラー:', error);
    return countriesCache || []; // エラー時もキャッシュがあればそれを返す
  }
}
