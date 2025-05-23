'use client';

import Image from 'next/image';
import { memo } from 'react';
import { Event, MatchPlayerEntry, MatchPlayerPerformance, Team } from '../../types/match.types';

/**
 * レーティングに応じた背景色を取得する関数
 * @param rating - 選手のレーティング値
 * @returns 対応するTailwindクラス名
 */
const getRatingBackground = (rating: number) => {
  if (rating >= 8.5) return 'bg-green-500';
  if (rating >= 7.5) return 'bg-blue-500';
  if (rating >= 6.5) return 'bg-orange-500';
  if (rating >= 5.5) return 'bg-gray-500';
  return 'bg-red-500';
};

/**
 * サブ選手リストアイテムコンポーネント
 * 選手情報と交代情報などを表示
 */
interface SubPlayerItemProps {
  entry: MatchPlayerEntry;
  perfMap: Map<number, MatchPlayerPerformance>;
  events: Event[];
  onClick: (id: number) => void;
  isSubbedIn?: boolean;
}

const SubPlayerItem = memo(
  ({ entry, perfMap, events, onClick, isSubbedIn = false }: SubPlayerItemProps) => {
    const { player } = entry;
    const playerPerf = perfMap.get(player.id);
    const ratingValue = playerPerf?.statistics[0]?.games.rating
      ? parseFloat(playerPerf.statistics[0].games.rating)
      : null;
    const ratingText = ratingValue ? ratingValue.toFixed(1) : null;
    const ratingBgColor = ratingValue ? getRatingBackground(ratingValue) : 'bg-gray-500';
    const isOutstanding = ratingValue && ratingValue >= 8.0;

    // 交代イベント
    const subEvent = events.find((e) => e.type === 'subst' && e.assist?.id === player.id);

    // 交代時間
    const subTime = subEvent
      ? `${subEvent.time.elapsed}${subEvent.time.extra ? `+${subEvent.time.extra}` : ''}`
      : null;

    // イエローカード
    const yellowCard = events.some(
      (e) => e.type === 'Card' && e.detail === 'Yellow Card' && e.player.id === player.id
    );

    // レッドカード
    const redCard = events.some(
      (e) =>
        e.type === 'Card' &&
        (e.detail === 'Red Card' || e.detail === 'Second Yellow card') &&
        e.player.id === player.id
    );

    // ゴール取得
    const goals = events.filter(
      (e) =>
        e.player.id === player.id &&
        (e.type === 'Goal' ||
          e.detail === 'Normal Goal' ||
          (e.detail?.includes('Goal') && e.type !== 'Var'))
    );

    // アシスト数カウント
    const assists = events.filter((e) => e.assist?.id === player.id && e.type !== 'subst');

    return (
      <div
        className={`flex items-center p-2 hover:bg-gray-50 cursor-pointer ${
          isSubbedIn ? 'bg-green-50' : ''
        }`}
        onClick={() => onClick(player.id)}
      >
        <div className="flex items-center w-full">
          {/* 背番号 */}
          <div className="w-8 h-8 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center mr-3 font-bold text-gray-700">
            {player.number}
          </div>

          {/* 選手プロフィール */}
          <div className="flex-1 flex items-center">
            {/* 選手写真 */}
            <div className="relative w-10 h-10 mr-3 flex-shrink-0">
              {playerPerf?.player.photo ? (
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={playerPerf.player.photo}
                    alt={player.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-full"></div>
              )}
            </div>

            {/* 選手名・ポジション */}
            <div>
              <div className="font-medium text-sm leading-tight">{player.name}</div>
              <div className="text-xs text-gray-500 flex items-center">
                <span>{player.pos}</span>
                {subTime && isSubbedIn && (
                  <span className="ml-2 flex items-center text-green-600 font-medium">
                    <span className="mr-0.5 text-xs">→</span>
                    <span>{subTime}&apos;</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* イベントバッジ */}
          <div className="flex items-center ml-auto space-x-2">
            {/* ゴール */}
            {goals.length > 0 && (
              <div className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                {goals.length > 1 ? goals.length : 'G'}
              </div>
            )}

            {/* アシスト */}
            {assists.length > 0 && (
              <div className="bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                {assists.length > 1 ? assists.length : 'A'}
              </div>
            )}

            {/* カード */}
            {yellowCard && (
              <div className="bg-yellow-400 w-3.5 h-4.5 rounded-sm border border-yellow-500 shadow-sm"></div>
            )}

            {redCard && (
              <div className="bg-red-600 w-3.5 h-4.5 rounded-sm border border-red-700 shadow-sm"></div>
            )}

            {/* レーティング */}
            {ratingText && (
              <div
                className={`${ratingBgColor} text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                  isOutstanding ? 'ring-1 ring-yellow-300' : ''
                }`}
              >
                {ratingText}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

SubPlayerItem.displayName = 'SubPlayerItem';

/**
 * チーム控え選手リストコンポーネント
 */
interface SubstituteListProps {
  team: Team;
  subs: MatchPlayerEntry[];
  color: string;
  events: Event[];
  perfMap: Map<number, MatchPlayerPerformance>;
  onPlayerClick: (id: number) => void;
}

const SubstituteList = memo(
  ({ team, subs, color, events, perfMap, onPlayerClick }: SubstituteListProps) => {
    // 背景色のスタイル
    const bgColor = color === 'blue' ? 'bg-blue-600' : 'bg-red-600';

    // 交代で出場した選手をフィルタリング
    const playedSubs = subs.filter((entry) => {
      return events.some((e) => e.type === 'subst' && e.assist?.id === entry.player.id);
    });

    // 出場していない控え選手
    const unusedSubs = subs.filter((entry) => {
      return !events.some((e) => e.type === 'subst' && e.assist?.id === entry.player.id);
    });

    if (subs.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-4 text-center text-gray-500">
          控え選手情報がありません
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        {/* チーム情報ヘッダー */}
        <div className={`${bgColor} py-2 px-4`}>
          <div className="flex items-center">
            <div className="relative w-6 h-6 mr-2">
              <Image src={team.logo} alt={team.name} fill className="object-contain" />
            </div>
            <h4 className="text-white font-semibold">{team.name}</h4>
          </div>
        </div>

        {/* 控え選手リスト - 出場した選手 */}
        {playedSubs.length > 0 && (
          <div>
            <div className="px-4 py-1.5 bg-green-50 text-green-800 text-xs font-medium border-b border-green-100">
              出場選手 ({playedSubs.length})
            </div>
            <div>
              {playedSubs.map((entry) => (
                <SubPlayerItem
                  key={`sub-${entry.player.id}`}
                  entry={entry}
                  perfMap={perfMap}
                  events={events}
                  onClick={(id) => onPlayerClick(id)}
                  isSubbedIn={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* 控え選手リスト - 出場していない選手 */}
        {unusedSubs.length > 0 && (
          <div>
            {playedSubs.length > 0 && (
              <div className="px-4 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium border-b border-gray-100">
                未出場 ({unusedSubs.length})
              </div>
            )}
            <div>
              {unusedSubs.map((entry) => (
                <SubPlayerItem
                  key={`sub-${entry.player.id}`}
                  entry={entry}
                  perfMap={perfMap}
                  events={events}
                  onClick={(id) => onPlayerClick(id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

SubstituteList.displayName = 'SubstituteList';

export default SubstituteList;
