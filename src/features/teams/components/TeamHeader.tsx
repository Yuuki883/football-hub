'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import EntityHeader from '@/components/common/EntityHeader';
import TabNavigation from '@/components/common/TabNavigation';

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
  const teamId = team.id.toString();
  const basePath = `/teams/${teamId}`;

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
    >
      {children}
    </EntityHeader>
  );
}
