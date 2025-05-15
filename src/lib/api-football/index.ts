/**
 * API-Football APIクライアント
 *
 * APIリクエストの共通処理を提供
 * 環境変数からの設定読み込み、リクエストヘッダーの構成などを処理
 */

import { API_FOOTBALL, LEAGUE_ID_MAPPING } from '@/config/api';

// リーグID (API-Football)のマッピングをエクスポート
export { LEAGUE_ID_MAPPING } from '@/config/api';

/**
 * API-Footballからデータを取得する共通関数
 *
 * @param url APIエンドポイントURL
 * @returns レスポンスデータ
 * @throws エラー発生時に例外をスロー
 */
export async function fetchFromAPI(url: string): Promise<any> {
  try {
    const response = await fetch(url, {
      headers: {
        'x-apisports-key': API_FOOTBALL.KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`APIリクエストエラー: ${url}`, error);
    throw error;
  }
}

/**
 * URLにクエリパラメータを追加するヘルパー関数
 *
 * @param endpoint エンドポイントパス
 * @param params クエリパラメータ
 * @returns 完全なURL
 */
export function createUrl(endpoint: string, params?: Record<string, any>): string {
  const baseUrl = API_FOOTBALL.BASE_URL.endsWith('/')
    ? API_FOOTBALL.BASE_URL.slice(0, -1)
    : API_FOOTBALL.BASE_URL;

  const url = new URL(`${baseUrl}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value.toString());
      }
    });
  }

  return url.toString();
}
