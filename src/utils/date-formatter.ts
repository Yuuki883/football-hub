import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ja } from 'date-fns/locale';

// 日本のタイムゾーン
const TOKYO_TIMEZONE = 'Asia/Tokyo';

/**
 * 日付文字列を日本時間に変換して返す
 * date-fns-tzライブラリを使用してタイムゾーン変換を行う
 */
function toJapanTime(dateString: string): Date {
  // ISO形式の日付文字列をパース
  const date = parseISO(dateString);
  return toZonedTime(date, TOKYO_TIMEZONE);
}

export function formatMatchDate(dateString: string, type: 'display' | 'group' = 'display') {
  // date-fns-tzを使用して日本時間に変換
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
  // date-fns-tzを使用して日本時間に変換
  const date = toJapanTime(dateString);
  return format(date, 'HH:mm');
}

// シンプルな日付フォーマット関数（yyyy/MM/dd形式）
export function formatDate(dateString: string): string {
  try {
    // ISO形式でない場合もあるのでtry-catchで囲む
    const date = parseISO(dateString);
    return format(date, 'yyyy/MM/dd');
  } catch (e) {
    // パースに失敗した場合は元の文字列を返す
    return dateString;
  }
}

export const formatTime = formatMatchTime;
