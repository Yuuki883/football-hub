/**
 * チーム統計表示に関する定数
 *
 * チーム統計表示に使用される定数値を定義
 */

// ラベル表示の最小パーセント値（これ未満の場合はラベルを表示しない）
export const MIN_LABEL_PCT = 15;

// 統計表示のカテゴリ名
export const STAT_CATEGORIES = {
  FIXTURES: '試合成績',
  GOALS: '得点情報',
  FORMATIONS: '主要フォーメーション',
};

// 統計関連のラベル
export const STAT_LABELS = {
  TOTAL_MATCHES: '総試合数',
  WINS: '勝利',
  DRAWS: '引き分け',
  LOSSES: '敗北',
  GOALS_FOR: '総得点',
  GOALS_AGAINST: '総失点',
  CLEAN_SHEETS: 'クリーンシート',
  FAILED_TO_SCORE: '無得点試合',
  HOME: 'ホーム',
  AWAY: 'アウェイ',
  AVERAGE: '平均',
};
