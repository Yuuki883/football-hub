/**
 * 試合関連のユーティリティ関数
 */

import { MatchDisplay, MatchStatusType, MATCH_STATUS } from '../types';
import { formatMatchDate as formatDateUtil } from '@/lib/api-football/utils/data-formatters';

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
 * 試合がすでに開始している（試合中または終了）かどうかを判定
 * @param status - 試合ステータス
 * @returns 開始済みならtrue
 */
export function isMatchStarted(status: MatchStatusType | string): boolean {
  // スケジュール済み(SCHEDULED)以外は全て試合開始済みと見なす
  return status !== MATCH_STATUS.SCHEDULED && status !== 'NS' && status !== 'POSTPONED';
}

/**
 * 試合スコア表示用クラスを取得
 * @param status - 試合ステータス
 * @returns CSSクラス名
 */
export function getScoreDisplayClass(status: MatchStatusType | string): string {
  if (status === MATCH_STATUS.LIVE || status === MATCH_STATUS.PAUSED) {
    return 'text-green-700 dark:text-green-400 font-semibold';
  }
  return '';
}

/**
 * 日付ごとに試合をグループ化
 * @param matches - 試合配列
 * @returns 日付をキーとする試合グループオブジェクト
 */
export function groupMatchesByDate(matches: MatchDisplay[]): Record<string, MatchDisplay[]> {
  return matches.reduce((acc: Record<string, MatchDisplay[]>, match) => {
    const dateKey = formatDateUtil(match.utcDate, { type: 'group' });
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(match);
    return acc;
  }, {});
}
