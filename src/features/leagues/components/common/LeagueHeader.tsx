'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { League } from '@/types/type';
import type { Country } from '@/types/type';
import EntityHeader from '@/components/common/EntityHeader';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { useLeagueFavorite } from '@/features/favorites/hooks/useFavorite';

interface LeagueHeaderProps {
  league: League;
  country: Country;
  children?: React.ReactNode; // ナビゲーション等の子要素
}

const LeagueHeader: React.FC<LeagueHeaderProps> = ({ league, country, children }) => {
  const { data: session } = useSession();
  const [initialChecked, setInitialChecked] = useState(false);

  // UEFAの大会かどうかを判定
  const isUefaCompetition = [2, 3, 848].includes(league.id);

  // UEFA大会の場合は欧州全体の国旗を使用、それ以外は通常の国旗を使用
  const flagUrl = isUefaCompetition
    ? 'https://media.api-sports.io/flags/eu.svg' // 欧州の旗
    : country.flag;

  // お気に入り機能
  const { isFavorite, isLoading, toggleFavorite } = useLeagueFavorite(
    league.id.toString(),
    initialChecked
  );

  // 初期ロードでお気に入り状態をチェック
  useEffect(() => {
    if (session?.user) {
      fetch(`/api/favorites/check?leagueId=${league.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.league !== undefined) {
            setInitialChecked(data.league);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [session, league.id]);

  return (
    <EntityHeader
      name={league.name}
      logo={league.logo}
      country={country.name}
      flag={flagUrl}
      className="relative"
    >
      {/* お気に入りボタン */}
      {session?.user && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <FavoriteButton
            isFavorite={isFavorite}
            isLoading={isLoading}
            onClick={toggleFavorite}
            size="lg"
          />
        </div>
      )}
      {children}
    </EntityHeader>
  );
};

export default LeagueHeader;
