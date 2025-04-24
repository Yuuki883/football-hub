import { Suspense } from 'react';
import { Metadata } from 'next';
import TeamGrid from '../components/TeamGrid';
import { getLeagueTeams, getLeagueBySlug } from '@/lib/services/league-service';

interface TeamsPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    season?: string;
  };
}

// 動的メタデータ生成
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;
  const leagueData = await getLeagueBySlug(slug);

  if (!leagueData) {
    return {
      title: '所属チーム | リーグが見つかりません',
    };
  }

  return {
    title: `${leagueData.league.name} 所属チーム | Football Hub`,
    description: `${leagueData.league.name}に所属するチーム一覧`,
  };
}

export default async function TeamsPage({
  params,
  searchParams,
}: TeamsPageProps) {
  const { slug } = params;
  const season = parseInt(searchParams.season || '2024');

  const teams = await getLeagueTeams(slug, season);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">チーム一覧</h1>

        <Suspense fallback={<div>読み込み中...</div>}>
          <TeamGrid teams={teams} />
        </Suspense>
      </div>
    </>
  );
}
