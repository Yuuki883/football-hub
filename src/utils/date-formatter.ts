/**
 * 統合された日付フォーマットユーティリティ
 *
 * アプリケーション全体で一貫した日付フォーマット機能
 */

import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ja } from 'date-fns/locale';

// 日本のタイムゾーン
const TOKYO_TIMEZONE = 'Asia/Tokyo';

/**
 * 日付文字列を日本時間に変換して返す
 * date-fns-tzライブラリを使用してタイムゾーン変換を行う
 * @param dateString - ISO形式の日付文字列（未定義の場合は現在時刻を使用）
 * @returns 日本時間に変換されたDate
 */
function toJapanTime(dateString?: string | null): Date {
  try {
    // 日付文字列がない場合は現在時刻を使用
    if (!dateString) {
      return toZonedTime(new Date(), TOKYO_TIMEZONE);
    }
    // ISO形式の日付文字列をパース
    const date = parseISO(dateString);
    return toZonedTime(date, TOKYO_TIMEZONE);
  } catch (error) {
    console.error('日付変換エラー:', error, { dateString });
    // エラーの場合は現在時刻を返す
    return toZonedTime(new Date(), TOKYO_TIMEZONE);
  }
}

/**
 * 日付フォーマットオプション
 */
export interface DateFormatOptions {
  locale?: string;
  includeYear?: boolean;
  includeWeekday?: boolean;
  type?: 'display' | 'group';
}

/**
 * 統合された試合日時フォーマット関数
 *
 * @param dateString - ISO形式の日付文字列
 * @param options - フォーマットオプション
 * @returns フォーマットされた日付文字列
 */
export function formatMatchDate(
  dateString?: string | null,
  options: DateFormatOptions = {}
): string {
  const {
    locale = 'ja-JP',
    includeYear = false,
    includeWeekday = true,
    type = 'display',
  } = options;

  try {
    // 日付文字列がない場合
    if (!dateString) {
      return type === 'group' ? '未定' : '日時未定';
    }

    // date-fns-tzを使用して日本時間に変換
    const date = toJapanTime(dateString);

    if (type === 'group') {
      // グループ化のための日付フォーマット（yyyy-MM-dd）
      return format(date, 'yyyy-MM-dd');
    }

    // 相対日付判定
    if (isToday(date)) {
      return '今日';
    } else if (isTomorrow(date)) {
      return '明日';
    } else if (isYesterday(date)) {
      return '昨日';
    }

    // 通常の日付フォーマット
    const formatOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };

    if (includeYear) formatOptions.year = 'numeric';
    if (includeWeekday) formatOptions.weekday = 'short';

    // 日本語ロケールの場合はdate-fnsを使用
    if (locale === 'ja-JP' || locale === 'ja') {
      const formatString = [includeYear ? 'yyyy年' : '', 'M月d日', includeWeekday ? '(E)' : '']
        .filter(Boolean)
        .join('');

      return format(date, formatString, { locale: ja });
    }

    // その他のロケールの場合はIntl.DateTimeFormatを使用
    return date.toLocaleDateString(locale, formatOptions);
  } catch (error) {
    console.error('日付フォーマットエラー:', error, { dateString, options });
    return type === 'group' ? '未定' : '日時未定';
  }
}

/**
 * 試合時間をフォーマットする
 * @param dateString - ISO形式の日付文字列
 * @returns フォーマットされた時間文字列
 */
export function formatMatchTime(dateString?: string | null): string {
  try {
    if (!dateString) return '--:--';

    // date-fns-tzを使用して日本時間に変換
    const date = toJapanTime(dateString);
    return format(date, 'HH:mm');
  } catch (error) {
    console.error('時間フォーマットエラー:', error, { dateString });
    return '--:--';
  }
}

/**
 * シンプルな日付フォーマット関数（yyyy/MM/dd形式）
 * @param dateString - 日付文字列
 * @returns フォーマット済み日付
 */
export function formatDate(dateString?: string | null): string {
  try {
    if (!dateString) return '日付なし';

    // ISO形式でない場合もあるのでtry-catchで囲む
    const date = parseISO(dateString);
    return format(date, 'yyyy/MM/dd');
  } catch (e) {
    // パースに失敗した場合は元の文字列を返す
    return dateString || '日付なし';
  }
}

// エイリアス関数
export const formatTime = formatMatchTime;
