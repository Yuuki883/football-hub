/**
 * 試合詳細ページの404エラー処理
 * 試合が見つからない場合に表示されるUI
 */

import { NotFoundScreen } from '@/components/feedback/NotFoundScreen';

/**
 * 404エラー状態コンポーネント
 * @returns 404エラー状態のUI
 */
export default function NotFound() {
  return (
    <NotFoundScreen
      title="試合が見つかりません"
      message="指定された試合は存在しないか、削除された可能性があります。"
    />
  );
}
