'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, isSameDay, parseISO, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';

interface MatchCalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  selectedLeague?: string;
  hasMatches?: boolean; // 試合があるかどうかを親コンポーネントから受け取る
}

/**
 * 試合カレンダーコンポーネント
 * 日付選択とカレンダー表示を提供する
 */
export default function MatchCalendar({
  onDateSelect,
  selectedDate: propSelectedDate,
  selectedLeague,
  hasMatches,
}: MatchCalendarProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(propSelectedDate || new Date());

  // 試合がある日付一覧を取得
  const {
    data: availableDates = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['match-dates', selectedLeague],
    queryFn: async () => {
      if (!selectedLeague) {
        return [];
      }

      try {
        const response = await fetch(`/api/matches?league=${selectedLeague}&datesOnly=true`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            `日付データの取得に失敗しました: ${response.status} ${
              errorData?.error || response.statusText
            }`
          );
        }

        const data = await response.json();
        return (data.dates || []).map((dateStr: string) => parseISO(dateStr));
      } catch (error) {
        console.error('カレンダー日付の取得エラー:', error);
        throw error;
      }
    },
    staleTime: 12 * 60 * 60 * 1000, // 12時間キャッシュ
    retry: 1,
    enabled: !!selectedLeague,
  });

  // クライアントサイドレンダリングとprops更新の処理
  useEffect(() => {
    setIsMounted(true);
    if (propSelectedDate) setSelectedDate(propSelectedDate);
  }, [propSelectedDate]);

  // シンプル化した日付移動関数
  const navigateDate = (direction: 'prev' | 'next', unit: 'day' | 'month') => {
    const newDate = new Date(selectedDate);

    if (unit === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      // 1日ずつ移動
      const daysToAdd = direction === 'next' ? 1 : -1;
      newDate.setDate(newDate.getDate() + daysToAdd);
    }

    updateDate(newDate);
  };

  // 日付更新の共通処理
  const updateDate = (date: Date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  // 日付選択処理
  const handleDateSelect = (date: Date) => {
    updateDate(date);
    setIsCalendarOpen(false);
  };

  // サーバーサイドレンダリング時のスケルトン表示
  if (!isMounted) {
    return <div className="mb-6 h-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-center mb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateDate('prev', 'day')}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="前日"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Calendar className="w-4 h-4 mr-1" />
            {format(selectedDate, 'yyyy年M月d日(E)', { locale: ja })}
          </button>
          <button
            onClick={() => navigateDate('next', 'day')}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="翌日"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* エラーメッセージ */}
      {isError && (
        <div className="text-xs text-red-500 text-center mb-2">データの読み込みに失敗しました</div>
      )}

      {/* カレンダーモーダル */}
      {isCalendarOpen && (
        <div className="relative z-10">
          <div
            className="fixed inset-0 bg-black bg-opacity-25"
            onClick={() => setIsCalendarOpen(false)}
          ></div>
          <div className="absolute mt-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => navigateDate('prev', 'month')}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="前の月"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <h3 className="text-lg font-semibold">
                {format(selectedDate, 'yyyy年M月', { locale: ja })}
              </h3>
              <div className="flex items-center">
                <button
                  onClick={() => navigateDate('next', 'month')}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-2"
                  aria-label="次の月"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => setIsCalendarOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="カレンダーを閉じる"
                >
                  ✕
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="p-4 text-center">データを読み込み中...</div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {/* 曜日ヘッダー */}
                {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium p-2">
                    {day}
                  </div>
                ))}

                {/* カレンダー日付 - すべての日を選択可能に */}
                {generateCalendar(selectedDate, availableDates).map((calDay, index) => {
                  const hasMatch = availableDates.some((d: Date) => isSameDay(d, calDay.date));

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(calDay.date)}
                      className={`
                        text-center p-2 rounded
                        ${calDay.isCurrentMonth ? '' : 'text-gray-400'}
                        hover:bg-gray-100 dark:hover:bg-gray-700
                        ${hasMatch ? 'font-medium' : ''}
                        ${
                          isSameDay(calDay.date, selectedDate)
                            ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100'
                            : ''
                        }
                        ${isToday(calDay.date) ? 'border border-blue-500' : ''}
                      `}
                      title={hasMatch ? '試合あり' : ''}
                    >
                      {format(calDay.date, 'd')}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// カレンダー日付生成（シンプル化）
function generateCalendar(baseDate: Date, availableDates: Date[] = []) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  // 月の最初と最後の日
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 表示に必要な前月の日数
  const prevMonthDays = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const calendarDays = [];

  // 前月の日付を追加
  for (let i = 0; i < prevMonthDays; i++) {
    const date = new Date(year, month, 1 - (prevMonthDays - i));
    calendarDays.push({
      date,
      isCurrentMonth: false,
    });
  }

  // 当月の日付を追加
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    calendarDays.push({
      date,
      isCurrentMonth: true,
    });
  }

  // 次月の日付を追加（6週間=42日になるまで）
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    calendarDays.push({
      date,
      isCurrentMonth: false,
    });
  }

  return calendarDays;
}
