'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormattedPlayerStats } from '@/lib/api-football/types/players';

interface ScorersRankingProps {
  players: FormattedPlayerStats[] | null;
  limit?: number;
}

const ScorersRanking: React.FC<ScorersRankingProps> = ({
  players,
  limit = 10,
}) => {
  if (!players || players.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        得点ランキングデータが見つかりません
      </div>
    );
  }

  // 表示する選手数を制限
  const displayedPlayers = players.slice(0, limit);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-blue-800">得点ランキング</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {displayedPlayers.map((player, index) => {
          return (
            <div key={player.id} className="p-4 hover:bg-gray-50">
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
                      src={player.photo || '/images/player-placeholder.png'}
                      alt={player.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/player-placeholder.png';
                      }}
                    />
                  </div>
                </div>

                <div className="ml-4 flex-1">
                  <Link
                    href={`/players/${player.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    {player.name}
                  </Link>
                  {player.team && (
                    <div className="flex items-center mt-1">
                      <div className="relative h-4 w-4 mr-1">
                        <Image
                          src={
                            player.team.logo || '/images/team-placeholder.png'
                          }
                          alt={player.team.name}
                          fill
                          sizes="16px"
                          className="object-contain"
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {player.team.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 text-center">
                  <span className="text-lg font-bold text-blue-600">
                    {player.goals}
                  </span>
                  <div className="text-xs text-gray-500">ゴール</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScorersRanking;
