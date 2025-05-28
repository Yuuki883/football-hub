// src/app/teams/[id]/stats/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchTeamStats } from '@/features/teams/api/team-stats';
import { getTeamById } from '@/features/teams/api/team-info';
import { getTeamDomesticLeague } from '@/features/teams/api/team-leagues';
import TeamStatsView from '@/features/teams/components/TeamStatsView';
import TeamHeader from '@/features/teams/components/TeamHeader';
import PageLayout from '@/components/layout/PageLayout';

// ISR - 1時間ごとに再検証
export const revalidate = 3600;

interface TeamStatsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ league?: string; season?: string }>;
}

// 動的メタデータ生成
export async function generateMetadata({
  params,
  searchParams,
}: TeamStatsPageProps): Promise<Metadata> {
  const { id } = await params;
  const { season: seasonParam } = await searchParams;
  const teamId = parseInt(id);
  const season = parseInt(seasonParam || '2024');

  try {
    // チーム基本情報取得
    const teamData = await getTeamById(teamId);

    if (!teamData) {
      return { title: 'チーム統計 | データなし' };
    }

    // チームの所属リーグを取得
    const { leagueId, leagueName } = await getTeamDomesticLeague(teamId, season);

    if (!leagueId) {
      return {
        title: `${teamData.team.name} 統計データ | Football Hub`,
        description: `${teamData.team.name}の試合成績、得点情報などの統計データ`,
      };
    }

    const stats = await fetchTeamStats(teamId, parseInt(leagueId), season);

    if (!stats) {
      return {
        title: `${teamData.team.name} 統計データ | Football Hub`,
        description: `${teamData.team.name}の試合成績、得点情報などの統計データ`,
      };
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
export default async function TeamStatsPage({ params, searchParams }: TeamStatsPageProps) {
  const { id } = await params;
  const { season: seasonParam, league } = await searchParams;
  const teamId = parseInt(id);
  const season = parseInt(seasonParam || '2024');

  try {
    // チーム基本情報の取得
    const teamData = await getTeamById(teamId);

    if (!teamData) {
      notFound();
    }

    // チームの所属リーグを取得
    const { leagueId, leagueName } = await getTeamDomesticLeague(teamId, season);

    if (!leagueId) {
      // 所属リーグが見つからない場合はデフォルトリーグを使用
      const fallbackLeagueId = parseInt(league || '39'); // デフォルトはプレミアリーグ
      const stats = await fetchTeamStats(teamId, fallbackLeagueId, season);

      if (!stats) {
        return (
          <PageLayout>
            <div className="mb-6">
              <TeamHeader team={teamData.team} season={season} />
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
              <h2 className="text-xl font-bold mb-4">統計データを取得できませんでした</h2>
              <p className="mb-4">このチームの統計データは現在利用できません。</p>
            </div>
          </PageLayout>
        );
      }

      return (
        <PageLayout>
          <div className="mb-6">
            <TeamHeader team={teamData.team} season={season} />
          </div>

          <Suspense fallback={<div className="text-center py-4">読み込み中...</div>}>
            <TeamStatsView stats={stats} />
          </Suspense>
        </PageLayout>
      );
    }

    // チーム統計情報の取得
    const stats = await fetchTeamStats(teamId, parseInt(leagueId), season);

    if (!stats) {
      return (
        <PageLayout>
          <div className="mb-6">
            <TeamHeader team={teamData.team} season={season} />
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-4">統計データを取得できませんでした</h2>
            <p className="mb-4">{leagueName || '所属リーグ'}の統計データは現在利用できません。</p>
          </div>
        </PageLayout>
      );
    }

    return (
      <PageLayout>
        <div className="mb-6">
          <TeamHeader team={teamData.team} season={season} />
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold">
            {stats.league.name} ({stats.league.season})の統計
          </h2>
        </div>

        <Suspense fallback={<div className="text-center py-4">読み込み中...</div>}>
          <TeamStatsView stats={stats} />
        </Suspense>
      </PageLayout>
    );
  } catch (error) {
    console.error('チーム統計取得エラー:', error);
    notFound();
  }
}
