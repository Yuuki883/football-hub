import { Metadata } from 'next';
import { Suspense } from 'react';
import NewsHighlights from '@/features/news/components/NewsHighlights';
import AllMatchesSection from '@/features/matches/components/AllMatchesSection';
import LeagueNavigation from '@/features/leagues/components/common/HomeLeagueNavigation';

export const metadata: Metadata = {
  title: 'Football Hub | 欧州サッカー5大リーグの最新情報・試合結果',
  description:
    '欧州5大リーグ、欧州大会の最新情報をリアルタイムで提供。試合結果、順位表、スタッツ、ニュースなど、サッカーファンに必要な情報を網羅。',
  openGraph: {
    title: 'Football Hub | 欧州サッカー5大リーグの最新情報・試合結果',
    description:
      '欧州5大リーグ、欧州大会の最新情報をリアルタイムで提供。試合結果、順位表、スタッツ、ニュースなど、サッカーファンに必要な情報を網羅。',
    type: 'website',
  },
};

// ISR - 30分ごとに再検証
export const revalidate = 1800;

export default function HomePage() {
  return (
    <main className="pb-10 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      {/* 試合一覧 */}
      <section className="py-8 bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4">
          <Suspense fallback={<div>試合情報を読み込み中...</div>}>
            <AllMatchesSection />
          </Suspense>
        </div>
      </section>

      {/* リーグ一覧 */}
      <section className="py-8 bg-white dark:bg-gray-800 shadow-md mt-4">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">リーグ一覧</h2>
          <LeagueNavigation />
        </div>
      </section>

      {/* ニュース一覧 */}
      <section className="py-8 mt-4">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">最新ニュース</h2>
          <NewsHighlights />
        </div>
      </section>
    </main>
  );
}
