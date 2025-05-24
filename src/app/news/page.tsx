import { fetchNews } from '@/features/news/api/news';
import NewsGrid from '@/features/news/components/NewsGrid';
import { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';

export const metadata: Metadata = {
  title: 'サッカーニュース | FootBallHub',
  description: '欧州5大リーグ、欧州大会、代表戦の最新ニュース情報',
};

// 30分ごとに再検証 (ISR)
export const revalidate = 1800;

export default async function NewsPage() {
  // サーバー側でデータを直接取得
  const news = await fetchNews(18);

  return (
    <PageLayout>
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">サッカーニュース</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <NewsGrid initialNews={news} />
      </div>
    </PageLayout>
  );
}
