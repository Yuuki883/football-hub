import { Suspense } from 'react';
import { Metadata } from 'next';
import TeamGrid from '../../../../features/leagues/components/matches/TeamGrid';
import { getLeagueTeams, FormattedTeam } from '@/features/leagues/api/league-teams';
import { getLeagueBySlug } from '@/features/leagues/api/league-info';

interface TeamsPageProps {
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
      title: '所属チーム | リーグが見つかりません',
    };
  }

  return {
    title: `${leagueData.league.name} 所属チーム | Football Hub`,
    description: `${leagueData.league.name}に所属するチーム一覧`,
  };
}

export default async function TeamsPage({ params, searchParams }: TeamsPageProps) {
  const { slug } = await params;
  const { season: seasonParam } = await searchParams;
  const season = parseInt(seasonParam || '2024');

  const teamsData = await getLeagueTeams(slug, { season });

  const teams = teamsData.map((team) => ({
    team: {
      id: parseInt(team.id),
      name: team.name,
      logo: team.crest,
      country: team.country,
      founded: team.founded,
    },
    venue: team.venue
      ? {
          id: 0,
          name: team.venue,
          capacity: team.venueCapacity,
          address: team.address,
        }
      : undefined,
  }));

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
