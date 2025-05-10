/**
 * API-Football 共通の型定義
 *
 * API全体で共有される基本的な型定義を提供
 */

// APIレスポンスの基本形
export interface ApiResponse<T> {
  errors: string[];
  results: number;
  paging?: {
    current: number;
    total: number;
  };
  response: T;
}

// キャッシュオプションの型
export interface CacheOptions {
  ttl: number;
  forceRefresh: boolean;
}

// API呼び出しパラメータの基本型
export interface ApiParams {
  [key: string]: string | number | boolean | undefined;
}
