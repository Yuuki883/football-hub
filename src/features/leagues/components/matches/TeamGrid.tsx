'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Team {
  team: {
    id: number;
    name: string;
    logo: string;
    country?: string;
    founded?: number;
  };
  venue?: {
    id: number;
    name: string;
    address?: string;
    city?: string;
    capacity?: number;
    surface?: string;
    image?: string;
  };
}

interface TeamGridProps {
  teams: Team[] | null;
}

const TeamGrid: React.FC<TeamGridProps> = ({ teams }) => {
  if (!teams || teams.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">チームデータが見つかりません</div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {teams.map(({ team }) => (
        <Link
          key={team.id}
          href={`/teams/${team.id}`}
          className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
        >
          <div className="relative w-20 h-20 mb-3">
            <Image src={team.logo} alt={team.name} fill sizes="80px" className="object-contain" />
          </div>
          <h3 className="text-sm font-medium text-center">{team.name}</h3>
          {team.founded && <div className="text-xs text-gray-500 mt-1">創立: {team.founded}年</div>}
        </Link>
      ))}
    </div>
  );
};

export default TeamGrid;
