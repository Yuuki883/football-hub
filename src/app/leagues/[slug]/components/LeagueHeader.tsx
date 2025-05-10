'use client';

import type { League, Country } from '@/lib/api-football/types/leagues';
import EntityHeader from '@/components/common/EntityHeader';

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
  // UEFAの大会かどうかを判定
  const isUefaCompetition = [2, 3, 848].includes(league.id);

  // UEFA大会の場合は欧州全体の国旗を使用、それ以外は通常の国旗を使用
  const flagUrl = isUefaCompetition
    ? 'https://media.api-sports.io/flags/eu.svg' // 欧州の旗
    : country.flag;

  return (
    <EntityHeader
      name={league.name}
      logo={league.logo}
      country={country.name}
      flag={flagUrl}
    >
      {children}
    </EntityHeader>
  );
};

export default LeagueHeader;
