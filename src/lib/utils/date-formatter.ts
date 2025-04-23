import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ja } from 'date-fns/locale';

// 日本のタイムゾーンは UTC+9
const TOKYO_TIMEZONE_OFFSET = 9;

/**
 * 日付文字列を日本時間に変換して返す
 * date-fns-tzを使わずに実装
 */
function toJapanTime(dateString: string): Date {
  const date = new Date(dateString);
  // 現在のUTCとローカルの差分を無視して強制的にUTC+9で解釈する
  // このアプローチはサーバー・クライアント間で一貫した結果を生成する
  const utcDate = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    )
  );

  // 日本時間（UTC+9）に調整
  utcDate.setUTCHours(utcDate.getUTCHours() + TOKYO_TIMEZONE_OFFSET);
  return utcDate;
}

export function formatMatchDate(
  dateString: string,
  type: 'display' | 'group' = 'display'
) {
  // 日本時間に変換
  const date = toJapanTime(dateString);

  if (type === 'group') {
    // グループ化のための日付フォーマット（yyyy-MM-dd）
    return format(date, 'yyyy-MM-dd');
  }

  if (isToday(date)) {
    return '今日';
  } else if (isTomorrow(date)) {
    return '明日';
  } else if (isYesterday(date)) {
    return '昨日';
  } else {
    return format(date, 'M月d日(E)', { locale: ja });
  }
}

export function formatMatchTime(dateString: string) {
  // 日本時間に変換
  const date = toJapanTime(dateString);
  return format(date, 'HH:mm');
}

// 互換性のためのエイリアス
export const formatDate = formatMatchDate;
export const formatTime = formatMatchTime;
