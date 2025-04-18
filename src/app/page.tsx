// src/app/page.tsx
import { Metadata } from 'next';
import LiveMatchesCarousel from '@/components/home/LiveMatchesCarousel';
import LeagueNavigation from '@/components/home/LeagueNavigation';
import TopMatchesGrid from '@/components/home/TopMatchesGrid';
import NewsHighlights from '@/components/home/NewsHighlights';
import LeagueMatchesSection from '@/components/home/LeagueMatchesSection';

export const metadata: Metadata = {
  title: 'FootballHub - サッカー試合&ニュースポータル',
  description: '欧州5大リーグ、欧州大会、代表戦の最新情報をリアルタイムで提供',
};

// ISR - 30分ごとに再検証
export const revalidate = 1800;

export default async function HomePage() {
  return (
    <main className="pb-10 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      {/* ライブマッチ */}
      <section className="pt-4 pb-8">
        <LiveMatchesCarousel />
      </section>

      {/* リーグナビゲーション */}
      <section className="container mx-auto px-4">
        <LeagueNavigation />
      </section>

      {/* 注目の試合グリッド */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            注目の試合
          </h2>
          <TopMatchesGrid />
        </div>
      </section>

      {/* リーグ別試合セクション */}
      <section className="py-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <LeagueMatchesSection />
        </div>
      </section>

      {/* ニュースセクション */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            最新ニュース
          </h2>
          <NewsHighlights />
        </div>
      </section>
    </main>
  );
}
