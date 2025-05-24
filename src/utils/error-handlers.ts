/**
 * 統一されたエラーハンドリング関数
 *
 * API呼び出し時の共通エラー処理
 */

/**
 * カスタムAPIエラークラス
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * API呼び出しのエラーハンドリング統一関数
 *
 * @param apiCall 実行するAPI関数
 * @param context エラー発生箇所の説明
 * @returns API実行結果
 */
export async function handleAPICall<T>(apiCall: () => Promise<T>, context: string): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    console.error(`${context}でエラーが発生:`, error);

    // HTTPエラーの場合
    if (error instanceof Response) {
      throw new APIError(
        `${context}の処理中にHTTPエラーが発生しました (${error.status})`,
        error.status,
        error.url,
        error
      );
    }

    // 既にAPIErrorの場合はそのまま再throw
    if (error instanceof APIError) {
      throw error;
    }

    // その他のエラー
    throw new APIError(`${context}の処理中にエラーが発生しました`, undefined, context, error);
  }
}

/**
 * 安全なAPI呼び出し（エラー時にnullを返す）
 *
 * @param apiCall 実行するAPI関数
 * @param context エラー発生箇所の説明
 * @param defaultValue エラー時のデフォルト値
 * @returns API実行結果またはデフォルト値
 */
export async function safeAPICall<T>(
  apiCall: () => Promise<T>,
  context: string,
  defaultValue: T | null = null
): Promise<T | null> {
  try {
    return await handleAPICall(apiCall, context);
  } catch (error) {
    // エラーログは既にhandleAPICallで出力済み
    return defaultValue;
  }
}

/**
 * データ取得時の共通エラーハンドリング
 *
 * @param data API レスポンスデータ
 * @param context データの種類
 * @returns 有効なデータまたはnull
 */
export function validateAPIResponse<T>(data: { response?: T[] } | null, context: string): T[] {
  if (!data || !data.response || !Array.isArray(data.response)) {
    console.warn(`${context}のデータが無効です:`, data);
    return [];
  }

  if (data.response.length === 0) {
    console.info(`${context}のデータが見つかりませんでした`);
  }

  return data.response;
}

/**
 * ログレベル別のエラー出力
 */
export const logger = {
  error: (message: string, error?: unknown, context?: Record<string, any>) => {
    console.error(`[ERROR] ${message}`, error, context);
  },

  warn: (message: string, context?: Record<string, any>) => {
    console.warn(`[WARN] ${message}`, context);
  },

  info: (message: string, context?: Record<string, any>) => {
    console.info(`[INFO] ${message}`, context);
  },

  debug: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context);
    }
  },
};
