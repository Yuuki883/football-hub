import React, { useEffect, useState } from 'react';

import { Match } from '@/types/match';
import MatchItem from './MatchItem';
import SmartMatchCalendar from './SmartMatchCalendar';
import { cn } from '@/lib/utils/cn';

interface AllMatchesSectionProps {
  matches: Match[];
  allDates: Date[];
}

// 日付ごとの試合を表示するセクション
const AllMatchesSection: React.FC<AllMatchesSectionProps> = ({
  matches,
  allDates,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // デフォルト値は今日
    return new Date();
  });
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);

  // 選択された日付に基づいて試合をフィルタリング
  useEffect(() => {
    if (!matches || matches.length === 0) {
      setFilteredMatches([]);
      return;
    }

    const filtered = matches.filter((match) => {
      const matchDate = new Date(match.utcDate);
      return (
        matchDate.getFullYear() === selectedDate.getFullYear() &&
        matchDate.getMonth() === selectedDate.getMonth() &&
        matchDate.getDate() === selectedDate.getDate()
      );
    });

    setFilteredMatches(filtered);
  }, [selectedDate, matches]);

  // リーグでグループ化
  const matchesByLeague = filteredMatches.reduce<Record<string, Match[]>>(
    (groups, match) => {
      const league = match.competition.name;
      if (!groups[league]) {
        groups[league] = [];
      }
      groups[league].push(match);
      return groups;
    },
    {}
  );

  // 日付が選択された時のハンドラ
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="flex flex-col space-y-4">
      <SmartMatchCalendar
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        selectedLeague="ALL"
      />

      <div className="space-y-4">
        {Object.keys(matchesByLeague).length > 0 ? (
          Object.entries(matchesByLeague).map(([league, matches]) => (
            <div
              key={league}
              className={cn(
                'border border-gray-200 rounded-lg shadow-sm overflow-hidden'
              )}
            >
              <div
                className={cn(
                  'bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 flex justify-between items-center'
                )}
              >
                <h3>{league}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {matches.map((match) => (
                  <MatchItem key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            選択された日付の試合はありません
          </div>
        )}
      </div>
    </div>
  );
};

export default AllMatchesSection;
