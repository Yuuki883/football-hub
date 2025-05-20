/**
 * 試合関連のユーティリティ関数
 */

import { formatMatchDate as formatDateUtil } from '@/utils/date-formatter';

/**
 * 試合ステータスを表示用テキストに変換
 * @param status - 試合ステータス
 * @returns 表示用テキスト
 */
export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'Match Finished': '試合終了',
    'Not Started': 'キックオフ前',
    'Match Postponed': '延期',
    'Match Cancelled': '中止',
    'Match Suspended': '中断',
    'Match Abandoned': '中止',
    'In Progress': '試合中',
    'Half Time': 'ハーフタイム',
  };

  return statusMap[status] || status;
}

/**
 * 試合ステータスに応じたクラス名を取得
 * @param status - 試合ステータス
 * @returns クラス名
 */
export function getStatusClass(status: string): string {
  const statusClasses: Record<string, string> = {
    'Match Finished': 'bg-gray-600',
    'Not Started': 'bg-blue-600',
    'Match Postponed': 'bg-yellow-600',
    'Match Cancelled': 'bg-red-600',
    'Match Suspended': 'bg-yellow-600',
    'Match Abandoned': 'bg-red-600',
    'In Progress': 'bg-green-600 animate-pulse',
    'Half Time': 'bg-amber-600',
  };

  return statusClasses[status] || 'bg-gray-600';
}

/**
 * 日付を表示用フォーマットに変換（エラーハンドリング付き）
 * @param dateString - 日付文字列
 * @returns フォーマット済み日付
 */
export function formatMatchDate(dateString: string): string {
  try {
    // 共通ユーティリティの日付フォーマット関数を使用
    return formatDateUtil(dateString, 'display');
  } catch (error) {
    console.error('日付フォーマットエラー:', error);
    // エラー時はそのまま日付文字列を返す
    return dateString || '日付不明';
  }
}
