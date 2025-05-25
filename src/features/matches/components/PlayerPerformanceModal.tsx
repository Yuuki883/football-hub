/**
 * 選手パフォーマンスモーダル
 * 選手の詳細なパフォーマンス情報を表示するモーダルコンポーネント
 */

'use client';

import React from 'react';
import { MatchPlayerPerformance } from '../types';
import OptimizedImage from '@/components/common/OptimizedImage';

export default function PlayerPerformanceModal({
  player,
  onClose,
}: {
  player: MatchPlayerPerformance;
  onClose: () => void;
}) {
  const stats = player.statistics[0];
  if (!stats) return null;

  //GK判定
  const isGoalkeeper = stats.games.position === 'G';

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative w-12 h-12 mr-3 bg-gray-100 rounded-full overflow-hidden">
              {player.player.photo ? (
                <OptimizedImage
                  src={player.player.photo}
                  alt={player.player.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <span className="text-xs">画像なし</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold">{player.player.name}</h3>
              <div className="text-sm flex items-center">
                <span className="mr-2">#{stats.games.number}</span>
                <span>{stats.games.position}</span>
                {stats.games.captain && (
                  <span className="ml-2 bg-yellow-400 text-[10px] px-1 rounded text-yellow-800 font-bold">
                    C
                  </span>
                )}
              </div>
            </div>
          </div>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 選手情報 */}
        <div className="p-4">
          {/* 基本情報 */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">レーティング</span>
              <span className="font-bold text-xl">{stats.games.rating || '-'}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">出場時間</span>
              <span className="font-semibold">{stats.games.minutes || 0}分</span>
            </div>
          </div>

          {/* ゴールキーパー専用スタッツ */}
          {isGoalkeeper && (
            <div className="border-t pt-3 mb-4">
              <h4 className="font-medium mb-2">ゴールキーパー</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">セーブ数</div>
                  <div className="font-semibold">{stats.goals.saves || 0}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">失点</div>
                  <div className="font-semibold">{stats.goals.conceded || 0}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">クリーンシート</div>
                  <div className="font-semibold">
                    {stats.goals.conceded === 0 ? 'あり' : 'なし'}
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">PKセーブ</div>
                  <div className="font-semibold">{stats.penalty.saved || 0}</div>
                </div>
              </div>
            </div>
          )}

          {/* 攻撃スタッツ */}
          <div className="border-t pt-3 mb-4">
            <h4 className="font-medium mb-2">攻撃</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">ゴール</div>
                <div className="font-semibold">{stats.goals.total || 0}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">アシスト</div>
                <div className="font-semibold">{stats.goals.assists || 0}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">シュート</div>
                <div className="font-semibold">
                  {stats.shots.total || 0} (枠内: {stats.shots.on || 0})
                </div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">ドリブル</div>
                <div className="font-semibold">
                  {stats.dribbles.success || 0}/{stats.dribbles.attempts || 0}
                </div>
              </div>
            </div>
          </div>

          {/* パススタッツ */}
          <div className="border-t pt-3 mb-4">
            <h4 className="font-medium mb-2">パス</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">パス成功率</div>
                <div className="font-semibold">{stats.passes.accuracy || '-'}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">キーパス</div>
                <div className="font-semibold">{stats.passes.key || 0}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">トータルパス</div>
                <div className="font-semibold">{stats.passes.total || 0}</div>
              </div>
            </div>
          </div>

          {/* 守備スタッツ */}
          <div className="border-t pt-3 mb-4">
            <h4 className="font-medium mb-2">守備</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">タックル</div>
                <div className="font-semibold">{stats.tackles.total || 0}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">インターセプト</div>
                <div className="font-semibold">{stats.tackles.interceptions || 0}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">デュエル勝率</div>
                <div className="font-semibold">
                  {stats.duels.total
                    ? Math.round(((stats.duels.won || 0) / stats.duels.total) * 100)
                    : 0}
                  % ({stats.duels.won || 0}/{stats.duels.total || 0})
                </div>
              </div>
            </div>
          </div>

          {/* その他 */}
          <div className="border-t pt-3">
            <h4 className="font-medium mb-2">その他</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">イエローカード</div>
                <div className="font-semibold">{stats.cards.yellow || 0}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">レッドカード</div>
                <div className="font-semibold">{stats.cards.red || 0}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">受けたファウル</div>
                <div className="font-semibold">{stats.fouls.drawn || 0}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-500">犯したファウル</div>
                <div className="font-semibold">{stats.fouls.committed || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="p-4 border-t text-center">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-medium"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
