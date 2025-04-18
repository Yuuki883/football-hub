import { fetchNews } from '@/lib/services/news-service';
import NewsGrid from '@/components/news/NewsGrid';
import Link from 'next/link';

export default async function NewsHighlightsSection() {
  // サーバー側でデータを直接取得
  const news = await fetchNews();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Link
          href="/news"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          すべてのニュースを見る
        </Link>
      </div>

      {/* クライアントコンポーネントにニュースデータを渡す */}
      <NewsGrid initialNews={news} />
    </div>
  );
}
