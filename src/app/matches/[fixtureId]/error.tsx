/**
 * 試合詳細ページのエラー処理
 * エラー発生時に表示されるUI
 */

'use client';

import { ErrorFallback } from '@/components/feedback/ErrorFallback';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

/**
 * エラー状態コンポーネント
 * @param error - エラー情報
 * @param reset - リトライ関数
 * @returns エラー状態のUI
 */
export default function Error({ error, reset }: ErrorProps) {
  return (
    <ErrorFallback
      error={error}
      resetAction={reset}
      customMessage="試合データの取得中にエラーが発生しました"
    />
  );
}
