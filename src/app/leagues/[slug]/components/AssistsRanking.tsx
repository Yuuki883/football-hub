'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Player } from '@/lib/types/football';

interface AssistsRankingProps {
  players: Player[] | null;
  limit?: number;
}

const AssistsRanking: React.FC<AssistsRankingProps> = ({
  players,
  limit = 10,
}) => {
  if (!players || players.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        アシストランキングデータが見つかりません
      </div>
    );
  }

  // 表示する選手数を制限
  const displayedPlayers = players.slice(0, limit);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-green-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-green-800">
          アシストランキング
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {displayedPlayers.map((player, index) => {
          // サーバーから返されるデータ構造に合わせて値を取得
          const { player: playerInfo, statistics } = player;
          const stats = statistics[0];
          const assists = stats?.goals?.assists || 0;

          return (
            <div key={playerInfo.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 text-center">
                  <span
                    className={`font-semibold ${
                      index < 3 ? 'text-yellow-600' : 'text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </span>
                </div>

                <div className="flex-shrink-0 ml-2">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                    <Image
                      src={playerInfo.photo || '/images/player-placeholder.png'}
                      alt={playerInfo.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="ml-4 flex-1">
                  <Link
                    href={`/players/${playerInfo.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    {playerInfo.name}
                  </Link>
                  <div className="flex items-center mt-1">
                    <div className="relative h-4 w-4 mr-1">
                      <Image
                        src={stats.team.logo}
                        alt={stats.team.name}
                        fill
                        sizes="16px"
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {stats.team.name}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 text-center">
                  <span className="text-lg font-bold text-green-600">
                    {assists}
                  </span>
                  <div className="text-xs text-gray-500">アシスト</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssistsRanking;
