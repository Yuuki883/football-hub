import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TeamSchedule from '@/features/teams/components/TeamSchedule';
import TeamHeader from '@/features/teams/components/TeamHeader';
import PageLayout from '@/components/layout/PageLayout';
import { getTeamById } from '@/features/teams/api/team-info';
import { getTeamFixtures } from '@/features/teams/api/team-fixtures';
import { getCurrentSeason } from '@/utils/season-utils';

interface TeamPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    season?: string;
  }>;
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const teamData = await getTeamById(id);

    if (!teamData) {
      return {
        title: 'チームが見つかりません',
      };
    }

    return {
      title: `${teamData.team.name} - 試合日程、選手、スタッツ`,
      description: `${teamData.team.name}の試合日程、選手一覧、スタッツなどの詳細情報`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'チーム詳細',
    };
  }
}

export default async function TeamPage({ params, searchParams }: TeamPageProps) {
  const { id } = await params;
  const { season: seasonParam } = await searchParams;

  // シーズンの取得：URLパラメータが指定されていない場合は現在のシーズンを使用
  const season = parseInt(seasonParam || getCurrentSeason().toString());

  // チーム情報を取得
  const teamData = await getTeamById(id);

  if (!teamData) {
    notFound();
  }

  // 過去の試合と今後の試合を取得
  const pastFixtures = await getTeamFixtures(id, {
    season,
    past: true,
    future: false,
    limit: 5,
  });

  const futureFixtures = await getTeamFixtures(id, {
    season,
    past: false,
    future: true,
    limit: 5,
  });

  return (
    <PageLayout>
      <div className="mb-6">
        <TeamHeader team={teamData.team} season={season} />
      </div>

      <div className="mb-8">
        <Suspense fallback={<div className="p-4 text-center">試合データを読み込み中...</div>}>
          <TeamSchedule
            pastFixtures={pastFixtures}
            futureFixtures={futureFixtures}
            isLoading={false}
          />
        </Suspense>
      </div>
    </PageLayout>
  );
}
