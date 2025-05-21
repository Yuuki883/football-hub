'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import EntityHeader from '@/components/common/EntityHeader';
import TabNavigation from '@/components/common/TabNavigation';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { useTeamFavorite } from '@/features/favorites/hooks/useFavorite';

interface TeamHeaderProps {
  team: {
    id: number;
    name: string;
    logo: string;
    country?: string;
    founded?: number;
    flag?: string;
  };
  season?: number;
  children?: React.ReactNode;
}

export default function TeamHeader({ team, season = 2024, children }: TeamHeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [initialChecked, setInitialChecked] = useState(false);
  const teamId = team.id.toString();
  const basePath = `/teams/${teamId}`;

  // お気に入り機能
  const { isFavorite, isLoading, toggleFavorite } = useTeamFavorite(teamId, initialChecked);

  // 初期ロードでお気に入り状態をチェック
  useEffect(() => {
    if (session?.user) {
      fetch(`/api/favorites/check?teamId=${teamId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.team !== undefined) {
            setInitialChecked(data.team);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [session, teamId]);

  // チーム詳細ページのタブを定義
  const tabs = [
    { name: '日程', path: `/teams/${teamId}` },
    { name: '順位表', path: `/teams/${teamId}/standings` },
    { name: '選手', path: `/teams/${teamId}/players` },
    { name: 'スタッツ', path: `/teams/${teamId}/stats` },
  ];

  // 現在のパスが日程タブかどうかを判定
  const isScheduleTab = pathname === `/teams/${teamId}`;

  // メタデータを生成
  const metadata: Record<string, string | number> = {};
  if (team.founded) {
    metadata['創立'] = `${team.founded}年`;
  }

  // ナビゲーション生成
  const navigation = <TabNavigation tabs={tabs} basePath={basePath}></TabNavigation>;

  return (
    <EntityHeader
      name={team.name}
      logo={team.logo}
      country={team.country}
      flag={team.flag}
      showFlag={false}
      metadata={metadata}
      navigation={navigation}
      className="relative"
    >
      {/* お気に入りボタン */}
      {session?.user && (
        <div className="absolute top-6 right-6">
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
}
