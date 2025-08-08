import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import LeagueHeader from '../../../features/leagues/components/common/LeagueHeader';
import LeagueNavigation from '../../../features/leagues/components/common/LeagueNavigation';
import SeasonSelector from '../../../features/leagues/components/common/SeasonSelector';
import PageLayout from '@/components/layout/PageLayout';
import { getLeagueBySlug } from '@/features/leagues/api/league-info';
import { DEFAULT_SEASON } from '@/config/api';

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
      title: 'リーグが見つかりません',
    };
  }

  return {
    title: `${leagueData.league.name} | Football Hub`,
    description: `${leagueData.league.name}の最新情報、順位表、試合結果、スタッツなど`,
    openGraph: {
      title: `${leagueData.league.name} | Football Hub`,
      description: `${leagueData.league.name}の最新情報、順位表、試合結果、スタッツなど`,
      images: [leagueData.league.logo],
    },
  };
}

export default async function LeagueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const season = Number(DEFAULT_SEASON);

  const leagueData = await getLeagueBySlug(slug);

  if (!leagueData) {
    notFound();
  }

  const { league, country, seasons } = leagueData;

  // SeasonSelector 用の表示可能シーズンを算出
  // 現在のデフォルトシーズンより+1を除外
  const seasonYears: number[] = Array.isArray(seasons)
    ? seasons.map((s: any) => Number(s.year)).filter((y: number) => !Number.isNaN(y))
    : [];
  const availableSeasons = seasonYears.filter((y) => y <= season);

  return (
    <PageLayout className="p-0">
      <div className="mb-6">
        <LeagueHeader league={league} country={country}>
          <LeagueNavigation slug={slug}>
            <SeasonSelector currentSeason={season} availableSeasons={availableSeasons} />
          </LeagueNavigation>
        </LeagueHeader>
      </div>
      {children}
    </PageLayout>
  );
}
