'use client';

import Image from 'next/image';
import React, { memo, useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  Fixture,
  Lineup,
  PlayerEntry,
  Event,
  TeamPlayers,
  PlayerPerformance,
  PlayerStatistics,
} from '../types/match.types';
import { getLineups, getEvents, getFixturesPlayers } from '../api/match-service';
import PlayerPerformanceModal from './PlayerPerformanceModal';
import { TEAM_COLORS } from '../constants/matches';
/* -------------------------------------------------------------------------- */
/*  1. 汎用 util – 10×10 グリッド → CSS 位置                                  */
/* -------------------------------------------------------------------------- */
const posStyle = (grid: string, side: 'home' | 'away'): CSSProperties => {
  // grid = "row:col" (1-10, 1-10)
  const [row, col] = grid.split(':').map((n) => Number(n) || 1);
  const top = (row - 1) * 10; // 0-90%
  const left =
    side === 'home'
      ? 10 + (col - 1) * 4 // 10-46%
      : 90 - (col - 1) * 4; // 90-54%

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: 'translate(-50%,-50%)',
  };
};

/* -------------------------------------------------------------------------- */
/*  2. ソート – 10×10 前提                                                     */
/* -------------------------------------------------------------------------- */
const sortByGrid = (a: PlayerEntry, b: PlayerEntry) => {
  if (!a.player?.grid) return 1;
  if (!b.player?.grid) return -1;
  const [rA, cA] = a.player.grid.split(':').map(Number);
  const [rB, cB] = b.player.grid.split(':').map(Number);
  return rA === rB ? cA - cB : rA - rB;
};

/* -------------------------------------------------------------------------- */
/*  3. PlayerIcon (memo)                                                       */
/* -------------------------------------------------------------------------- */
interface PlayerIconProps {
  player: PlayerEntry['player'];
  events: Event[];
  stats?: PlayerStatistics;
  teamColor: 'blue' | 'red';
  onClick: () => void;
  photo?: string;
}
const PlayerIcon = memo(({ player, events, stats, teamColor, onClick, photo }: PlayerIconProps) => {
  const rating = stats?.games.rating ? parseFloat(stats.games.rating).toFixed(1) : null;

  const border = teamColor === 'blue' ? 'border-blue-600' : 'border-red-600';

  return (
    <div className="relative cursor-pointer" onClick={onClick}>
      {rating && (
        <div className="absolute -top-3 -left-3 bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border border-white shadow">
          {rating}
        </div>
      )}

      <div
        className={`relative w-14 h-14 rounded-full bg-white overflow-hidden border-2 ${border} shadow-lg`}
      >
        {photo ? (
          <Image src={photo} alt={player.name} fill className="object-cover" />
        ) : (
          <span className="flex w-full h-full items-center justify-center font-bold">
            {player.number}
          </span>
        )}
      </div>

      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-white text-xs bg-black/60 px-1 rounded">
        {player.number} {player.name.split(' ').pop()}
      </span>
    </div>
  );
});

PlayerIcon.displayName = 'PlayerIcon';

/* -------------------------------------------------------------------------- */
/*  4. PitchView                                                               */
/* -------------------------------------------------------------------------- */
function PitchView({
  homeLineup,
  awayLineup,
  events,
  perfMap,
  onPlayerClick,
}: {
  homeLineup: Lineup;
  awayLineup: Lineup;
  events: Event[];
  perfMap: Map<number, PlayerPerformance>;
  onPlayerClick: (id: number) => void;
}) {
  const playerEvents = useCallback(
    (id: number) => events.filter((e) => e.player.id === id || e.assist?.id === id),
    [events]
  );

  const playerStats = useCallback((id: number) => perfMap.get(id)?.statistics[0], [perfMap]);

  const renderSide = (entries: PlayerEntry[], side: 'home' | 'away', color: string) =>
    entries
      .filter((e) => e.player?.grid)
      .sort(sortByGrid)
      .map((entry) => {
        const p = entry.player;
        const perf = perfMap.get(p.id);
        return (
          <div
            key={`${side}-${p.id}`}
            className="absolute"
            style={posStyle(p.grid as string, side)}
          >
            <PlayerIcon
              player={p}
              events={playerEvents(p.id)}
              stats={playerStats(p.id)}
              teamColor={color as 'blue' | 'red'}
              onClick={() => onPlayerClick(p.id)}
              photo={perf?.player.photo}
            />
          </div>
        );
      });

  return (
    <div className="relative w-full aspect-[16/9] bg-green-800 rounded-lg overflow-hidden shadow-xl">
      {/* ピッチの背景 */}
      <div className="absolute inset-0 bg-gradient-radial from-green-600 via-green-700 to-green-800"></div>
      <div className="absolute inset-0">
        {/* 縞模様パターン */}
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to right, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 25px, transparent 25px, transparent 50px)',
          }}
        ></div>
      </div>

      {/* ピッチのマーキング */}
      <div className="absolute inset-0">
        {/* 外枠 */}
        <div className="absolute inset-[5%] border-2 border-white/30 rounded-md"></div>

        {/* センターライン */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/40"></div>

        {/* センターサークル */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/30 rounded-full"></div>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/50 rounded-full"></div>

        {/* ペナルティエリア（左） */}
        <div className="absolute left-[5%] top-1/2 transform -translate-y-1/2 w-[18%] h-[60%] border-r-2 border-y-2 border-white/30"></div>

        {/* ペナルティエリア（右） */}
        <div className="absolute right-[5%] top-1/2 transform -translate-y-1/2 w-[18%] h-[60%] border-l-2 border-y-2 border-white/30"></div>

        {/* ゴールエリア（左） */}
        <div className="absolute left-[5%] top-1/2 transform -translate-y-1/2 w-[6%] h-[30%] border-r-2 border-y-2 border-white/30"></div>

        {/* ゴールエリア（右） */}
        <div className="absolute right-[5%] top-1/2 transform -translate-y-1/2 w-[6%] h-[30%] border-l-2 border-y-2 border-white/30"></div>

        {/* ペナルティスポット（左） */}
        <div className="absolute left-[15%] top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white/50 rounded-full"></div>

        {/* ペナルティスポット（右） */}
        <div className="absolute right-[15%] top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white/50 rounded-full"></div>
      </div>

      {/* チーム名表示 - より明確に */}
      <div className="absolute top-2 left-[22.5%] transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-bold shadow-md">
        {homeLineup.team.name}
      </div>
      <div className="absolute top-2 right-[22.5%] transform translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-bold shadow-md">
        {awayLineup.team.name}
      </div>

      {renderSide(homeLineup.startXI, 'home', TEAM_COLORS.home)}
      {renderSide(awayLineup.startXI, 'away', TEAM_COLORS.away)}
    </div>
  );
}

/**
 * サブ選手リストアイテムコンポーネント
 * 選手情報と交代情報などを表示
 */
const SubPlayerItem = memo(
  ({
    entry,
    perfMap,
    onClick,
    events,
  }: {
    entry: PlayerEntry;
    perfMap: Map<number, PlayerPerformance>;
    onClick: (id: number) => void;
    events: Event[];
  }) => {
    const { player } = entry;
    const playerPerf = perfMap.get(player.id);
    const rating = playerPerf?.statistics[0]?.games.rating;

    // 交代イベントの検索
    const subEvent = events.find(
      (e) =>
        (e.type === 'subst' && e.player.id === player.id) ||
        (e.type === 'subst' && e.assist?.id === player.id)
    );

    // 出場時間または交代時間
    const eventTime = subEvent ? `${subEvent.time.elapsed}'` : null;

    // イエローカード検索
    const yellowCard = events.some(
      (e) => e.type === 'Card' && e.detail === 'Yellow Card' && e.player.id === player.id
    );

    return (
      <div
        className="flex items-center p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
        onClick={() => onClick(player.id)}
      >
        <div className="flex items-center space-x-3">
          {/* 選手写真とレーティング */}
          <div className="relative">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              {playerPerf?.player.photo ? (
                <Image
                  src={playerPerf.player.photo}
                  alt={player.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-bold text-sm">{player.number}</span>
                </div>
              )}
            </div>
            {rating && (
              <div className="absolute -top-1 -left-1 bg-orange-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                {parseFloat(rating).toFixed(1)}
              </div>
            )}
          </div>

          {/* 背番号 */}
          <div className="w-5 text-center font-bold text-gray-700">{player.number}</div>

          {/* 選手名・ポジション */}
          <div className="flex-1">
            <div className="font-medium text-sm">{player.name}</div>
            <div className="text-xs text-gray-500">{player.pos}</div>
          </div>

          {/* イエローカード */}
          {yellowCard && <div className="bg-yellow-300 w-4 h-5 rounded-sm mr-2"></div>}

          {/* 交代時間と交代アイコン */}
          {eventTime && (
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium">{eventTime}</span>
              <div className="bg-green-600 w-5 h-5 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-3 h-3"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

SubPlayerItem.displayName = 'SubPlayerItem';

/* -------------------------------------------------------------------------- */
/*  5. コーチ情報表示コンポーネント                                              */
/* -------------------------------------------------------------------------- */
const CoachInfo = memo(({ lineup }: { lineup: Lineup }) => {
  const coachName = lineup.coach?.name || '情報なし';
  const coachPhoto = lineup.coach?.photo || '';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 mb-2 border-2 border-gray-300">
        {coachPhoto ? (
          <Image src={coachPhoto} alt={coachName} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="font-medium text-sm">{coachName}</p>
        <p className="text-xs text-gray-500">コーチ</p>
      </div>
    </div>
  );
});

CoachInfo.displayName = 'CoachInfo';

/* -------------------------------------------------------------------------- */
/*  6. 本体 LineupPanel                                                        */
/* -------------------------------------------------------------------------- */
export default function LineupPanel({ fixture }: { fixture: Fixture }) {
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [teamsPlayers, setTeamsPlayers] = useState<TeamPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>();
  const [selected, setSelected] = useState<PlayerPerformance | null>(null);

  /* -------------------------- Fetch once -------------------------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [l, ev, pl] = await Promise.all([
          getLineups(String(fixture.id)),
          getEvents(String(fixture.id)),
          getFixturesPlayers(String(fixture.id)),
        ]);
        setLineups(l);
        setEvents(ev);
        setTeamsPlayers(pl);
      } catch (e: any) {
        setErr('データ取得に失敗しました');
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [fixture.id]);

  /* ------------------- Map<playerId, performance> ------------------ */
  const perfMap = useMemo(() => {
    const m = new Map<number, PlayerPerformance>();
    teamsPlayers.forEach((t) => t.players.forEach((p) => m.set(p.player.id, p)));
    return m;
  }, [teamsPlayers]);

  const home = lineups.find((l) => l.team.id === fixture.teams.home.id);
  const away = lineups.find((l) => l.team.id === fixture.teams.away.id);

  if (loading) return <p className="p-4">Loading…</p>;
  if (err) return <p className="p-4 text-red-500">{err}</p>;
  if (!home || !away) return <p className="p-4">ラインナップ未発表</p>;

  return (
    <>
      <PitchView
        homeLineup={home}
        awayLineup={away}
        events={events}
        perfMap={perfMap}
        onPlayerClick={(id) => {
          const perf = perfMap.get(id);
          if (perf) setSelected(perf);
        }}
      />

      {/* コーチ情報表示 */}
      <div className="flex justify-between items-center mt-6 mb-4 px-4">
        <CoachInfo lineup={home} />
        <div className="text-center font-bold text-xl">コーチ</div>
        <CoachInfo lineup={away} />
      </div>

      {/* 控えメンバータイトル */}
      <div className="text-center font-bold text-xl mt-8 mb-4">控え</div>

      {/* 控えメンバーリスト - 新レイアウト */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* ホームチーム控えメンバー */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
          <div className="bg-blue-600 py-2 px-4">
            <div className="flex items-center">
              <div className="relative w-6 h-6 mr-2">
                <Image src={home.team.logo} alt={home.team.name} fill className="object-contain" />
              </div>
              <h4 className="text-white font-semibold">{home.team.name}</h4>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {home.substitutes.map((entry) => (
              <SubPlayerItem
                key={`home-sub-${entry.player.id}`}
                entry={entry}
                perfMap={perfMap}
                events={events}
                onClick={(id) => {
                  const perf = perfMap.get(id);
                  if (perf) setSelected(perf);
                }}
              />
            ))}
            {home.substitutes.length === 0 && (
              <div className="p-4 text-gray-500 text-center">控えメンバー情報がありません</div>
            )}
          </div>
        </div>

        {/* アウェイチーム控えメンバー */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
          <div className="bg-red-600 py-2 px-4">
            <div className="flex items-center">
              <div className="relative w-6 h-6 mr-2">
                <Image src={away.team.logo} alt={away.team.name} fill className="object-contain" />
              </div>
              <h4 className="text-white font-semibold">{away.team.name}</h4>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {away.substitutes.map((entry) => (
              <SubPlayerItem
                key={`away-sub-${entry.player.id}`}
                entry={entry}
                perfMap={perfMap}
                events={events}
                onClick={(id) => {
                  const perf = perfMap.get(id);
                  if (perf) setSelected(perf);
                }}
              />
            ))}
            {away.substitutes.length === 0 && (
              <div className="p-4 text-gray-500 text-center">控えメンバー情報がありません</div>
            )}
          </div>
        </div>
      </div>

      {/* Player modal */}
      {selected && <PlayerPerformanceModal player={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
