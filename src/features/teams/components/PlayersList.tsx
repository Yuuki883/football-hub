import Image from 'next/image';
import type { PlayerGroup } from '../types/types';

interface PlayersListProps {
  playerGroups: PlayerGroup[];
}

export default function PlayersList({ playerGroups }: PlayersListProps) {
  return (
    <div className="space-y-8">
      {playerGroups.map((group) => (
        <div key={group.position} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-800 border-b pb-2">
            {group.displayName} ({group.players.length}名)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {group.players.map((player) => (
              <div
                key={player.id}
                className="bg-gray-50 rounded-lg p-4 flex flex-col"
              >
                <div className="relative h-48 mb-3 bg-gray-200 rounded-md overflow-hidden">
                  {player.photo ? (
                    <Image
                      src={player.photo}
                      alt={player.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      priority={false}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      写真なし
                    </div>
                  )}
                </div>

                <div className="flex items-center mb-2">
                  {player.number !== undefined && player.number !== null && (
                    <span className="bg-blue-600 text-white font-bold px-2 py-1 rounded-md text-sm mr-2">
                      {player.number}
                    </span>
                  )}
                  <h3 className="font-bold text-gray-800 truncate">
                    {player.name}
                  </h3>
                </div>

                <div className="text-sm text-gray-600 space-y-1 mt-auto">
                  <div className="flex items-center">
                    {player.nationality && (
                      <div className="flex items-center mr-2">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                          {player.nationality}
                        </span>
                      </div>
                    )}
                    <span>{player.age}歳</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
