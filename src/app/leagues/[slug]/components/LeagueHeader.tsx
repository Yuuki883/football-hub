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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image
            src={league.logo}
            alt={league.name}
            fill
            className="object-contain"
            sizes="64px"
          />
        </div>
        <div className="flex-grow">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {league.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            {country.flag && (
              <div className="relative w-5 h-4">
                <Image
                  src={country.flag}
                  alt={country.name}
                  fill
                  className="object-cover rounded-sm"
                  sizes="20px"
                />
              </div>
            )}
            <span className="text-gray-600 dark:text-gray-300">
              {country.name}
            </span>
          </div>
        </div>
      </div>
      {children && <div className="px-4">{children}</div>}
    </div>
  );
};

export default LeagueHeader;
