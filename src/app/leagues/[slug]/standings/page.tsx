import { Suspense } from 'react';
import { Metadata } from 'next';
import StandingsTable from '../../../../features/leagues/components/tables/StandingsTable';
import { getLeagueStandings } from '@/features/leagues/api/league-standings';
import { getLeagueBySlug } from '@/features/leagues/api/league-info';
import { DEFAULT_SEASON } from '@/config/api';

interface StandingsPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    season?: string;
  }>;
}

// 動的メタデータ生成
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
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

export default async function StandingsPage({ params, searchParams }: StandingsPageProps) {
  const { slug } = await params;
  const { season: seasonParam } = await searchParams;
  const season = parseInt(seasonParam || String(DEFAULT_SEASON));

  const standings = await getLeagueStandings(slug, season);

  return (
    <>
      <div className="mb-8">
        <Suspense fallback={<div>読み込み中...</div>}>
          <StandingsTable standings={standings} leagueSlug={slug} season={season} />
        </Suspense>
      </div>
    </>
  );
}
