// src/app/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import LiveScoreboard from '@/components/matches/live-scoreboard';
import { fetchNews } from '@/lib/rss';

export const metadata: Metadata = {
  title: 'FootballHub - リアルタイムでサッカーを体験',
  description:
    'サッカーの試合結果、ライブスコア、詳細な分析をひとつのプラットフォームで提供。最新のサッカー情報をリアルタイムでチェック。',
};

// ISR - 30分ごとに再検証
export const revalidate = 1800;

export default async function HomePage() {
  const news = await fetchNews();
  console.log('News in page.tsx:', news);
  const latestNews = news.slice(0, 5);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヒーローセクション */}
      <section className="relative bg-blue-900 text-white py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-900 opacity-90"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              リアルタイムでサッカーを体験
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              スコア、統計、分析をひとつのプラットフォームで
            </p>
            <Link
              href="/matches"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors"
            >
              ライブマッチ
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ライブスコアセクション */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              ライブスコア
            </h2>
            <Link
              href="/matches?tab=live"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              すべて見る
            </Link>
          </div>
          <LiveScoreboard />
        </div>
      </section>

      {/* 注目の試合 */}
      <section className="py-8 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              注目の試合
            </h2>
            <Link
              href="/matches"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              もっと見る
            </Link>
          </div>
        </div>
      </section>

      {/* ニュースセクション */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            最新ニュース
          </h2>
          {news.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                現在、ニュースを取得できません。しばらくしてから再度お試しください。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <a
                  key={item.link}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {item.image && (
                    <div className="relative h-48">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.pubDate).toLocaleDateString('ja-JP')}
                    </span>
                    <h3 className="font-semibold text-lg mt-1 mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                      {item.content}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
          <div className="mt-6 text-center">
            <Link
              href="/news"
              className="inline-flex items-center text-blue-600 hover:underline dark:text-blue-400"
            >
              すべてのニュースを見る
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* xG分析セクション */}
      <section className="py-8 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              xG分析
            </h2>
            <Link
              href="/analysis"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              分析センターへ
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
