// src/app/teams/[id]/stats/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchTeamStats } from '@/features/teams/api/team-stats';
import { getTeamById } from '@/features/teams/api/team-info';
import TeamStatsView from '@/features/teams/components/TeamStatsView';
import TeamHeader from '@/features/teams/components/TeamHeader';
import PageLayout from '@/components/layout/PageLayout';

// ISR - 1時間ごとに再検証
export const revalidate = 3600;

interface TeamStatsPageProps {
  params: { id: string };
  searchParams: { league?: string; season?: string };
}

// 動的メタデータ生成
export async function generateMetadata({
  params,
  searchParams,
}: TeamStatsPageProps): Promise<Metadata> {
  const teamId = parseInt(params.id);
  const leagueId = parseInt(searchParams.league || '39');
  const season = parseInt(searchParams.season || '2024');

  try {
    const stats = await fetchTeamStats(teamId, leagueId, season);

    if (!stats) {
      return { title: 'チーム統計 | データなし' };
    }

    return {
      title: `${stats.team.name} 統計データ | Football Hub`,
      description: `${stats.team.name}の試合成績、得点情報など ${stats.league.name} ${stats.league.season}シーズンの統計データ`,
    };
  } catch (error) {
    return { title: 'チーム統計 | エラー' };
  }
}

// ページコンポーネント
export default async function TeamStatsPage({
  params,
  searchParams,
}: TeamStatsPageProps) {
  const teamId = parseInt(params.id);
  const leagueId = parseInt(searchParams.league || '39');
  const season = parseInt(searchParams.season || '2024');

  try {
    // チーム基本情報の取得
    const teamData = await getTeamById(teamId);

    if (!teamData) {
      notFound();
    }

    // チーム統計情報の取得
    const stats = await fetchTeamStats(teamId, leagueId, season);

    if (!stats) {
      notFound();
    }

    return (
      <PageLayout>
        <div className="mb-6">
          <TeamHeader team={teamData.team} season={season} />
        </div>

        <Suspense
          fallback={<div className="text-center py-4">読み込み中...</div>}
        >
          <TeamStatsView stats={stats} />
        </Suspense>
      </PageLayout>
    );
  } catch (error) {
    console.error('チーム統計取得エラー:', error);
    notFound();
  }
}
