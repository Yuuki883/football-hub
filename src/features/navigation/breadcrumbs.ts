/**
 * パスセグメントから表示名へのマッピング
 * パンくずリスト、メタデータ、ナビゲーションなどで使用
 */
export const PATH_DISPLAY_MAP: Record<string, string> = {
  '': 'ホーム',
  leagues: 'リーグ',
  standings: '順位表',
  matches: '試合',
  stats: 'スタッツ',
  teams: 'チーム',
  players: '選手',
  news: 'ニュース',
};

/**
 * 動的ルートセグメントの表示名を解決する
 * @param segment - パスセグメント
 * @param pathSegments - 全パスセグメント配列
 * @param segmentIndex - 現在のセグメントのインデックス
 * @returns 表示名
 */
export function dynamicSegment(
  segment: string,
  pathSegments: string[],
  segmentIndex: number
): string {
  // 前のセグメントを取得
  const previousSegment = segmentIndex > 0 ? pathSegments[segmentIndex - 1] : null;

  // 数値IDの判定（単純な数値文字列）
  const isNumericId = /^\d+$/.test(segment);

  // 試合詳細ページの場合
  if (previousSegment === 'matches' && isNumericId) {
    return '試合詳細';
  }

  // リーグのスラッグの場合は動的取得（useBreadcrumbDataで処理）
  // 既存のマッピングを確認
  if (PATH_DISPLAY_MAP[segment]) {
    return PATH_DISPLAY_MAP[segment];
  }

  // フォールバック: 最初の文字を大文字にして返す
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}
