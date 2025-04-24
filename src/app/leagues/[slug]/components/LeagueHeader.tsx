'use client';

import Image from 'next/image';
import { League, Country } from '@/lib/types/football';

interface LeagueHeaderProps {
  league: League;
  country: Country;
  children?: React.ReactNode; // ナビゲーション等の子要素
}

const LeagueHeader: React.FC<LeagueHeaderProps> = ({
  league,
  country,
  children,
}) => {
  return (
    <div className="bg-gray-50 rounded-lg shadow-sm mb-6">
      <div className="flex items-center gap-4 p-4">
        <div className="relative w-16 h-16">
          <Image
            src={league.logo}
            alt={league.name}
            fill
            className="object-contain"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{league.name}</h1>
          <div className="flex items-center gap-2">
            {country.flag && (
              <div className="relative w-5 h-4">
                <Image
                  src={country.flag}
                  alt={country.name}
                  fill
                  className="object-cover rounded-sm"
                />
              </div>
            )}
            <span className="text-gray-600">{country.name}</span>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default LeagueHeader;
