'use client';

import Image from 'next/image';
import { memo } from 'react';
import { Event, PlayerEntry, PlayerStatistics } from '../../types/match.types';

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
 * レーティングに応じたテキスト色を取得する関数
 * @param rating - 選手のレーティング値
 * @returns 対応するTailwindクラス名
 */
const getRatingTextColor = (rating: number) => {
  if (rating >= 8.5) return 'text-green-500';
  if (rating >= 7.5) return 'text-blue-500';
  if (rating >= 6.5) return 'text-orange-500';
  if (rating >= 5.5) return 'text-gray-500';
  return 'text-red-500';
};

/**
 * 選手のイベントバッジコンポーネント
 */
const EventBadges = ({ events, playerId }: { events: Event[]; playerId: number }) => {
  const goalEvents = events.filter(
    (e) =>
      e.player.id === playerId &&
      (e.type === 'Goal' || e.detail === 'Normal Goal' || e.detail?.includes('Goal'))
  );
  const ownGoalEvents = events.filter((e) => e.player.id === playerId && e.detail === 'Own Goal');
  const assistEvents = events.filter((e) => e.assist?.id === playerId && e.type !== 'subst');
  const substitutionEvent = events.find(
    (e) => e.type === 'subst' && (e.player.id === playerId || e.assist?.id === playerId)
  );
  const isSubbedIn = substitutionEvent && substitutionEvent.assist?.id === playerId;
  const yellowCard = events.find(
    (e) => e.type === 'Card' && e.detail === 'Yellow Card' && e.player.id === playerId
  );
  const redCard = events.find(
    (e) =>
      e.type === 'Card' &&
      (e.detail === 'Red Card' || e.detail === 'Second Yellow card') &&
      e.player.id === playerId
  );

  return (
    <>
      {/* 交代 左上（小さめ） */}
      {substitutionEvent && (
        <div className="absolute -top-2 -left-2 z-20">
          <div
            className={`${isSubbedIn ? 'bg-green-600' : 'bg-red-500'} rounded-full w-4 h-4 flex items-center justify-center shadow-md`}
          >
            <span className="text-white text-[10px]">{isSubbedIn ? '→' : '↓'}</span>
          </div>
        </div>
      )}
      {/* カード 左（小さめ） */}
      <div className="absolute left-[-18px] top-1/2 -translate-y-1/2 flex flex-col gap-0.5 z-20">
        {yellowCard && (
          <div className="bg-yellow-400 w-3.5 h-4 rounded-sm border border-yellow-500 shadow-sm"></div>
        )}
        {redCard && (
          <div className="bg-red-600 w-3.5 h-4 rounded-sm border border-red-700 shadow-sm"></div>
        )}
      </div>
      {/* ゴール・オウンゴール 右下（小さめ） */}
      <div className="absolute -bottom-2 -right-2 flex flex-col items-end gap-0.5 z-20">
        {goalEvents.length > 0 && (
          <div className="bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
            {goalEvents.length > 1 ? goalEvents.length : 'G'}
          </div>
        )}
        {ownGoalEvents.length > 0 && (
          <div className="bg-blue-300 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
            OG
          </div>
        )}
      </div>
      {/* アシスト 左下（小さめ） */}
      <div className="absolute -bottom-2 -left-2 flex flex-col items-start gap-0.5 z-20">
        {assistEvents.length > 0 && (
          <div className="bg-green-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
            {assistEvents.length > 1 ? `A${assistEvents.length}` : 'A'}
          </div>
        )}
      </div>
    </>
  );
};

/**
 * 選手アイコンコンポーネントのProps型定義
 */
export interface PlayerIconProps {
  player: PlayerEntry['player'];
  events: Event[];
  stats?: PlayerStatistics;
  teamColor: 'blue' | 'red';
  onClick: () => void;
  photo?: string;
  isMotm?: boolean;
}

/**
 * 選手アイコンコンポーネント
 * ピッチ上に表示される選手のアイコンと情報を表示する
 */
const PlayerIcon = memo(
  ({ player, events, stats, teamColor, onClick, photo, isMotm }: PlayerIconProps) => {
    const rating = stats?.games.rating ? parseFloat(stats.games.rating) : null;
    const ratingText = rating ? rating.toFixed(1) : null;
    const ratingBgColor = rating ? getRatingBackground(rating) : 'bg-gray-500';
    const ratingTextColor = rating ? getRatingTextColor(rating) : 'text-gray-500';
    const border = teamColor === 'blue' ? 'border-blue-600' : 'border-red-600';

    return (
      <div className="flex flex-col items-center cursor-pointer group" onClick={onClick}>
        {/* relativeラッパーでoverflow: visibleを明示 */}
        <div className="relative w-12 h-12" style={{ overflow: 'visible' }}>
          {/* アイコン本体 */}
          <div
            className={`w-12 h-12 rounded-full bg-white overflow-hidden border-2 ${border} shadow-md transition-transform duration-200 group-hover:scale-110`}
          >
            {photo ? (
              <Image src={photo} alt={player.name} fill className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold bg-gray-100">
                {player.number}
              </div>
            )}
          </div>
          {/* バッジ群 */}
          <EventBadges events={events} playerId={player.id} />
          {/* レーティング 右上（小さめ） */}
          {rating && (
            <div
              className={`absolute -top-2 -right-2 ${ratingBgColor} text-white rounded-full flex items-center justify-center text-[10px] font-bold border border-white shadow-md w-5 h-5 z-20`}
            >
              {ratingText}
            </div>
          )}
          {/* MOTM表示 */}
          {isMotm && (
            <div className="absolute -top-6 right-1/2 translate-x-1/2 bg-gradient-to-r from-yellow-500 to-yellow-300 text-yellow-900 text-[9px] px-1 py-0.5 rounded-sm font-bold shadow-md z-20">
              MOTM
            </div>
          )}
        </div>
        {/* 選手名＋背番号（左横） */}
        <div className="flex items-center mt-1 z-10">
          <span className="bg-gray-800 text-white text-xs rounded px-1 py-0.5 mr-1 font-bold shadow">
            {player.number}
          </span>
          <span className="bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap font-medium shadow-md">
            {player.name.split(' ').pop()}
          </span>
        </div>
      </div>
    );
  }
);

PlayerIcon.displayName = 'PlayerIcon';

export default PlayerIcon;
