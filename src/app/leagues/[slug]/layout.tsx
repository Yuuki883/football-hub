import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import LeagueHeader from './components/LeagueHeader';
import LeagueNavigation from './components/LeagueNavigation';
import SeasonSelector from './components/SeasonSelector';
import PageLayout from '@/components/layout/PageLayout';
import { getLeagueBySlug } from '@/features/leagues/api/league-info';

interface LeagueLayoutProps {
  children: React.ReactNode;
  params: {
    slug: string;
  };
  searchParams?: {
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
  searchParams = {}, // デフォルト値を設定
}: LeagueLayoutProps) {
  const { slug } = params;
  const season = parseInt(searchParams?.season || '2024');

  const leagueData = await getLeagueBySlug(slug);

  if (!leagueData) {
    notFound();
  }

  const { league, country } = leagueData;

  return (
    <PageLayout className="p-0">
      <div className="mb-6">
        <LeagueHeader league={league} country={country}>
          <LeagueNavigation slug={slug}>
            <SeasonSelector currentSeason={season} />
          </LeagueNavigation>
        </LeagueHeader>
      </div>
      {children}
    </PageLayout>
  );
}
