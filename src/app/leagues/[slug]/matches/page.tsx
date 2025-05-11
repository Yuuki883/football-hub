import { Suspense } from 'react';
import { Metadata } from 'next';
import MatchesList from '../components/MatchesList';
import { getLeagueFixtures } from '@/features/leagues/api/league-fixtures';
import { getLeagueBySlug } from '@/features/leagues/api/league-info';

interface MatchesPageProps {
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
      title: '試合一覧 | リーグが見つかりません',
    };
  }

  return {
    title: `${leagueData.league.name} 試合一覧 | Football Hub`,
    description: `${leagueData.league.name}の試合日程、結果、スコアなど`,
  };
}

export default async function MatchesPage({ params, searchParams }: MatchesPageProps) {
  const { slug } = params;
  const season = parseInt(searchParams.season || '2024');

  const matches = await getLeagueFixtures(slug, { season });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">試合一覧</h1>

        <Suspense fallback={<div>読み込み中...</div>}>
          <MatchesList matches={matches || []} />
        </Suspense>
      </div>
    </>
  );
}
