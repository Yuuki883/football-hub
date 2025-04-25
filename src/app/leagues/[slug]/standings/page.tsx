import { Suspense } from 'react';
import { Metadata } from 'next';
import StandingsTable from '../components/StandingsTable';
import {
  getLeagueStandings,
  getLeagueBySlug,
} from '@/lib/services/league-service';

interface StandingsPageProps {
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
      title: '順位表 | リーグが見つかりません',
    };
  }

  return {
    title: `${leagueData.league.name} 順位表 | Football Hub`,
    description: `${leagueData.league.name}の最新順位表、勝ち点、成績など`,
  };
}

export default async function StandingsPage({
  params,
  searchParams,
}: StandingsPageProps) {
  const { slug } = params;
  const season = parseInt(searchParams.season || '2024');

  const standings = await getLeagueStandings(slug, season);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">順位表</h1>

        <Suspense fallback={<div>読み込み中...</div>}>
          <StandingsTable
            standings={standings}
            leagueSlug={slug}
            season={season}
          />
        </Suspense>
      </div>
    </>
  );
}
