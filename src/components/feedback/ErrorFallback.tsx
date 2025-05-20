'use client';

/**
 * エラー状態表示コンポーネント
 * エラー発生時のフォールバックUIを提供
 */

import { AlertCircle } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetAction?: () => void;
  customMessage?: string;
}

/**
 * エラー情報を表示するフォールバックコンポーネント
 * @param error - 発生したエラー
 * @param resetAction - リセット処理関数
 * @param customMessage - カスタムエラーメッセージ
 * @returns エラー表示UI
 */
export function ErrorFallback({
  error,
  resetAction,
  customMessage = 'エラーが発生しました',
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-lg my-4">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-xl font-bold text-red-700 mb-2">{customMessage}</h2>
      <p className="text-red-600 mb-4 max-w-md text-center">
        {process.env.NODE_ENV === 'development'
          ? error.message
          : 'システムエラーが発生しました。時間をおいて再度お試しください。'}
      </p>
      {resetAction && (
        <button
          onClick={resetAction}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          再試行
        </button>
      )}
    </div>
  );
}
