import Image from 'next/image';
import Link from 'next/link';
import { TeamPlayerGroup, TeamPlayer } from '../types/types';

interface PlayersListProps {
  playerGroups: TeamPlayerGroup[];
}

export default function PlayersList({ playerGroups }: PlayersListProps) {
  return (
    <div className="space-y-8">
      {playerGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{group.position}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.players.map((player: TeamPlayer) => (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  {player.photo && (
                    <Image
                      src={player.photo}
                      alt={`${player.name}の写真`}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{player.name}</div>
                  <div className="text-sm text-gray-500">#{player.number || 'N/A'}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
