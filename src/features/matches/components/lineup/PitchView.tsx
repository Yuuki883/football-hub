'use client';

import Image from 'next/image';
import { useCallback } from 'react';
import { Lineup, Event, MatchPlayerPerformance, MatchPlayerEntry } from '../../types';
import { sortByGrid, posStyle } from '../../utils/grid-utils';
import PlayerIcon from './PlayerIcon';
import { TEAM_COLORS } from '../../constants/matches';
import { isApiFootballImage } from '@/utils/image-helpers';

/**
 * ピッチ表示コンポーネントのProps
 */
interface PitchViewProps {
  homeLineup: Lineup;
  awayLineup: Lineup;
  events: Event[];
  perfMap: Map<number, MatchPlayerPerformance>;
  onPlayerClick: (id: number) => void;
}

/**
 * ピッチ表示コンポーネント
 * フォーメーション、選手配置を視覚的に表示する
 */
function PitchView({ homeLineup, awayLineup, events, perfMap, onPlayerClick }: PitchViewProps) {
  // 選手に関連するイベントを取得
  const playerEvents = useCallback(
    (id: number) => events.filter((e) => e.player.id === id || e.assist?.id === id),
    [events]
  );

  // 選手の統計情報を取得
  const playerStats = useCallback((id: number) => perfMap.get(id)?.statistics[0], [perfMap]);

  // 最高レーティングの選手を特定
  const findHighestRatedPlayer = useCallback(() => {
    let highestRating = 0;
    let highestRatedPlayerId = null;

    perfMap.forEach((perf, playerId) => {
      const rating = parseFloat(perf.statistics[0]?.games.rating || '0');
      if (rating > highestRating) {
        highestRating = rating;
        highestRatedPlayerId = playerId;
      }
    });

    return highestRatedPlayerId;
  }, [perfMap]);

  const highestRatedPlayerId = findHighestRatedPlayer();

  // チーム（ホーム/アウェイ）の選手配置をレンダリング
  const renderSide = (entries: MatchPlayerEntry[], side: 'home' | 'away', color: string) =>
    entries
      .filter((e: MatchPlayerEntry) => e.player?.grid)
      .sort(sortByGrid)
      .map((entry: MatchPlayerEntry) => {
        const p = entry.player;
        const perf = perfMap.get(p.id);
        return (
          <div
            key={`${side}-${p.id}`}
            className="absolute"
            style={posStyle(p.grid as string, side, entries)}
          >
            <PlayerIcon
              player={p}
              events={playerEvents(p.id)}
              stats={playerStats(p.id)}
              teamColor={color as 'blue' | 'red'}
              onClick={() => onPlayerClick(p.id)}
              photo={perf?.player.photo}
              isMotm={p.id === highestRatedPlayerId}
            />
          </div>
        );
      });

  return (
    <div className="relative w-full aspect-[16/9] bg-green-700 rounded-lg overflow-hidden shadow-xl">
      {/* ピッチの背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-600 to-green-700"></div>

      {/* 芝*/}
      <div className="absolute inset-0">
        <div
          className="h-full w-full opacity-30"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to right, rgba(255,255,255,0.08), rgba(255,255,255,0.08) 25px, transparent 25px, transparent 50px)',
          }}
        ></div>
        <div
          className="h-full w-full opacity-25"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.08) 25px, transparent 25px, transparent 50px)',
          }}
        ></div>
      </div>

      {/* ピッチのマーキング */}
      <div className="absolute inset-0">
        {/* 外枠 */}
        <div className="absolute inset-[3%] border-2 border-white/30 rounded-md"></div>

        {/* センターライン */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/40 -translate-x-[0.5px]"></div>

        {/* センターサークル */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/30 rounded-full"></div>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/40 rounded-full"></div>

        {/* ペナルティエリア（左） */}
        <div className="absolute left-[3%] top-1/2 transform -translate-y-1/2 w-[18%] h-[65%] border-r-2 border-y-2 border-white/30"></div>
        <div className="absolute left-[3%] w-[6%] h-[30%] top-1/2 transform -translate-y-1/2 border-r-2 border-y-2 border-white/20"></div>

        {/* ペナルティスポット（左） */}
        <div className="absolute left-[15%] top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-white/40 rounded-full"></div>

        {/* ペナルティエリア（右） */}
        <div className="absolute right-[3%] top-1/2 transform -translate-y-1/2 w-[18%] h-[65%] border-l-2 border-y-2 border-white/30"></div>
        <div className="absolute right-[3%] w-[6%] h-[30%] top-1/2 transform -translate-y-1/2 border-l-2 border-y-2 border-white/20"></div>

        {/* ペナルティスポット（右） */}
        <div className="absolute right-[15%] top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-white/40 rounded-full"></div>

        {/* コーナーフラッグ表現 */}
        <div className="absolute top-[3%] left-[3%] w-3 h-3 border-t-2 border-l-2 border-white/30 rounded-tl-sm"></div>
        <div className="absolute top-[3%] right-[3%] w-3 h-3 border-t-2 border-r-2 border-white/30 rounded-tr-sm"></div>
        <div className="absolute bottom-[3%] left-[3%] w-3 h-3 border-b-2 border-l-2 border-white/30 rounded-bl-sm"></div>
        <div className="absolute bottom-[3%] right-[3%] w-3 h-3 border-b-2 border-r-2 border-white/30 rounded-br-sm"></div>
      </div>

      {/* チーム名とフォーメーション表示 */}
      <div className="absolute top-2 left-4 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shadow-md flex items-center space-x-2 z-10">
        <div className="relative w-5 h-5">
          <Image
            src={homeLineup.team.logo}
            alt={homeLineup.team.name}
            fill
            className="object-contain"
            unoptimized={isApiFootballImage(homeLineup.team.logo)}
          />
        </div>
        <div className="flex flex-col">
          <div className="text-white text-xs">{homeLineup.team.name}</div>
          <div className="text-[10px] text-white/80">{homeLineup.formation}</div>
        </div>
      </div>

      <div className="absolute top-2 right-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold shadow-md flex items-center space-x-2 z-10">
        <div className="flex flex-col items-end">
          <div className="text-white text-xs">{awayLineup.team.name}</div>
          <div className="text-[10px] text-white/80">{awayLineup.formation}</div>
        </div>
        <div className="relative w-5 h-5">
          <Image
            src={awayLineup.team.logo}
            alt={awayLineup.team.name}
            fill
            className="object-contain"
            unoptimized={isApiFootballImage(awayLineup.team.logo)}
          />
        </div>
      </div>

      {/* 選手配置のレンダリング */}
      {renderSide(homeLineup.startXI, 'home', TEAM_COLORS.home)}
      {renderSide(awayLineup.startXI, 'away', TEAM_COLORS.away)}
    </div>
  );
}

export default PitchView;
