/**
 * 試合イベントパネル
 * 試合中のイベント（ゴール・カード・交代など）をタイムライン形式で表示
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import OptimizedImage from '@/components/common/OptimizedImage';
import { Fixture, Event, MatchTeamPlayers } from '../types';
import { getEvents, getFixturesPlayers } from '../api/match-service';
import { Goal, AlertTriangle, ArrowRightLeft, Clock, RefreshCw, Flag } from 'lucide-react';
import { EVENT_FILTERS, EVENT_TEXT_MAP } from '../constants/matches';

interface EventsPanelProps {
  fixture: Fixture;
}

/**
 * イベントタイプに応じたアイコンを取得
 * @param type - イベントタイプ
 * @param detail - イベント詳細
 * @returns アイコンコンポーネント
 */
function getEventIcon(type: string, detail: string) {
  const iconProps = { className: 'w-5 h-5' };

  switch (type) {
    case 'Goal':
      return <Goal {...iconProps} className="w-5 h-5 text-green-600" />;
    case 'Card':
      return detail.includes('Yellow') ? (
        <AlertTriangle {...iconProps} className="w-5 h-5 text-yellow-500" />
      ) : (
        <AlertTriangle {...iconProps} className="w-5 h-5 text-red-600" />
      );
    case 'subst':
      return <ArrowRightLeft {...iconProps} className="w-5 h-5 text-purple-600" />;
    case 'Var':
      return <RefreshCw {...iconProps} className="w-5 h-5 text-blue-600" />;
    default:
      return <Clock {...iconProps} className="w-5 h-5 text-gray-500" />;
  }
}

/**
 * イベント表示テキストを取得
 * @param event - イベント情報
 * @returns 表示テキスト
 */
function getEventText(event: Event): string {
  const eventType = event.type as keyof typeof EVENT_TEXT_MAP;

  if (!EVENT_TEXT_MAP[eventType]) {
    return event.type;
  }

  if (typeof EVENT_TEXT_MAP[eventType] === 'string') {
    return EVENT_TEXT_MAP[eventType] as string;
  }

  // オブジェクトの場合（Goal, Cardなど）
  const detailMap = EVENT_TEXT_MAP[eventType] as Record<string, string>;
  return detailMap[event.detail] || detailMap['default'] || event.detail;
}

/**
 * イベントリストアイテムコンポーネント
 */
function EventItem({
  event,
  homeTeamId,
  playerPhotos,
}: {
  event: Event;
  homeTeamId: number;
  playerPhotos: Map<number, string>;
}) {
  const isHomeTeam = event.team.id === homeTeamId;
  const icon = getEventIcon(event.type, event.detail);
  const eventText = getEventText(event);

  const timeClass =
    'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100';

  // 選手の写真を取得
  const playerPhoto = event.player?.id ? playerPhotos.get(event.player.id) : null;
  const assistPhoto = event.assist?.id ? playerPhotos.get(event.assist.id) : null;

  // 選手交代の表示
  if (event.type === 'subst') {
    // 交代で出る選手（player）と入る選手（assist）の情報
    const outgoingPlayer = event.player;
    const incomingPlayer = event.assist;

    // 交代表示コンポーネント
    const SubstitutionContent = () => (
      <div className="flex flex-col items-center">
        <div className="flex items-center">
          {assistPhoto && (
            <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden mr-1 sm:mr-2">
              <OptimizedImage
                src={assistPhoto}
                alt={incomingPlayer.name || ''}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="font-medium text-xs sm:text-sm text-green-600 truncate max-w-[80px] sm:max-w-[120px]">
            {incomingPlayer.name}
          </div>
        </div>
        <div className="flex items-center my-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 sm:h-4 sm:w-4 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 sm:h-4 sm:w-4 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
        <div className="flex items-center">
          {playerPhoto && (
            <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden mr-1 sm:mr-2">
              <OptimizedImage
                src={playerPhoto}
                alt={outgoingPlayer.name || ''}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="font-medium text-xs sm:text-sm text-red-600 truncate max-w-[80px] sm:max-w-[120px]">
            {outgoingPlayer.name}
          </div>
        </div>
      </div>
    );

    return (
      <div className="flex items-center py-3 sm:py-4 border-b border-gray-100 last:border-b-0">
        <div className="w-1/2 flex justify-end mr-2 sm:mr-3">
          {isHomeTeam && <SubstitutionContent />}
        </div>
        <div className={timeClass}>
          <span className="text-xs sm:text-sm font-medium">{event.time.elapsed}&apos;</span>
        </div>
        <div className="w-1/2 flex ml-2 sm:ml-3">{!isHomeTeam && <SubstitutionContent />}</div>
      </div>
    );
  }

  // ホームチームとアウェイチームで表示位置を変える
  const homeContent = isHomeTeam ? (
    <div className="flex items-center">
      {playerPhoto && (
        <div className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden mr-1 sm:mr-2 border border-gray-200">
          <OptimizedImage
            src={playerPhoto}
            alt={event.player.name || ''}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-col">
        <div className="font-medium text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[150px]">
          {event.player.name}
        </div>
        <div className="text-gray-600 text-[10px] sm:text-xs">{eventText}</div>
        {event.assist && event.assist.name && event.type === 'Goal' && (
          <div className="text-gray-500 text-[10px] sm:text-xs flex items-center">
            アシスト:
            {assistPhoto && (
              <div className="relative w-3 h-3 sm:w-4 sm:h-4 rounded-full overflow-hidden mx-1">
                <OptimizedImage
                  src={assistPhoto}
                  alt={event.assist.name || ''}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <span className="truncate max-w-[60px] sm:max-w-[100px]">{event.assist.name}</span>
          </div>
        )}
      </div>
    </div>
  ) : null;

  const awayContent = !isHomeTeam ? (
    <div className="flex items-center">
      {playerPhoto && (
        <div className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden mr-1 sm:mr-2 border border-gray-200">
          <OptimizedImage
            src={playerPhoto}
            alt={event.player.name || ''}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-col">
        <div className="font-medium text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[150px]">
          {event.player.name}
        </div>
        <div className="text-gray-600 text-[10px] sm:text-xs">{eventText}</div>
        {event.assist && event.assist.name && event.type === 'Goal' && (
          <div className="text-gray-500 text-[10px] sm:text-xs flex items-center">
            アシスト:
            {assistPhoto && (
              <div className="relative w-3 h-3 sm:w-4 sm:h-4 rounded-full overflow-hidden mx-1">
                <OptimizedImage
                  src={assistPhoto}
                  alt={event.assist.name || ''}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <span className="truncate max-w-[60px] sm:max-w-[100px]">{event.assist.name}</span>
          </div>
        )}
      </div>
    </div>
  ) : null;

  // スコア表示（ゴールの場合）
  const scoreDisplay =
    event.type === 'Goal' && event.detail !== 'Missed Penalty' ? (
      <div className="text-[10px] sm:text-xs font-bold">{isHomeTeam ? '(1 - 0)' : '(1 - 0)'}</div>
    ) : null;

  return (
    <div className="flex items-center py-3 sm:py-4 border-b border-gray-100 last:border-b-0">
      <div className="w-1/2 flex justify-end mr-2 sm:mr-3">
        {homeContent}
        {isHomeTeam && (
          <div className="ml-1 sm:ml-2 flex items-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
      </div>
      <div className={timeClass}>
        <span className="text-xs sm:text-sm font-medium">{event.time.elapsed}&apos;</span>
      </div>
      <div className="w-1/2 flex ml-2 sm:ml-3">
        {!isHomeTeam && (
          <div className="mr-1 sm:mr-2 flex items-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
        {awayContent}
      </div>
    </div>
  );
}

/**
 * ハーフタイム時点のスコアを計算
 * @param events - イベントリスト
 * @param homeTeamId - ホームチームID
 * @returns ハーフタイム時点のスコア [ホームスコア, アウェイスコア]
 */
function calculateHalftimeScore(events: Event[], homeTeamId: number): [number, number] {
  let homeScore = 0;
  let awayScore = 0;

  // 前半（45分以下）のゴールをカウント
  events.forEach((event) => {
    if (event.type === 'Goal' && event.detail !== 'Missed Penalty' && event.time.elapsed <= 45) {
      // オウンゴールの場合は相手チームの得点
      if (event.detail === 'Own Goal') {
        if (event.team.id === homeTeamId) {
          awayScore++;
        } else {
          homeScore++;
        }
      } else {
        // 通常のゴールとペナルティ
        if (event.team.id === homeTeamId) {
          homeScore++;
        } else {
          awayScore++;
        }
      }
    }
  });

  return [homeScore, awayScore];
}

/**
 * ハーフタイム表示
 */
function HalftimeIndicator({ events, homeTeamId }: { events: Event[]; homeTeamId: number }) {
  // ハーフタイム時点のスコアを計算
  const [homeScore, awayScore] = calculateHalftimeScore(events, homeTeamId);

  return (
    <div className="py-4 my-2 bg-gray-50 rounded-lg">
      <div className="text-center font-medium">ハーフタイム</div>
      <div className="text-center text-sm text-gray-500">
        HT {homeScore} - {awayScore}
      </div>
    </div>
  );
}

/**
 * 試合終了表示
 */
function FulltimeIndicator({ homeScore, awayScore }: { homeScore: number; awayScore: number }) {
  return (
    <div className="py-4 my-2 bg-gray-100 rounded-lg">
      <div className="text-center font-medium flex items-center justify-center">
        <Flag className="w-4 h-4 mr-1" />
        試合終了
      </div>
      <div className="text-center text-sm font-bold">
        FT {homeScore} - {awayScore}
      </div>
    </div>
  );
}

/**
 * 追加時間表示
 */
function ExtraTimeIndicator({ minutes }: { minutes: number }) {
  return (
    <div className="py-2 my-2">
      <div className="text-center text-sm text-gray-500">+{minutes}分追加</div>
    </div>
  );
}

// カスタムイベント型
type CustomEvent =
  | Event
  | { type: 'halftime'; time: { elapsed: number } }
  | { type: 'extraTime'; time: { elapsed: number }; minutes: number }
  | { type: 'fulltime'; time: { elapsed: number } };

/**
 * イベントパネルコンポーネント
 * @param fixture - 試合情報
 * @returns イベントパネルUI
 */
export default function EventsPanel({ fixture }: EventsPanelProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [playerData, setPlayerData] = useState<MatchTeamPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  // 選手の写真をIDごとにマップ
  const playerPhotosMap = useMemo(() => {
    const map = new Map<number, string>();

    playerData.forEach((teamData) => {
      teamData.players.forEach((player) => {
        if (player.player.id && player.player.photo) {
          map.set(player.player.id, player.player.photo);
        }
      });
    });

    return map;
  }, [playerData]);

  // イベントデータを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventsData, playersData] = await Promise.all([
          getEvents(fixture.id.toString()),
          getFixturesPlayers(fixture.id.toString()),
        ]);

        // 時間順にソート
        const sortedEvents = [...eventsData].sort((a, b) => {
          if (a.time.elapsed !== b.time.elapsed) {
            return a.time.elapsed - b.time.elapsed;
          }
          return (a.time.extra || 0) - (b.time.extra || 0);
        });

        setEvents(sortedEvents);
        setPlayerData(playersData);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('データの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fixture.id]);

  // 表示するイベントをフィルタリング
  const filteredEvents = events.filter((event) => {
    if (filter === 'all') return true;
    if (filter === 'goals' && event.type === 'Goal') return true;
    if (filter === 'cards' && event.type === 'Card') return true;
    if (filter === 'subs' && event.type === 'subst') return true;
    return false;
  });

  // 前半と後半を区別するためにイベントを処理
  const processedEvents: CustomEvent[] = filteredEvents.reduce(
    (acc: CustomEvent[], event, index, array) => {
      // 45分の次のイベントがハーフタイム後（46分以降）なら、ハーフタイムを挿入
      if (
        index > 0 &&
        array[index - 1].time.elapsed <= 45 &&
        event.time.elapsed > 45 &&
        !acc.some((e) => e.type === 'halftime')
      ) {
        acc.push({ type: 'halftime', time: { elapsed: 45 } });
      }

      // 追加時間（45+を検出）
      if (
        index > 0 &&
        array[index - 1].time.elapsed === 45 &&
        event.time.extra &&
        !acc.some((e) => e.type === 'extraTime' && 'elapsed' in e.time && e.time.elapsed === 45)
      ) {
        acc.push({
          type: 'extraTime',
          time: { elapsed: 45 },
          minutes: event.time.extra,
        });
      }

      // 90分の追加時間
      if (
        index > 0 &&
        array[index - 1].time.elapsed === 90 &&
        event.time.extra &&
        !acc.some((e) => e.type === 'extraTime' && 'elapsed' in e.time && e.time.elapsed === 90)
      ) {
        acc.push({
          type: 'extraTime',
          time: { elapsed: 90 },
          minutes: event.time.extra,
        });
      }

      acc.push(event);
      return acc;
    },
    []
  );

  // 試合終了表示を追加（試合状態が終了の場合）
  if (fixture.status.short === 'FT' && !processedEvents.some((e) => e.type === 'fulltime')) {
    processedEvents.push({ type: 'fulltime', time: { elapsed: 90 } });
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-gray-200 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  // イベントがない場合
  if (events.length === 0) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">イベントなし</h3>
        <p className="text-yellow-700">
          この試合のイベントデータはまだありません。試合開始後にイベントが表示されます。
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-center text-lg sm:text-xl font-semibold mb-4 sm:mb-6">イベント</h3>

      {/* フィルター */}
      <div className="flex overflow-x-auto pb-2 mb-4 sm:mb-6 justify-center">
        {EVENT_FILTERS.map((filterOption) => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id)}
            className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full mr-1 sm:mr-2 whitespace-nowrap flex items-center text-xs sm:text-sm ${
              filter === filterOption.id
                ? filterOption.activeClass
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterOption.icon && <filterOption.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* イベントリスト表示 */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
        {processedEvents.map((item, index) => {
          if (item.type === 'halftime') {
            return (
              <HalftimeIndicator
                key={`halftime-${index}`}
                events={events}
                homeTeamId={Number(fixture.teams.home.id)}
              />
            );
          }

          if (item.type === 'fulltime') {
            return (
              <FulltimeIndicator
                key={`fulltime-${index}`}
                homeScore={fixture.goals.home || 0}
                awayScore={fixture.goals.away || 0}
              />
            );
          }

          if (item.type === 'extraTime' && 'minutes' in item) {
            return <ExtraTimeIndicator key={`extraTime-${index}`} minutes={item.minutes} />;
          }

          if ('player' in item && 'team' in item) {
            return (
              <EventItem
                key={`event-${index}`}
                event={item}
                homeTeamId={Number(fixture.teams.home.id)}
                playerPhotos={playerPhotosMap}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
