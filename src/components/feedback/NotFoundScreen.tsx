/**
 * 404ページ表示コンポーネント
 * コンテンツが見つからない場合のUIを提供
 */

import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

interface NotFoundScreenProps {
  title?: string;
  message?: string;
}

/**
 * 404ページ表示コンポーネント
 * @param title - ページタイトル
 * @param message - 表示メッセージ
 * @returns 404表示UI
 */
export function NotFoundScreen({
  title = 'ページが見つかりません',
  message = 'お探しのページは存在しないか、削除された可能性があります。',
}: NotFoundScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <FileQuestion className="w-20 h-20 text-gray-400 mb-6" />
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">{message}</p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        ホームに戻る
      </Link>
    </div>
  );
}
