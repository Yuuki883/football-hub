/**
 * 試合詳細ページのローディング状態
 * データ取得中に表示されるスケルトンUI
 */

import { MatchSkeleton } from '@/features/matches/components/MatchSkeleton';

/**
 * ローディング状態コンポーネント
 * @returns ローディング状態のUI
 */
export default function Loading() {
  return <MatchSkeleton />;
}
