import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TeamSchedule from '@/features/teams/components/TeamSchedule';
import TeamHeader from '@/features/teams/components/TeamHeader';
import PageLayout from '@/components/layout/PageLayout';
import { getTeamById } from '@/features/teams/services/team-service';
import { getTeamFixtures } from '@/features/teams/services/team-fixtures-service';

interface TeamPageProps {
  params: {
    id: string;
  };
  searchParams: {
    season?: string;
  };
}

// IDを使用する理由:
// 1. API-Footballが数値IDをプライマリキーとして使用しているため、API呼び出しが直接可能
// 2. チーム名は変更される可能性があるが、IDは不変
// 3. スラッグ方式を採用すると、チーム名が変わった時にリダイレクト処理が必要になる
// 4. IDはすでにリーグ詳細ページなどで使用されており、整合性を保つため

export async function generateMetadata({
  params,
}: TeamPageProps): Promise<Metadata> {
  const { id } = params;

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

export default async function TeamPage({
  params,
  searchParams,
}: TeamPageProps) {
  const { id } = params;
  const season = parseInt(searchParams.season || '2024');

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

  // パンくずリスト用の設定
  const breadcrumbData = {
    teamId: id,
    teamName: teamData.team.name,
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <TeamHeader team={teamData.team} season={season} />
      </div>

      <div className="mb-8">
        <Suspense
          fallback={
            <div className="p-4 text-center">試合データを読み込み中...</div>
          }
        >
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
