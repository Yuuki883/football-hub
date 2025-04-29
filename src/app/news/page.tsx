import { fetchNews } from '@/lib/services/news-service';
import NewsGrid from '@/components/news/NewsGrid';
import { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';

export const metadata: Metadata = {
  title: 'サッカーニュース | FootballHub',
  description: '欧州5大リーグ、欧州大会、代表戦の最新ニュース情報',
};

// 30分ごとに再検証 (ISR)
export const revalidate = 1800;

export default async function NewsPage() {
  // サーバー側でデータを直接取得（より多くのニュースを表示）
  const news = await fetchNews(24);

  return (
    <PageLayout>
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        サッカーニュース
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <NewsGrid initialNews={news} />
      </div>
    </PageLayout>
  );
}
