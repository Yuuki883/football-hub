import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ja } from 'date-fns/locale';

export function formatMatchDate(
  dateString: string,
  type: 'display' | 'group' = 'display'
) {
  const date = new Date(dateString);

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
  const date = new Date(dateString);
  return format(date, 'HH:mm');
}
