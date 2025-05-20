'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Fixture, Lineup, Event, TeamPlayers, PlayerPerformance } from '../../types/match.types';
import { getLineups, getEvents, getFixturesPlayers } from '../../api/match-service';
import PitchView from './PitchView';
import CoachInfo from './CoachInfo';
import SubstituteList from './SubstituteList';
import PlayerPerformanceModal from '../PlayerPerformanceModal';
import { TEAM_COLORS } from '../../constants/matches';

/**
 * LineupPanel - 試合のラインナップ表示コンポーネント
 * フォーメーション、スターティングメンバー、控え選手を表示
 */
export default function LineupPanel({ fixture }: { fixture: Fixture }) {
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [teamsPlayers, setTeamsPlayers] = useState<TeamPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>();
  const [selected, setSelected] = useState<PlayerPerformance | null>(null);

  /* -------------------------- データ取得 -------------------------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [lineupData, eventData, playerData] = await Promise.all([
          getLineups(String(fixture.id)),
          getEvents(String(fixture.id)),
          getFixturesPlayers(String(fixture.id)),
        ]);
        setLineups(lineupData);
        setEvents(eventData);
        setTeamsPlayers(playerData);
      } catch (e: any) {
        setErr('データ取得に失敗しました');
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [fixture.id]);

  /* ------------------- 選手パフォーマンスデータのマップ作成 ------------------ */
  const perfMap = useMemo(() => {
    const m = new Map<number, PlayerPerformance>();
    teamsPlayers.forEach((t) => t.players.forEach((p) => m.set(p.player.id, p)));
    return m;
  }, [teamsPlayers]);

  /* ------------------- チームデータの取得 ------------------ */
  const home = lineups.find((l) => l.team.id === fixture.teams.home.id);
  const away = lineups.find((l) => l.team.id === fixture.teams.away.id);

  /* ------------------- ローディング状態の表示 ------------------ */
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  /* ------------------- エラー状態の表示 ------------------ */
  if (err) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 font-semibold mb-2">エラーが発生しました</div>
        <div className="text-gray-600 text-sm">{err}</div>
      </div>
    );
  }

  /* ------------------- ラインナップ未発表の状態 ------------------ */
  if (!home || !away) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-lg">
        <div className="text-gray-600 font-semibold">ラインナップはまだ発表されていません</div>
        <div className="text-gray-500 text-sm mt-2">試合開始前にもう一度ご確認ください</div>
      </div>
    );
  }

  /* ------------------- 選手クリックハンドラー ------------------ */
  const handlePlayerClick = (id: number) => {
    const perf = perfMap.get(id);
    if (perf) setSelected(perf);
  };

  return (
    <div className="bg-white">
      {/* ピッチビュー - フォーメーション表示 */}
      <div className="mb-6">
        <PitchView
          homeLineup={home}
          awayLineup={away}
          events={events}
          perfMap={perfMap}
          onPlayerClick={handlePlayerClick}
        />
      </div>

      {/* コーチ情報表示 */}
      <div className="flex justify-between items-center mt-6 mb-4 px-4">
        <CoachInfo lineup={home} side="home" />
        <div className="text-center font-bold text-xl text-gray-700">監督</div>
        <CoachInfo lineup={away} side="away" />
      </div>

      {/* 控えメンバータイトル */}
      <div className="text-center font-bold text-xl text-gray-700 mt-8 mb-4">ベンチ</div>

      {/* 控えメンバーリスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* ホームチーム控えメンバー */}
        <SubstituteList
          team={home.team}
          subs={home.substitutes}
          color={TEAM_COLORS.home}
          events={events}
          perfMap={perfMap}
          onPlayerClick={handlePlayerClick}
        />

        {/* アウェイチーム控えメンバー */}
        <SubstituteList
          team={away.team}
          subs={away.substitutes}
          color={TEAM_COLORS.away}
          events={events}
          perfMap={perfMap}
          onPlayerClick={handlePlayerClick}
        />
      </div>

      {/* 選手詳細モーダル */}
      {selected && <PlayerPerformanceModal player={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
